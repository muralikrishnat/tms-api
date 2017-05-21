module.exports = {
    init: function (server, db) {
        if (server && db) {
            var pathName = '/logs'
            server.post(pathName, (req, res, next) => {
                req.params.loggedUser = req.loggedUser;
                if (req.loggedUser) {
                    db.logs(req.params).then(({ err, result }) => {
                        res.send({ err, result });
                    });
                } else {
                    res.send({ err: 'Authentication required' });
                }
                return next();
            });
            server.get(pathName, (req, res, next) => {
                req.params.loggedUser = req.loggedUser;
                if (req.loggedUser) {
                    req.params.isget = true;
                    req.params.query = req.query;
                    db.logs(req.params).then(({ err, result }) => {
                        res.send({ err, result });
                    });
                } else {
                    res.send({ err: 'Authentication required' });
                }
                return next();
            });
            server.del(pathName, (req, res, next) => {
                req.params.loggedUser = req.loggedUser;
                if (req.loggedUser && (req.params.id || req.query.id)) {
                    req.params.isdelete = true;
                    req.params.id = req.params.id || req.query.id;
                    db.logs(req.params).then(({ err, result }) => {
                        res.send({ err, result });
                    });
                } else {
                    res.send({ err: 'Authentication required' });
                }
                return next();
            });


            server.opts(pathName, (req, res, next) => {
                res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST, DELETE, GET');
                res.send(200);
                return next();
            });
        }
    }
};