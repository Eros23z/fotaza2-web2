const Rate = require('../models/rateModel');
const { Post } = require('../models/postModel');
const Notification = require('../models/NotificationModel');

exports.addRating = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const { puntaje } = req.body;
        const user = req.user.id;
        
        const post = await Post.getPostDetail(id_publicacion);
        if (!post) {
            return res.status(404).send('Publicación no encontrada');
        }
        
        if (!post.id_imagen) {
            return res.status(400).send('Esta publicación no tiene una imagen para valorar');
        }
        
        if (user === post.id_usuario) {
            return res.status(403).send('No puedes valorar tu propia publicación');
        }
        
        const userRated = await Rate.userHasRated(user, post.id_imagen);
        if (userRated) {
            return res.status(403).send('Ya has valorado esta publicación');
        }
        
        await Rate.addRating(user, post.id_imagen, parseInt(puntaje, 10));
        await Notification.createNotification(id_publicacion, post.id_usuario, user, 'valoracion', new Date());
        res.redirect(`/posts-detail/${id_publicacion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar la valoración');
    }
}
