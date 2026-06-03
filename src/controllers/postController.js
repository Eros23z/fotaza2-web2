const { Post, search } = require('../models/postModel');
const applyWatermark = require('../services/imageService');
const fs = require('fs');
const path = require('path');

exports.createPost = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login');
        const { titulo, descripcion, tiene_copyright, comentarios_cerrados } = req.body;
        const nombre_tag = req.body.nombre_tag.split(',');
        const user = req.user.id;

        const cerrado = (comentarios_cerrados === '1');

        const id_publicacion = await Post.create(titulo, descripcion, user, cerrado);
        let marca_agua = false;
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                let urlImagen = `/uploads/${file.filename}`; 
                const copyright = (tiene_copyright === '1');
                if (copyright) {
                    try {
                        const imagenOriginal = path.join(process.cwd(), 'public', 'uploads', file.filename);
                        const resultado = await applyWatermark(imagenOriginal, file.originalname);
                        const nombreFinal = resultado.filename;
                        
                        const dirDestino = path.join(process.cwd(), 'public', 'watermark-images');
                        await fs.promises.mkdir(dirDestino, { recursive: true });
                        const rutaCompleta = path.join(dirDestino, nombreFinal);
 
                        await fs.promises.writeFile(rutaCompleta, resultado.buffer);
                        urlImagen = `/watermark-images/${nombreFinal}`;
                        marca_agua = true;
                    } catch (error) {
                        return res.status(500).send('Error al aplicar marca de agua, intenta de nuevo');
                    }
                } else {
                    urlImagen = `/uploads/${file.filename}`;
                    marca_agua = false;
                }
                await Post.addImage(id_publicacion, urlImagen, copyright, marca_agua);
            }
        }
        if (nombre_tag && nombre_tag.length > 0) {
            for (let tag of nombre_tag) {
                tag = tag.trim();
                if (!tag) continue;
                let id_tag;
                const existingTag = await Post.getTag(tag);
                if (!existingTag) {
                    id_tag = await Post.createTag(tag);
                } else {
                    id_tag = existingTag.id_tag;
                }
                await Post.linkTagToPost(id_publicacion, id_tag);
            }
        }
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al crear la publicación');
    }
}

exports.getPostDetail = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const post = await Post.getPostDetail(id_publicacion);
        
        let userHasRated = false;
        let isAuthor = false;
        
        if (req.user && post) {
            isAuthor = (req.user.id === post.id_usuario);
            if (post.id_imagen) {
                userHasRated = await Post.userHasRated(req.user.id, post.id_imagen);
            }
        }
        
        res.render('post-detail', { 
            title: 'Detalles de la publicación', 
            post: post,
            userHasRated: userHasRated,
            isAuthor: isAuthor
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los detalles de la publicación');
    }
}

exports.getComments = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const comments = await Post.getComments(id_publicacion);
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
        const user = req.user.id;
        await Post.addComments(id_publicacion, user, texto_comentario);
        res.redirect(`/posts-detail/${id_publicacion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar el comentario');
    }
}

exports.searchPosts = async (req, res) => {
    try {
        const { buscar } = req.query;
        if (!buscar) {
            return res.redirect('/');
        }
        const posts = await search(buscar);
        res.render('index', { title: 'Resultados para: ' + buscar, posts: posts, searchTerm: buscar });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al buscar publicaciones');
    }
}

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
        
        const userRated = await Post.userHasRated(user, post.id_imagen);
        if (userRated) {
            return res.status(403).send('Ya has valorado esta publicación');
        }
        
        await Post.addRating(user, post.id_imagen, parseInt(puntaje));
        res.redirect(`/posts-detail/${id_publicacion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al agregar la valoración');
    }
}

exports.getPostByUser = async (req, res) => {
    try {
        const { id_usuario } = req.params.id_usuario;
        const userPosts = await Post.getPostsByUser(id_usuario);
        res.render('profile', { title: 'Perfil', userPosts: userPosts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener las publicaciones');
    }
}