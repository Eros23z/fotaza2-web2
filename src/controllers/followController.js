const Follow = require('../models/followModel');
const Notification = require('../models/NotificationModel');

exports.followUser = async (req, res) => {
    try {
        const id_seguido = req.params.id_usuario;
        const id_seguidor = req.user.id;
        
        if (id_seguidor !== parseInt(id_seguido, 10)) {
            await Follow.follow(id_seguidor, id_seguido);
            await Notification.createNotification(null, id_seguido, id_seguidor, 'nuevo_seguidor', new Date());
            res.redirect(`/profile/${id_seguido}`);
        } else {
            res.status(400).send('No puedes seguirte a ti mismo');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al seguir al usuario');
    }
}

exports.unfollowUser = async (req, res) => {
    try {
        const id_seguido = req.params.id_usuario;
        const id_seguidor = req.user.id;
        
        await Follow.unfollow(id_seguidor, id_seguido);
        res.redirect(`/profile/${id_seguido}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al dejar de seguir al usuario');
    }
}
