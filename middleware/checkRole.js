const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        if (req.path === '/pelanggan' && req.session.user.role === 'admin') {
            return next();
        }

        if (!allowedRoles.includes(req.session.user.role)) {
            return res.status(403).send('Akses tidak diizinkan');
        }

        next();
    };
};

module.exports = checkRole;