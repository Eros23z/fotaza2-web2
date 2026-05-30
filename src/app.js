const express = require('express');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { protect } = require('./middlewares/authMiddleware');
const { Post } = require('./models/postModel');
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');

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

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', protect, async (req, res) => {
    try {
        const posts = await Post.getAllWithImages();
        res.render('index', { title: 'Fotaza 2', posts: posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar la página principal');
    }
});

app.get('/search', postController.searchPosts);

app.get('/create-post', protect, (req, res) => {
    res.render('create-post', { title: 'Crear publicación' });
});

app.get('/posts-detail/:id_publicacion', protect, postController.getPostDetail);

app.post('/posts-detail/:id_publicacion/comments', protect, postController.addComments);
app.post('/posts-detail/:id_publicacion/rate', protect, postController.addRating);

app.get('/register', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('register', { title: 'Registro' });
});

app.get('/login', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('login', { title: 'Login' });
});

const upload = require('./middlewares/upload');
app.post('/create-post', protect, upload.array('imagen', 5), postController.createPost);
app.post('/register', authController.postRegister);
app.post('/login', authController.postLogin);
app.get('/logout', authController.logout);

app.listen(port, () => {
    console.log(`servidor escuchando en ${port}`);
})

