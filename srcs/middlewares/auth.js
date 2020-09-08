module.exports = function (req, res, next) {
    if (req.session.user)
        return next();
    if (req.xhr)
        return res.json({status: false, error: 'You must log in to perform this action.'});
    res.redirect('/');
};