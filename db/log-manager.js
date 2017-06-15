module.exports = {
    insertLog: function (db, logData) {
        var executeQuery = function (db, query) {
            db.checkAndConnect().then(({ err, client, done }) => {
                if (!err) {
                    client.query(query, (cErr, result) => {
                        done();
                    });
                }
            });
        };
        query = `
            insert into logs 
                (updateby, updateddate, tablename, actiontype, updateddata, updatinginfo)
            values
                ('${logData.empid}', now(), '${logData.tablename}', '${logData.actiontype}', '${logData.data}', '${logData.info}');
        `;
        executeQuery(db, query);
    },
    init: function (server, db) {
        if (server && db) {
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
            var pathName = '/logs'
            server.post(pathName, (req, res, next) => {
                req.params.loggedUser = req.loggedUser;
                if (req.loggedUser) {
                    var query = '';
                    var missingFields = false;
                    if (req.params.id) {

                    } else {
                        query = `
                            insert into logs 
                                (updateby, updateddate, tablename, updateddata, updatinginfo)
                            values
                                (${req.loggedUser.empid}, now(), , now(), '${req.loggedUser.empid}');
                        `;
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
                    var query = 'select * from logs '
                    if (req.query.fromtime) {
                        // query = query + ' where ';
                    }
                    executeQuery(db, res, query);
                } else {
                    res.send({ err: 'Authentication required' });
                }
                return next();
            });
            server.del(pathName, (req, res, next) => {
                req.params.loggedUser = req.loggedUser;
                if (req.loggedUser && (req.params.id || req.query.id)) {
                    req.params.isdelete = true;
                    let id = req.params.id || req.query.id;
                    var query = 'delete from logs where id=${id}';
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