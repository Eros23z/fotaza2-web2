const Messages = require('../models/messageModel');
const User = require('../models/userModel');

exports.getMessages = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const messages = await Messages.getMessages(id_usuario);
        res.render('messages', { title: 'Mensajes', messages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar los mensajes');
    }
}

exports.getConversation = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const id_usuario_recibe = req.params.id_usuario_recibe;
        
        const contactUser = await User.getProfile(id_usuario_recibe);
        if (!contactUser) {
            return res.status(404).send('Usuario no encontrado');
        }

        const conversation = await Messages.getConversation(id_usuario, id_usuario_recibe);
        res.render('conversation', { 
            title: `Chat con @${contactUser.username}`, 
            conversation,
            contactUser,
            currentUser: id_usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la conversación');
    }
}

exports.sendMesssages = async (req, res) => {
    try {
        const id_usuario_envia = req.user.id;
        const id_usuario_recibe = req.params.id_usuario_recibe;
        const texto_mensaje = req.body.texto_mensaje;
        const fecha_mensaje = new Date();
        await Messages.createMessage(id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje);
        res.redirect(`/messages/${id_usuario_recibe}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al enviar el mensaje');
    }
}