const db = require('../config/db');

const Message = {
    createMessage: async (id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje) => {
        const query = `INSERT INTO mensajes (id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje) VALUES ($1, $2, $3, $4)`;
        await db.query(query, [id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje]);
    }
}

module.exports = Message;