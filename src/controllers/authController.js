const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.getRegister = (req, res) => {
    res.render('register', { title: 'Registro - Fotaza 2' });
};

exports.postRegister = async (req, res) => {
    try {
        const { nombre, apellido, username, email, password, fecha_nacimiento } = req.body;

        const existingEmail = await User.findByField('email', email);
        if (existingEmail) return res.render('register', { title: 'Registro - Fotaza 2', error: 'El correo electrónico ya está registrado.' });

        const existingUsername = await User.findByField('username', username);
        if (existingUsername) return res.render('register', { title: 'Registro - Fotaza 2', error: 'El nombre de usuario ya está en uso.' });

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await User.create({
            nombre, apellido, username, email,
            password: hashedPassword,
            fecha_nacimiento
        });

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).render('register', { title: 'Registro - Fotaza 2', error: 'Ocurrió un error en el registro. Inténtelo de nuevo.' });
    }
};

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findByField('email', email);
        if (existingUser) {
            if (existingUser.estado === 'inactivo') {
                return res.render('login', { title: 'Login', error: 'Tu cuenta ha sido desactivada por acumular 3 o más publicaciones dadas de baja.' });
            }
            const match = await bcrypt.compare(password, existingUser.password);
            if (match) {
                const token = jwt.sign(
                    { id: existingUser.id_usuario, username: existingUser.username, rol: existingUser.rol },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' }
                );
                res.cookie('jwt', token, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
                res.redirect('/');
            } else {
                return res.render('login', { title: 'Login', error: 'Contraseña incorrecta.' });
            }
        } else {
            return res.render('login', { title: 'Login', error: 'El correo electrónico ingresado no está registrado.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).render('login', { title: 'Login', error: 'Error al iniciar sesión. Inténtelo más tarde.' });
    }
}

exports.logout = (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
};