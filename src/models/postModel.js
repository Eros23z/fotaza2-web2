const db = require('../config/db');

const Post = {
    getAllWithImages: async () => {
        const query = `
            SELECT p.*, i.imagen_url, u.username 
            FROM publicaciones p
            LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.filtrada = false
            ORDER BY p.fecha_publicacion DESC;
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

    addImage: async (id_publicacion, url, tiene_copyright) => {
        const query = `INSERT INTO imagenes (id_publicacion, imagen_url, tiene_copyright) VALUES ($1, $2, $3)`;
        await db.query(query, [id_publicacion, url, tiene_copyright]);
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
            SELECT p.*, i.id_imagen, i.imagen_url, u.username
            FROM publicaciones p
            LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
            JOIN usuarios u ON p.id_usuario = u.id_usuario
            WHERE p.id_publicacion = $1 AND p.filtrada = false;
        `;
        const postResult = await db.query(postQuery, [id_publicacion]);
        const post = postResult.rows[0];
        if (!post) return null;

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

        const ratingQuery = `
            SELECT AVG(v.puntaje) as promedio, COUNT(*) as total_votos
            FROM valoraciones_imagen v
            JOIN imagenes i ON v.id_imagen = i.id_imagen
            WHERE i.id_publicacion = $1;
        `;
        const ratingResult = await db.query(ratingQuery, [id_publicacion]);
        post.valoracion = ratingResult.rows[0];
        return post;
    },

    addComments: async (id_publicacion, id_usuario, comentario) => {
        const query = `INSERT INTO comentarios (id_publicacion, id_usuario, texto_comentario) VALUES ($1, $2, $3)`;
        await db.query(query, [id_publicacion, id_usuario, comentario]);
    },

    addRating: async (id_usuario, id_imagen, puntaje) => {
        const query = `INSERT INTO valoraciones_imagen (id_usuario, id_imagen, puntaje) VALUES ($1, $2, $3)`;
        await db.query(query, [id_usuario, id_imagen, puntaje]);
    },

    getAuthor: async (id_publicacion) => {
        const query = `SELECT id_usuario FROM publicaciones WHERE id_publicacion = $1`;
        const { rows } = await db.query(query, [id_publicacion]);
        return rows[0];
    },

    userHasRated: async (id_usuario, id_imagen) => {
        const query = `SELECT * FROM valoraciones_imagen WHERE id_usuario = $1 AND id_imagen = $2`;
        const { rows } = await db.query(query, [id_usuario, id_imagen]);
        return rows.length > 0;
    },

    getAverageRating: async (id_imagen) => {
        const query = `SELECT AVG(puntaje) as promedio FROM valoraciones_imagen WHERE id_imagen = $1`;
        const { rows } = await db.query(query, [id_imagen]);
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

    getCommentAuthor: async (id_comentario) => {
        const query = `SELECT id_usuario FROM comentarios WHERE id_comentario = $1`;
        const { rows } = await db.query(query, [id_comentario]);
        return rows[0];
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

const getPostFromFollowing = async (id_usuario) => {
    const query = `
        SELECT p.*, i.imagen_url, u.username
        FROM publicaciones p
        LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
        JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE p.id_usuario IN (
            SELECT id_usuario_seguido
            FROM seguidores
            WHERE id_usuario = $1
        )
        ORDER BY p.fecha_publicacion DESC;
    `;
    const { rows } = await db.query(query, [id_usuario]);
    return rows;
};

module.exports = { Post, search, getPostFromFollowing };