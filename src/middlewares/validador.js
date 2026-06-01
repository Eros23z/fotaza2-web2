const isValidador = (req, res, next) => {
    if(req.user.rol != 'validador'){
        return res.redirect('/');
    }
    next();
}

module.exports = isValidador;