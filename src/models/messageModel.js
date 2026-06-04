const db = require('../config/db');

const Message = {
    createMessage: async (id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje) => {
        const query = `INSERT INTO mensajes (id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje) VALUES ($1, $2, $3, $4)`;
        await db.query(query, [id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje]);
    },

    getConversation: async (id_usuario1, id_usuario2) => {
        const query = `SELECT * FROM mensajes WHERE (id_usuario_envia = $1 AND id_usuario_recibe = $2) OR (id_usuario_envia = $2 AND id_usuario_recibe = $1) ORDER BY fecha_mensaje ASC`;
        const { rows } = await db.query(query, [id_usuario1, id_usuario2]);
        return rows;
    },

    getMessages: async (id_usuario) => {
        const query = `
            SELECT DISTINCT u.id_usuario, u.username
            FROM usuarios u
            JOIN mensajes m ON (m.id_usuario_envia = u.id_usuario OR m.id_usuario_recibe = u.id_usuario)
            WHERE (m.id_usuario_envia = $1 OR m.id_usuario_recibe = $1) AND u.id_usuario != $1
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return rows;
    },
}

module.exports = Message;