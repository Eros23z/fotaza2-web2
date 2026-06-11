const { Post, search, searchAdvanced } = require('../models/postModel');
const Rate = require('../models/rateModel');
const applyWatermark = require('../services/imageService');
const fs = require('fs');
const path = require('path');
const Collection = require('../models/collectionModel');

const { createClient } = require('@supabase/supabase-js');
let supabase;
if (process.env.STORAGE_TYPE === 'supabase') {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

exports.createPost = async (req, res) => {
    try {
        if (!req.user) return res.redirect('/login');
        const { titulo, descripcion, comentarios_cerrados, nombre_tag } = req.body;
        const user = req.user.id;
        const cerrado = (comentarios_cerrados === '1');

        const id_publicacion = await Post.create(titulo, descripcion, user, cerrado);

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const copyright = (req.body[`tiene_copyright_${i}`] === '1');
                const watermarkText = req.body[`watermark_text_${i}`];
                
                let urlImagen = '';
                let finalBuffer = file.buffer;
                let filename = '';
                let folder = 'uploads';
                let marca_agua = false;

                const ext = path.extname(file.originalname);
                const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
                filename = `${uniqueId}${ext}`;

                if (copyright) {
                    try {
                        const resultado = await applyWatermark(file.buffer, file.originalname, watermarkText);
                        finalBuffer = resultado.buffer;
                        filename = `${uniqueId}-${resultado.filename}`;
                        folder = 'watermark-images';
                        marca_agua = true;
                    } catch (error) {
                        console.error('Error al aplicar la marca de agua:', error);
                        return res.status(500).send('Error al aplicar marca de agua, intenta de nuevo');
                    }
                }

                if (process.env.STORAGE_TYPE === 'supabase') {
                    const bucketName = process.env.SUPABASE_BUCKET || 'imagenes-fotaza';
                    const filePath = `${folder}/${filename}`;
                    const { data, error } = await supabase.storage
                        .from(bucketName)
                        .upload(filePath, finalBuffer, {
                            contentType: file.mimetype,
                            upsert: true
                        });
                    if (error) {
                        console.error('Error al subir a supabase:', error);
                        return res.status(500).send('Error al subir la imagen a Supabase');
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from(bucketName)
                        .getPublicUrl(filePath);

                    urlImagen = publicUrl;
                } else {
                    const dirDestino = path.join(__dirname, '../public', folder);
                    await fs.promises.mkdir(dirDestino, { recursive: true });
                    const rutaCompleta = path.join(dirDestino, filename);
                    await fs.promises.writeFile(rutaCompleta, finalBuffer);

                    urlImagen = `/${folder}/${filename}`;
                }

                await Post.addImage(id_publicacion, urlImagen, copyright, marca_agua);
            }
        }

        if (nombre_tag) {
            const tags = nombre_tag.split(',');
            for (let tag of tags) {
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
        
        let ratedImageIds = [];
        let isAuthor = false;
        let collections = [];
        
        if (req.user && post) {
            isAuthor = (req.user.id === post.id_usuario);
            ratedImageIds = await Rate.getUserRatedImageIdsForPost(req.user.id, id_publicacion);
            collections = await Collection.getUserCollections(req.user.id);
        }
        
        res.render('post-detail', { 
            title: 'Detalles de la publicación', 
            post: post,
            ratedImageIds: ratedImageIds,
            isAuthor: isAuthor,
            collections: collections
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al obtener los detalles de la publicación');
    }
}

exports.searchPosts = async (req, res) => {
    try {
        const keyword = req.query.buscar || req.query.q || '';
        const { licencia, rating_min, fecha, tag } = req.query;

        if (!keyword && !licencia && !rating_min && !fecha && !tag) {
            return res.redirect('/');
        }

        const posts = await searchAdvanced({ keyword, licencia, rating_min, fecha, tag });
        
        res.render('index', { 
            title: 'Resultados de búsqueda avanzada', 
            posts: posts, 
            searchTerm: keyword,
            filters: { licencia, rating_min, fecha, tag }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al buscar publicaciones');
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

exports.closeComments = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const post = await Post.getPostDetail(id_publicacion);
        if (!post) {
            return res.status(404).send('Publicación no encontrada');
        }
        if (req.user.id !== post.id_usuario) {
            return res.status(403).send('No estás autorizado para realizar esta acción');
        }
        await Post.closeComments(id_publicacion);
        res.redirect(`/posts-detail/${id_publicacion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cerrar los comentarios');
    }
}

exports.deletePost = async (req, res) => {
    try {
        const { id_publicacion } = req.params;
        const post = await Post.getPostDetail(id_publicacion);
        if (!post) {
            return res.status(404).send('Publicación no encontrada');
        }
        if (req.user.id !== post.id_usuario) {
            return res.status(403).send('No estás autorizado para realizar esta acción');
        }
        await Post.delete(id_publicacion);
        res.redirect(`/profile/${req.user.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar la publicación');
    }
}