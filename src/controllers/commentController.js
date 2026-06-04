const Comment = require('../models/commentModel');
const Notification = require('../models/NotificationModel');
const { Post } = require('../models/postModel')

exports.getComments = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const comments = await Comment.getComments(id_publicacion);
        res.render('post-detail', { title: 'Detalles de la publicación', post: comments });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los comentarios');
    }
}

exports.addComments = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const { texto_comentario } = req.body;
        const id_usuario_origen = req.user.id;
        const autor = await Post.getAuthor(id_publicacion);
        const id_usuario_destino = autor.id_usuario;
        await Comment.addComments(id_publicacion, id_usuario_origen, texto_comentario);
        await Notification.createNotification(id_publicacion, id_usuario_destino, id_usuario_origen, 'comentario', new Date());
        res.redirect(`/posts-detail/${id_publicacion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar el comentario');
    }
}
