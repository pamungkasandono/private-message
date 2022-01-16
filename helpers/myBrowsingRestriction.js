module.exports = function myBrowsingRestriction(req, res, next) {
    if (req.headers["my-special-header"]) {
        // custom header exists, then call next() to pass to the next function
        next();
    } else {
        res.sendStatus(403);
    }
};
