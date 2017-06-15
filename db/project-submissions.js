module.exports = {
    init: (server, db) => {
        var executeQuery = function (db, res, query) {
            db.checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    client.query(query, (cErr, result) => {
                        done();
                        if (!cErr) {
                            res.send({ result: result.rows });
                        } else {
                            res.send({ err: { code: 2324, msg: 'query Issue', details: cErr } });
                        }
                    });
                } else {
                    res.send({ err: { code: 2323, msg: 'Connection Issue', details: err } });
                }
            });
        };
        if (server && db) {
            var pathName = '/projectsubmissions'
            server.post(pathName, (req, res, next) => {
                req.params.loggedUser = req.loggedUser;
                if (req.loggedUser) {
                    var query = '';
                    var missingFields = false;
                    if (req.params.id) {

                    } else {
                        if (req.params.projectid != null && req.params.submonth != null && req.params.subyear != null) {
                            query = `
                                insert into projectsubmissions 
                                    (pid, submonth, subyear, submittedon, submittedby)
                                values
                                    (${req.params.projectid}, ${req.params.submonth}, ${req.params.subyear}, now(), '${req.loggedUser.empid}');
                            `;
                        } else {
                            missingFields = true;
                        }
                    }
                    if (missingFields) {
                        res.send({ err: { code: 222, msg: 'required fields are missing' } });
                    } else {
                        executeQuery(db, res, query);
                    }
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
                    var query = ' select * from projectsubmissions '
                    executeQuery(db, res, query);
                } else {
                    res.send({ err: 'Authentication required' });
                }
                return next();
            });
            server.del(pathName, (req, res, next) => {
                req.params.loggedUser = req.loggedUser;
                if (req.loggedUser && (req.params.id || req.query.id)) {
                    let id = req.params.id || req.query.id;
                    var query = ' delete from projectsubmissions where id=${id}'
                    executeQuery(db, res, query);
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