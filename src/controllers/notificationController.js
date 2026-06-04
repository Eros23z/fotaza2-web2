const Notification = require('../models/NotificationModel');
const { Post } = require('../models/postModel');
const Message = require('../models/messageModel');

exports.interestPostNotification = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const id_usuario_origen = req.user.id;
        const autor = await Post.getAuthor(id_publicacion);
        const id_usuario_destino = autor.id_usuario;
        const fecha_notificacion = new Date();
        await Notification.createNotification(id_publicacion, id_usuario_destino, id_usuario_origen, 'me_interesa', fecha_notificacion);
        await Message.createMessage(id_usuario_origen, id_usuario_destino, '¡Hola! Vi tu publicación y me interesa', fecha_notificacion);
        res.redirect(`/posts-detail/${id_publicacion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al notificar el interés');
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const notifications = await Notification.getNotifications(id_usuario);
        res.render('notifications', { title: 'Notificaciones', notifications: notifications });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar las notificaciones');
    }
};

exports.createNotification = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const id_usuario_origen = req.user.id;
        const autor = await Post.getAuthor(id_publicacion);
        const id_usuario_destino = autor.id_usuario;
        const fecha_notificacion = new Date();
        await Notification.createNotification(id_publicacion, id_usuario_destino, id_usuario_origen, 'nuevo_seguidor', fecha_notificacion);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al notificar el nuevo seguidor');
    }
};