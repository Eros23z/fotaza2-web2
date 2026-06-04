const db = require('../config/db');

const Notification = {
    createNotification: async (id_publicacion, id_usuario_destino, id_usuario_origen, tipo_evento, fecha_notificacion) => {
        const query = `INSERT INTO notificaciones (id_publicacion, id_usuario_destino, id_usuario_origen, tipo_evento, fecha_notificacion) VALUES ($1, $2, $3, $4, $5)`;
        await db.query(query, [id_publicacion, id_usuario_destino, id_usuario_origen, tipo_evento, fecha_notificacion]);
    },

    getNotifications: async (id_usuario) => {
        const query = `
        SELECT n.*, u.username as username, p.titulo as titulo
        FROM notificaciones n
        LEFT JOIN publicaciones p ON n.id_publicacion = p.id_publicacion
        LEFT JOIN usuarios u ON n.id_usuario_origen = u.id_usuario
        WHERE n.id_usuario_destino = $1
        ORDER BY n.fecha_notificacion DESC`;
        const { rows } = await db.query(query, [id_usuario]);
        return rows;
    },
}

module.exports = Notification;
