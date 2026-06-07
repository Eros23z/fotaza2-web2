const db = require('../config/db');

const Post = {
    getAllWithImages: async () => {
        const query = `
            SELECT p.*, MAX(i.imagen_url) as imagen_url, u.username,
                   AVG(v.puntaje) as promedio_rating,
                   COUNT(v.puntaje) as total_votos
            FROM publicaciones p
            LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN valoraciones_imagen v ON i.id_imagen = v.id_imagen
            WHERE p.filtrada = false
            GROUP BY p.id_publicacion, u.username
            ORDER BY 
                CASE 
                    WHEN COUNT(v.puntaje) >= 2 AND AVG(v.puntaje) >= 4.0 THEN 1
                    ELSE 2
                END ASC,
                p.fecha_publicacion DESC;
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    create: async (titulo, descripcion, id_usuario, comentarios_cerrados = false) => {
        const query = `
            INSERT INTO publicaciones (id_usuario, titulo, descripcion, comentarios_cerrados) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id_publicacion
        `;
        const { rows } = await db.query(query, [id_usuario, titulo, descripcion, comentarios_cerrados]);
        return rows[0].id_publicacion;
    },

    addImage: async (id_publicacion, url, tiene_copyright, marca_agua) => {
        const query = `INSERT INTO imagenes (id_publicacion, imagen_url, tiene_copyright, marca_agua) VALUES ($1, $2, $3, $4)`;
        await db.query(query, [id_publicacion, url, tiene_copyright, marca_agua]);
    },

    createTag: async (nombre_tag) => {
        const query = `INSERT INTO etiquetas (nombre_tag) VALUES ($1) RETURNING id_tag`;
        const { rows } = await db.query(query, [nombre_tag]);
        return rows[0].id_tag;
    },

    linkTagToPost: async (id_publicacion, id_tag) => {
        const query = `INSERT INTO publicacion_etiqueta (id_publicacion, id_tag) VALUES ($1, $2)`;
        await db.query(query, [id_publicacion, id_tag]);
    },

    getTag: async (nombre_tag) => {
        const query = `SELECT id_tag FROM etiquetas WHERE nombre_tag = $1`;
        const { rows } = await db.query(query, [nombre_tag]);
        return rows[0];
    },

    getPostDetail: async (id_publicacion) => {
        const postQuery = `
            SELECT p.*, u.username
            FROM publicaciones p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_publicacion = $1 AND p.filtrada = false;
        `;
        const postResult = await db.query(postQuery, [id_publicacion]);
        const post = postResult.rows[0];
        if (!post) return null;

        const imagesQuery = `
            SELECT i.*, 
                   AVG(v.puntaje) as promedio, 
                   COUNT(v.puntaje) as total_votos
            FROM imagenes i
            LEFT JOIN valoraciones_imagen v ON i.id_imagen = v.id_imagen
            WHERE i.id_publicacion = $1
            GROUP BY i.id_imagen
            ORDER BY i.id_imagen ASC;
        `;
        const imagesResult = await db.query(imagesQuery, [id_publicacion]);
        post.imagenes = imagesResult.rows;

        const commentsQuery = `
            SELECT c.*, u.username as username_comentario
            FROM comentarios c
            JOIN usuarios u ON c.id_usuario = u.id_usuario
            WHERE c.id_publicacion = $1 AND c.filtrado = false
            ORDER BY c.fecha_comentario DESC;
        `;
        const commentsResult = await db.query(commentsQuery, [id_publicacion]);
        post.comentarios = commentsResult.rows;

        const tagsQuery = `
            SELECT t.nombre_tag
            FROM etiquetas t
            JOIN publicacion_etiqueta pe ON t.id_tag = pe.id_tag
            WHERE pe.id_publicacion = $1;
        `;
        const tagsResult = await db.query(tagsQuery, [id_publicacion]);
        post.etiquetas = tagsResult.rows;

        return post;
    },

    getAuthor: async (id_publicacion) => {
        const query = `SELECT id_usuario FROM publicaciones WHERE id_publicacion = $1`;
        const { rows } = await db.query(query, [id_publicacion]);
        return rows[0];
    },

    getPostsByUser: async (id_usuario) => {
        const query = `
            SELECT p.*, i.imagen_url, u.username
            FROM publicaciones p
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
            WHERE p.id_usuario = $1
            ORDER BY p.fecha_publicacion DESC;
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return rows;
    },

    closeComments: async (id_publicacion) => {
        const query = `UPDATE publicaciones SET comentarios_cerrados = true WHERE id_publicacion = $1`;
        await db.query(query, [id_publicacion]);
    },

    getPostsFromFollowing: async (id_usuario) => {
        const query = `
            SELECT p.*, i.imagen_url, u.username
            FROM publicaciones p
            LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_usuario IN (
                SELECT id_seguido
                FROM seguidores
                WHERE id_seguidor = $1
            ) AND p.filtrada = false
            ORDER BY p.fecha_publicacion DESC;
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return rows;
    }
};

const search = async (term) => {
    const query = `
        SELECT DISTINCT p.*, i.imagen_url, u.username
        FROM publicaciones p
        LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        LEFT JOIN publicacion_etiqueta pe ON p.id_publicacion = pe.id_publicacion
        LEFT JOIN etiquetas t ON pe.id_tag = t.id_tag
        WHERE p.titulo ILIKE $1 
           OR p.descripcion ILIKE $1 
           OR t.nombre_tag ILIKE $1
        ORDER BY p.fecha_publicacion DESC;
    `;
    const { rows } = await db.query(query, [`%${term}%`]);
    return rows;
};

const searchAdvanced = async (filters) => {
    const { keyword, licencia, rating_min, fecha, tag } = filters;
    let query = `
        SELECT p.*, MAX(i.imagen_url) as imagen_url, u.username,
               AVG(v.puntaje) as promedio_rating
        FROM publicaciones p
        LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        LEFT JOIN publicacion_etiqueta pe ON p.id_publicacion = pe.id_publicacion
        LEFT JOIN etiquetas t ON pe.id_tag = t.id_tag
        LEFT JOIN valoraciones_imagen v ON i.id_imagen = v.id_imagen
        WHERE p.filtrada = false
    `;
    
    const params = [];
    let paramIndex = 1;

    if (keyword) {
        params.push(`%${keyword}%`);
        query += ` AND (p.titulo ILIKE $${paramIndex} OR p.descripcion ILIKE $${paramIndex} OR t.nombre_tag ILIKE $${paramIndex})`;
        paramIndex++;
    }

    if (licencia === 'copyright') {
        query += ` AND i.tiene_copyright = true`;
    } else if (licencia === 'public') {
        query += ` AND (i.tiene_copyright = false OR i.tiene_copyright IS NULL)`;
    }

    if (tag) {
        params.push(tag);
        query += ` AND t.nombre_tag = $${paramIndex}`;
        paramIndex++;
    }

    if (fecha === 'recientes') {
        query += ` AND p.fecha_publicacion >= NOW() - INTERVAL '1 day'`;
    } else if (fecha === 'semana') {
        query += ` AND p.fecha_publicacion >= NOW() - INTERVAL '7 days'`;
    } else if (fecha === 'mes') {
        query += ` AND p.fecha_publicacion >= NOW() - INTERVAL '30 days'`;
    }

    query += ` GROUP BY p.id_publicacion, u.username`;

    if (rating_min) {
        params.push(parseFloat(rating_min));
        query += ` HAVING AVG(v.puntaje) >= $${paramIndex}`;
        paramIndex++;
    }

    query += ` ORDER BY p.fecha_publicacion DESC;`;

    const { rows } = await db.query(query, params);
    return rows;
};

module.exports = { Post, search, searchAdvanced };