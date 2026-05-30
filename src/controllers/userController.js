const User = require('../models/userModel');

exports.followUser = async (req, res) => {
    try {
        const id_seguido = req.params.id_usuario;
        const id_seguidor = req.user.id;
        
        if (id_seguidor !== parseInt(id_seguido, 10)){
            await User.follow(id_seguidor, id_seguido);
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
        
        await User.unfollow(id_seguidor, id_seguido);
        res.redirect(`/profile/${id_seguido}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al dejar de seguir al usuario');
    }
}

exports.getProfile = async (req, res) => {
    try {
        const id_usuario = req.params.id_usuario;
        const userProfile = await User.getProfile(id_usuario);
        if (!userProfile) {
            return res.status(404).send('Usuario no encontrado');
        }
    } catch(error) {
        console.error(error);
        res.status(500).send('Error al cargar el perfil');
    }
}
