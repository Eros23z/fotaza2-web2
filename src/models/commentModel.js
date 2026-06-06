const db = require('../config/db');

const Comment = {
    addComments: async (id_publicacion, id_usuario, comentario) => {
        const query = `INSERT INTO comentarios (id_publicacion, id_usuario, texto_comentario) VALUES ($1, $2, $3)`;
        await db.query(query, [id_publicacion, id_usuario, comentario]);
    },

    getCommentAuthor: async (id_comentario) => {
        const query = `SELECT id_usuario FROM comentarios WHERE id_comentario = $1`;
        const { rows } = await db.query(query, [id_comentario]);
        return rows[0];
    },

    getCommentPostAuthor: async (id_comentario) => {
        const query = `
            SELECT p.id_usuario 
            FROM comentarios c
            JOIN publicaciones p ON c.id_publicacion = p.id_publicacion
            WHERE c.id_comentario = $1
        `;
        const { rows } = await db.query(query, [id_comentario]);
        return rows[0];
    }
};

module.exports = Comment;
