const User = require('../models/userModel');



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
