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

    markAsRead: async (id_notificacion, id_usuario_destino) => {
        const query = `UPDATE notificaciones SET leida = true WHERE id_notificacion = $1 AND id_usuario_destino = $2`;
        await db.query(query, [id_notificacion, id_usuario_destino]);
    },

    markAllAsRead: async (id_usuario_destino) => {
        const query = `UPDATE notificaciones SET leida = true WHERE id_usuario_destino = $1`;
        await db.query(query, [id_usuario_destino]);
    }
}

module.exports = Notification;
