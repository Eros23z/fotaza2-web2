const express = require('express');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { protect } = require('./middlewares/authMiddleware');
const { Post } = require('./models/postModel');
const User = require('./models/userModel');
const Follow = require('./models/followModel');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const userController = require('./controllers/userController');
const commentController = require('./controllers/commentController');
const rateController = require('./controllers/rateController');
const followController = require('./controllers/followController');
const messagesController = require('./controllers/messagesController');
const isValidador = require('./middlewares/validador');
const reportController = require('./controllers/reportController');
const notificationController = require('./controllers/notificationController');

const app = express();
const port = process.env.PORT;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const jwt = require('jsonwebtoken');
app.use((req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            res.locals.user = decoded;
        } catch (error) {
            res.clearCookie('jwt');
        }
    }
    next();
});

const Notification = require('./models/NotificationModel');
app.use(async (req, res, next) => {
    if (req.user) {
        try {
            res.locals.notifications = await Notification.getNotifications(req.user.id);
        } catch (error) {
            console.error('Error al cargar las notificaciones:', error);
        }
    }
    next();
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.getAllWithImages();
        res.render('index', { title: 'Fotaza 2', posts: posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la pagina principal');
    }
});

app.get('/search', postController.searchPosts);

app.get('/create-post', protect, (req, res) => {
    res.render('create-post', { title: 'Crear publicación' });
});

app.get('/posts-detail/:id_publicacion', protect, postController.getPostDetail);
app.post('/posts-detail/:id_publicacion/comments', protect, commentController.addComments);
app.post('/posts-detail/:id_publicacion/rate', protect, rateController.addRating);

app.get('/following', protect, async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const posts = await Post.getPostsFromFollowing(id_usuario);
        res.render('index', { title: 'Publicaciones de los que sigo', user: req.user, posts: posts });
    } catch (error) {
        res.status(500).send('Error al cargar las publicaciones de los que sigo');
    }
});

app.post('/users/:id_usuario/unfollow', protect, followController.unfollowUser);
app.post('/users/:id_usuario/follow', protect, followController.followUser);
app.get('/profile/:id_usuario', protect, async (req, res) => {
    try {
        const id_usuario = req.params.id_usuario;
        const userProfile = await User.getProfile(id_usuario);
        const currentUser = req.user.id;
        const isOwnProfile = currentUser === userProfile.id_usuario;
        const isFollowing = isOwnProfile ? false : await Follow.isFollowing(currentUser, userProfile.id_usuario);
        const followersCount = await Follow.countFollowers(id_usuario);
        const followingCount = await Follow.countFollowing(id_usuario);
        const userPosts = await Post.getPostsByUser(id_usuario);

        res.render('profile', {
            title: `Perfil de ${userProfile.username}`,
            userProfile: userProfile,
            currentUser: currentUser,
            isOwnProfile: isOwnProfile,
            isFollowing: isFollowing,
            followersCount: followersCount,
            followingCount: followingCount,
            userPosts: userPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar el perfil');
    }
});

app.post('/posts-detail/:id_publicacion/report', protect, reportController.reportPost);
app.get('/admin/reports', protect, isValidador, reportController.getPendingReports);
app.post('/admin/reports/:id_denuncia/dismiss', protect, isValidador, reportController.dismissReport);
app.post('/admin/reports/:id_denuncia/takedown', protect, isValidador, reportController.takeDownReport);

app.post('/interest/:id_publicacion', protect, notificationController.interestPostNotification);
app.get('/notifications', protect, notificationController.getNotifications);

app.get('/messages', protect, messagesController.getMessages);
app.get('/messages/:id_usuario_recibe', protect, messagesController.getConversation);
app.post('/messages/:id_usuario_recibe/send', protect, messagesController.sendMesssages);

app.get('/register', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('register', { title: 'Registro' });
});

app.get('/login', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('login', { title: 'Login' });
});

const upload = require('./middlewares/upload');
const { report } = require('process');
app.post('/create-post', protect, upload.array('imagen', 5), postController.createPost);
app.post('/register', authController.postRegister);
app.post('/login', authController.postLogin);
app.get('/logout', authController.logout);

app.listen(port, () => {
    console.log(`servidor escuchando en ${port}`);
})

