const db = require('../config/db');

const Report = {
    reportPost: async (id_denunciante, id_publicacion, motivo, descripcion) => {
        const query = `
            INSERT INTO denuncias (id_denunciante, id_publicacion, motivo, descripcion)
            VALUES ($1, $2, $3, $4)
        `;
        await db.query(query, [id_denunciante, id_publicacion, motivo, descripcion]);
        const queryFiltroDenuncias = `
            SELECT COUNT(*) FROM denuncias WHERE id_publicacion = $1
        `;
        const { rows } = await db.query(queryFiltroDenuncias, [id_publicacion]);
        if(rows[0].count >= 3)
            await db.query(`UPDATE publicaciones SET filtrada = true WHERE id_publicacion = $1`, [id_publicacion]);
    },

    reportComment: async (id_denunciante, id_comentario, motivo, descripcion) => {
        const query = `
            INSERT INTO denuncias (id_denunciante, id_comentario, motivo, descripcion)
            VALUES ($1, $2, $3, $4)
        `;
        await db.query(query, [id_denunciante, id_comentario, motivo, descripcion]);
        const queryFiltroDenuncias = `
            SELECT COUNT(*) FROM denuncias WHERE id_comentario = $1
        `;
        const { rows } = await db.query(queryFiltroDenuncias, [id_comentario]);
        if(rows[0].count >= 3)
            await db.query(`UPDATE comentarios SET filtrado = true WHERE id_comentario = $1`, [id_comentario]);
    },

    countReports: async(id_publicacion, id_comentario) => {
        const query = `
            SELECT COUNT(*) FROM denuncias WHERE id_publicacion = $1 OR id_comentario = $2
        `;
        const { rows } = await db.query(query, [id_publicacion, id_comentario]);
        return rows[0].count;
    },

    getPendingReports: async() => {
        const query = `
            SELECT d.*, u.username as username_denunciante,
                   p.titulo as titulo_publicacion,
                   c.texto_comentario as texto_comentario
            FROM denuncias d
            JOIN usuarios u ON d.id_denunciante = u.id_usuario
            LEFT JOIN publicaciones p ON d.id_publicacion = p.id_publicacion
            LEFT JOIN comentarios c ON d.id_comentario = c.id_comentario
            WHERE d.estado = 'Pendiente'
            ORDER BY d.fecha_denuncia DESC;
        `;
        const { rows } = await db.query(query);
        return rows;
    },

    getReportById: async (id_denuncia) => {
        const query = `SELECT * FROM denuncias WHERE id_denuncia = $1`;
        const { rows } = await db.query(query, [id_denuncia]);
        return rows[0];
    },

    updateReportStatus: async (id_denuncia, estado) => {
        const query = `UPDATE denuncias SET estado = $2 WHERE id_denuncia = $1`;
        await db.query(query, [id_denuncia, estado]);
    },

    hidePost: async (id_publicacion) => {
        const query = `UPDATE publicaciones SET filtrada = true WHERE id_publicacion = $1`;
        await db.query(query, [id_publicacion]);
    },

    hideComment: async (id_comentario) => {
        const query = `UPDATE comentarios SET filtrado = true WHERE id_comentario = $1`;
        await db.query(query, [id_comentario]);
    },

    getPostId: async (id_comentario) => {
        const query = `SELECT id_publicacion FROM comentarios WHERE id_comentario = $1`;
        const { rows } = await db.query(query, [id_comentario]);
        return rows[0];
    },

    getCommentReportsForAuthor: async (id_autor) => {
        const query = `
            SELECT d.*, u.username as username_denunciante,
                   c.texto_comentario, c.id_publicacion, p.titulo as titulo_publicacion
            FROM denuncias d
            JOIN usuarios u ON d.id_denunciante = u.id_usuario
            JOIN comentarios c ON d.id_comentario = c.id_comentario
            JOIN publicaciones p ON c.id_publicacion = p.id_publicacion
            WHERE p.id_usuario = $1 AND d.estado = 'Pendiente'
            ORDER BY d.fecha_denuncia DESC;
        `;
        const { rows } = await db.query(query, [id_autor]);
        return rows;
    }
}

module.exports = Report;
