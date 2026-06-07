const Collection = require('../models/collectionModel');
const { Post } = require('../models/postModel');
const Notification = require('../models/NotificationModel');

exports.createCollection = async (req, res) => {
    try {
        const { nombre_collection } = req.body;
        const id_usuario = req.user.id;
        await Collection.createCollection(id_usuario, nombre_collection);
        res.redirect('/my-collections');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear la colección');
    }
}

exports.deleteCollection = async (req, res) => {
    try {
        const { id_collection } = req.params;
        const id_usuario = req.user.id;
        
        const col = await Collection.getCollectionById(id_collection);
        if (!col) {
            return res.status(404).send('Colección no encontrada');
        }
        if (id_usuario !== col.id_usuario) {
            return res.status(401).send('No autorizado');
        }

        await Collection.deleteCollection(id_collection);
        res.redirect('/my-collections');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar la colección');
    }
}

exports.deletePublicationFromCollection = async (req, res) => {
    try {
        const { id_publicacion, id_collection } = req.params;
        const id_usuario = req.user.id;

        const col = await Collection.getCollectionById(id_collection);
        if (!col) {
            return res.status(404).send('Colección no encontrada');
        }
        if (id_usuario !== col.id_usuario) {
            return res.status(401).send('No autorizado');
        }

        await Collection.deletePublicationFromCollection(id_publicacion, id_collection);
        res.redirect(`/collections/${id_collection}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar la publicación de la colección');
    }
}

exports.addPostToCollection = async (req, res) => {
    try {
        const { id_publicacion, id_collection } = req.params;
        const id_usuario = req.user.id;
        
        const col = await Collection.getCollectionById(id_collection);
        if (!col) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(404).json({ success: false, error: 'Colección no encontrada' });
            }
            return res.status(404).send('Colección no encontrada');
        }
        if (id_usuario !== col.id_usuario) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(401).json({ success: false, error: 'No autorizado' });
            }
            return res.status(401).send('No tienes permiso para agregar publicaciones a esta colección');
        }

        const exists = await Collection.isPostInCollection(id_publicacion, id_collection);
        if (exists) {
            if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
                return res.status(400).json({ success: false, error: 'Esta publicación ya se encuentra en esta colección' });
            }
            return res.status(400).send('Esta publicación ya se encuentra en esta colección');
        }

        await Collection.addPostToCollection(id_publicacion, id_collection);
        
        try {
            const post = await Post.getPostDetail(id_publicacion);
            if (post && post.id_usuario !== id_usuario) {
                await Notification.createNotification(
                    id_publicacion,
                    post.id_usuario,
                    id_usuario,
                    'guardada',
                    new Date()
                );
            }
        } catch (notifError) {
            console.error('Error al generar notificación de colección:', notifError);
        }
        
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.json({ success: true, message: 'Publicación agregada con éxito' });
        }
        res.redirect('/my-collections');
    } catch (error) {
        console.error(error);
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)) {
            return res.status(500).json({ success: false, error: 'Error interno' });
        }
        res.status(500).send('Error al agregar la publicación a la colección');
    }
}

exports.getUserCollections = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        await Collection.ensureFavoritesCollection(id_usuario);
        const collections = await Collection.getUserCollections(id_usuario);
        res.render('my-collections', { title: 'Mis Colecciones', collections });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener las colecciones');
    }
}

exports.getPostsInCollection = async (req, res) => {
    try {
        const { id_collection } = req.params;
        const id_usuario = req.user.id;

        const col = await Collection.getCollectionById(id_collection);
        if (!col) {
            return res.status(404).send('Colección no encontrada');
        }
        if (id_usuario !== col.id_usuario) {
            return res.status(401).send('No tienes permiso para ver esta colección');
        }

        const posts = await Collection.getPostsInCollection(id_collection);
        res.render('collection-detail', { title: `Colección: ${col.nombre_collection}`, collection: col, posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener las publicaciones de la colección');
    }
}