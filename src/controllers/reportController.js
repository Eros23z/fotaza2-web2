const Report = require('../models/reportModel');
const { Post } = require('../models/postModel');
const User = require('../models/userModel');
const Comment = require('../models/commentModel');

exports.reportPost = async (req, res) => {
    try {
        const { id_publicacion, motivo, descripcion } = req.body;
        const id_denunciante = req.user.id;
        const author = await Post.getAuthor(id_publicacion);
        if (author && id_denunciante == author.id_usuario) {
            return res.status(400).send('No puedes denunciar tu propia publicación');
        }
        await Report.reportPost(id_denunciante, id_publicacion, motivo, descripcion);
        res.redirect(`/posts-detail/${id_publicacion}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al denunciar la publicación');
    }
};

exports.reportComment = async (req, res) => {
    try {
        const { id_comentario, motivo, descripcion } = req.body;
        const id_denunciante = req.user.id;
        const author = await Comment.getCommentAuthor(id_comentario);
        if (author && id_denunciante == author.id_usuario) {
            return res.status(400).send('No puedes denunciar tu propio comentario');
        }
        await Report.reportComment(id_denunciante, id_comentario, motivo, descripcion);
        
        const commentRow = await Report.getPostId(id_comentario);
        if (commentRow) {
            res.redirect(`/posts-detail/${commentRow.id_publicacion}`);
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al denunciar el comentario');
    }
};

exports.getPendingReports = async (req, res) => {
    try {
        const reports = await Report.getPendingReports();
        res.render('admin-reports', { title: 'Panel de Moderación', reports: reports });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el panel de moderación');
    }
};

exports.dismissReport = async (req, res) => {
    try {
        const { id_denuncia } = req.params;
        await Report.updateReportStatus(id_denuncia, 'Desestimada');
        res.redirect('/admin/reports');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al desestimar la denuncia');
    }
};

exports.takeDownReport = async (req, res) => {
    try {
        const { id_denuncia } = req.params;
        const report = await Report.getReportById(id_denuncia);
        if (report) {
            await Report.updateReportStatus(id_denuncia, 'Dada de baja');
            if (report.id_publicacion) {
                await Report.hidePost(report.id_publicacion);
                
                const author = await Post.getAuthor(report.id_publicacion);
                if (author) {
                    const authorId = author.id_usuario;
                    const count = await User.countTakenDownPosts(authorId);
                    if (count >= 3) {
                        await User.deactivate(authorId);
                    }
                }
            } else if (report.id_comentario) {
                await Report.hideComment(report.id_comentario);
            }
        }
        res.redirect('/admin/reports');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al dar de baja el contenido');
    }
};

exports.getCommentReportsForAuthor = async (req, res) => {
    try {
        const id_autor = req.user.id;
        const reports = await Report.getCommentReportsForAuthor(id_autor);
        res.render('comment-moderation', { title: 'Moderación de Comentarios', reports });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la moderación de comentarios');
    }
};

exports.dismissCommentReport = async (req, res) => {
    try {
        const { id_denuncia } = req.params;
        const report = await Report.getReportById(id_denuncia);
        if (!report || !report.id_comentario) {
            return res.status(404).send('Denuncia no encontrada');
        }
        
        const author = await Comment.getCommentPostAuthor(report.id_comentario);
        if (!author || author.id_usuario !== req.user.id) {
            return res.status(403).send('No autorizado');
        }
        
        await Report.updateReportStatus(id_denuncia, 'Desestimada');
        res.redirect('/profile/moderation/comments');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al desestimar la denuncia');
    }
};

exports.deleteCommentByAuthor = async (req, res) => {
    try {
        const { id_denuncia } = req.params;
        const report = await Report.getReportById(id_denuncia);
        if (!report || !report.id_comentario) {
            return res.status(404).send('Denuncia no encontrada');
        }
        
        const author = await Comment.getCommentPostAuthor(report.id_comentario);
        if (!author || author.id_usuario !== req.user.id) {
            return res.status(403).send('No autorizado');
        }
        
        await Report.updateReportStatus(id_denuncia, 'Dada de baja');
        await Report.hideComment(report.id_comentario);
        res.redirect('/profile/moderation/comments');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al eliminar el comentario');
    }
};