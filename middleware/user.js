const userMiddleware = (req, res, next) => {
    console.log('Current session:', req.session); 
    res.locals.user = req.session.user || null;
    res.locals.userRole = req.session.user ? req.session.user.role : null;
    next();
};

module.exports = userMiddleware;