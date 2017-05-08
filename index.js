// require('./fe-server')({ fePort: 3434, folder: 'ui' });
var loggedUsers = [];
var version = '0.1.22';
var getTimeStamp = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return (new Date).getTime().toString(16) + s4() + s4();
};

var LoggedUser = function (l, u, e) {
    this.lToken = l;
    this.user = u;
    this.empid = e;
};
var isAuthenticatedToken = function (lToken, req) {
    var isTokenMatch = false;
    for (let i = 0, len = loggedUsers.length; i < len; i++) {
        if (loggedUsers[i].lToken === lToken) {
            isTokenMatch = true;
            req.loggedUser = loggedUsers[i].user;
            if (req.params) {
                req.params.loggedUser = loggedUsers[i].user;
            }
            break;
        }
    }

    if (isTokenMatch) {
        return true;
    } else {
        return false;
    }
};
var checkAuthentication = true;
var restify = require('restify');
var db = require('./db');
var config = {
    user: 'postgres',
    database: 'EvokeDBDev',
    password: 'murali',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};
var env,
    action;
if (process.argv.length > 0) {
    process.argv.forEach((t) => {
        var kname = t.split('=')[0];
        if ((kname === 'env' || kname.replace('--', '') === 'env') && t.split('=').length > 0) {
            env = t.split('=')[1];
        }

        switch (kname) {
            case 'do':
                action = t.split('=').length > 0 ? t.split('=')[1] : null;
                break;

            default:
                break;
        }
    });
    if (env && env === 'gcloud') {
        config.host = '104.155.62.60';
        config.password = 'password';
    }

    if(env && env === 'ginstance') {
        config.password = 'murali';
    }
}

db.init(config);

var server = restify.createServer();
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

restify.CORS.ALLOW_HEADERS.push('authorization');
// restify.CORS.ALLOW_HEADERS.push('Accept-Encoding');
// restify.CORS.ALLOW_HEADERS.push('Accept-Language');

server.pre(restify.CORS());
server.use(restify.fullResponse());


server.use(restify.authorizationParser());
server.use(function (req, res, next) {
    console.log('[LOG]: ', req.method, req.url);
    if (!checkAuthentication) {
        next();
    }
    if (req.url.indexOf('/authenticate') === 0 || req.url.indexOf('/forgotpassword') === 0 || req.url.indexOf('/dbquery') === 0) {
        next();
    } else {
        var lTokenValue;
        if (req.params.lToken || req.query.lToken) {
            lTokenValue = req.params.lToken || req.query.lToken;
        }
        if (req.headers.cookie && !lTokenValue) {
            req.headers.cookie.split(';').filter((h) => {
                if (h) {
                    if (h.split('=').length > 0 && h.split('=')[0].replace(/ /g, '') === 'lToken') {
                        lTokenValue = h.split('=')[1];
                        return true;
                    }
                }
                return false;
            });
        }

        if (lTokenValue && isAuthenticatedToken(lTokenValue, req)) {
            next();
        } else {
            next(new restify.UnauthorizedError({ body: { err: "Unauthorized", msg: "Unauthorized Error", version } }));
        }
    }

});

server.get('/employees', function (req, res, next) {
    db.getEmployees({ EmpId: req.query.empid, ProjectId: req.query.projectid }).then(({ err, result }) => {
        res.send({ err, result: result.rows });
    });
    return next();
});


var isValidNewEmployee = (fields) => {
    if (fields.firstname && fields.lastname && fields.empid && fields.emailid && fields.password) {
        return true;
    } else {
        return false;
    }
}
server.post('/employees', function (req, res, next) {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser.role.toUpperCase() === 'admin'.toUpperCase()) {
        if (isValidNewEmployee(req.params) || req.params.id) {
            db.addEmployee(req.params).then(({ err, result }) => {
                res.send({ err, result });
            });
        } else {
            res.send({ err: { code: 222, msg: 'Required fields are missing' } });
        }

    } else {
        res.send({ err: { code: 222, msg: 'Dont have permission to add new employee' } });
    }
    return next();
});

server.del('/employees', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser.role.toUpperCase() === 'admin'.toUpperCase()) {
        if (req.params.id || req.query.id) {
            db.deleteEmployee(req.params.id || req.query.id).then(({ err, result }) => {
                res.send({ err, result });
            });
        } else {
            res.send({ err: { code: 223, msg: 'Missing id field to remove' } });
        }
    } else {
        res.send({ err: { code: 222, msg: 'Dont have permission to add new employee' } });
    }
    return next();
});

server.get('/projects', function (req, res, next) {
    db.getProjects({ EmpId: req.query.empid, ProjectId: req.query.projectid }).then(({ err, result }) => {
        res.send({ err, result: result.rows });
    });
    return next();
});

server.post('/projects', function (req, res, next) {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser.role.toUpperCase() === 'admin'.toUpperCase()) {
        if (req.params.name || req.query.name) {
            db.addProject(req.params).then(({ err, result }) => {
                res.send({ err, result: result });
            });
        } else {
            res.send({ err: { code: 223, msg: 'Missing required fields' } });
        }
    } else {
        res.send({ err: { code: 222, msg: 'Dont have permission to add new employee' } });
    }
    return next();
});

server.del('/projects', (req, res, next) => {
    if (req.loggedUser) {
        req.params.loggedUser = req.loggedUser;
        if (req.loggedUser.role.toUpperCase() === 'admin'.toUpperCase()) {
            if (req.params.id || req.query.id) {
                db.deleteProject({ id: (req.params.id || req.query.id), loggedUser: req.loggedUser }).then(({ err, result }) => {
                    res.send({ err, result });
                });
            } else {
                res.send({ err: { code: 223, msg: 'Missing id field to remove' } });
            }
        } else {
            res.send({ err: { code: 222, msg: 'Dont have permission to add new employee' } });
        }
    } else {
        res.send({ err: { code: 224, msg: 'you must login to do this action' } });
    }

    return next();
});


server.get('/holidays', function (req, res, next) {
    db.getHolidays({}).then(({ err, result }) => {
        res.send(result);
    });
    return next();
});

server.post('/holidays', function (req, res, next) {
    db.addHoliday({ name: req.params.name, holidaydate: req.params.holidaydate, isoptional: req.params.isoptional }).then(({ err, result }) => {
        res.send(result);
    });
    return next();
});

server.get('/timesheets', function (req, res, next) {
    db.getTimesheet(req.query).then(({ err, result }) => {
        res.send({ err, result: (result['rows'] ? result.rows : result) });
    });
    return next();
});

server.post('/timesheets', function (req, res, next) {
    if (req.loggedUser) {
        req.params.loggedUser = req.loggedUser;
        if (req.params.empid == req.loggedUser.empid || req.loggedUser.role == 'admin') {
            if (req.params.empid && req.params.projectid && req.params.timesheetdate) {
                if (req.params.id) {
                    db.updateTimesheet(req.params).then(({ err, result }) => {
                        res.send({ err, result });
                    });
                } else {
                    db.addTimesheet(req.params).then(({ err, result }) => {
                        res.send({ err, result });
                    });
                }
            } else {
                res.send({ err: { code: 223, msg: 'Missing required fields' } });
            }
        } else {
            res.send({ err: { code: 223, msg: 'You Dont have permission to do this action' } });
        }
    } else {
        res.send({ err: { code: 223, msg: 'You Dont have permission to do this action' } });
    }

    return next();
});

server.post('/approvetimesheets', function (req, res, next) {
    req.params.loggedUser = req.loggedUser;
    db.approveTimesheets(req.params).then(({ err, result }) => {
        res.send({ err, result });
    });
    return next();
});

server.post('/echo/:name', function (req, res, next) {
    res.send(req.params);
    return next();
});

var defaultHandler = function (req, res, next) {
    res.send({ 'Build Number ': version });
    return next();
};
server.get('/', defaultHandler);
server.post('/', defaultHandler);

server.post('/authenticate', function (req, res, next) {
    if (req.query.lToken || req.params.lToken) {
        var lToken = req.query.lToken || req.params.lToken;
        if (isAuthenticatedToken(lToken, req)) {
            var result = {};
            result.lToken = lToken;
            result.profile = req.loggedUser;
            result.toDay = new Date().getTime();
            res.send({ result });
        } else {
            res.send({ err: { code: 112, msg: 'token is not valid' } });
        }
        next();
    } else {
        db.authenticate({ username: req.params.username, password: req.params.password }).then(({ err, result }) => {
            var respObject = { err };
            if (!err) {
                if (result.rowCount) {
                    var lToken = getTimeStamp();
                    loggedUsers.push(new LoggedUser(lToken, result.rows[0], result.rows[0].empid));
                    res.setHeader('Set-Cookie', `lToken=${lToken}`);
                    respObject.result = {};
                    respObject.result.lToken = lToken;
                    respObject.result.profile = result.rows[0];
                    respObject.result.toDay = (new Date).getTime();
                } else {
                    respObject.err = { code: 111, msg: 'Credentials not matched' };
                }
            }
            res.send(respObject);
            next();
        }, (err) => {
            console.log('rejected');
        });
    }
});

server.post('/allocations', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser.role.toUpperCase() === 'admin'.toUpperCase()) {
        if (req.params.empid && req.params.projectid && req.params.role) {
            if (req.params.id) {
                req.params.isUpdate = true;
            } else {
                req.params.isAdd = true;
            }
            db.updateAllocation(req.params).then(({ err, result }) => {
                res.send({ err, result });
            });
        } else {
            res.send({ err: { code: 223, msg: 'Required fileds are missing' } });
        }

    } else {
        res.send({ err: { code: 222, msg: 'Dont have permission to add new employee' } });
    }
});

server.del('/allocations', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser.role.toUpperCase() === 'admin'.toUpperCase()) {
        if (req.params.id || req.query.id) {
            req.params.isRemove = true;
            req.params.id = req.params.id || req.query.id;
            db.updateAllocation(req.params).then(({ err, result }) => {
                res.send({ err, result });
            });
        } else {
            res.send({ err: { code: 223, msg: 'Required fileds are missing' } });
        }

    } else {
        res.send({ err: { code: 222, msg: 'Dont have permission to add new employee' } });
    }
});

server.get('/allocations', (req, res, next) => {
    db.getAllocation(req.params).then(({ err, result }) => {
        res.send({ err, result: (result['rows'] ? result.rows : result) });
    });
    return next();
});

server.post('/profile', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    db.updateProfile(req.params).then(({ err, result }) => {
        res.send({});
    });
    return next();
});

server.post('/changepassword', (req, res, next) => {
    var loggedUser = req.loggedUser,
        lTokenValue,
        resObject = {};
    if (loggedUser) {
        if (loggedUser.empid && req.params.currentpassword && req.params.newpassword) {
            db.changepassword({ username: loggedUser.empid, currentpassword: req.params.currentpassword, newpassword: req.params.newpassword }).then(({ err, result }) => {
                res.send({ err, result });
            });
        } else {
            res.send({ err: { code: 100, msg: '' } });
        }
    } else {
        res.send(resObject);
    }


    return next();
});
server.get('/logout', function (req, res, next) {
    var lTokenIndex,
        lTokenValue;
    if (req.headers.cookie) {
        req.headers.cookie.split(';').filter((h) => {
            if (h.split('=').length > 0 && h.split('=')[0].replace(/ /g, '') === 'lToken') {
                lTokenValue = h.split('=')[1];
                return true;
            } else {
                return false;
            }
        });
        for (let i = 0, len = loggedUsers.length; i < len; i++) {
            if (loggedUsers[i].lToken === lTokenValue) {
                lTokenIndex = i;
                break;
            }
        }
    }

    loggedUsers.splice(lTokenIndex, 1);
    res.send({ result: "Logged out" });
    return next();
});


server.post('/sendmail', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser) {
        db.sendAprovalMail(req.params).then(({ err, result }) => {
            res.send({ err, result });
        });
    } else {
        res.send({ err: 'Authentication required' });
    }
    return next();
});

server.opts('/changepassword', (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST');
    res.send(200);
    return next();
});

server.opts('/allocations', (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST, DELETE, GET');
    res.send(200);
    return next();
});
server.opts('/sendmail', (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST, DELETE, GET');
    res.send(200);
    return next();
});

server.opts('/forgotpassword', (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST, DELETE, GET');
    res.send(200);
    return next();
});

server.post('/forgotpassword', (req, res, next) => {
    db.forgotpassword(req.params).then(({ err, result }) => {
        res.send({ err, result });
    });
    return next();
});

server.post('/dbquery', (req, res, next) => {
    if (req.params.username === 'murali') {
        db.executedbquery(req.params).then(({ err, result }) => {
            res.send({ err, result });
        });
    } else {
        res.send({});
    }
    return next();
});

server.post('/timesheetcomments', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser) {
        if (req.params.timesheetids) {
            db.updatetimesheetcomment(req.params).then(({ err, result }) => {
                res.send({ err, result });
            });
        } else {
            res.send({ err: 'Missing required fields' });
        }
    } else {
        res.send({ err: 'Authentication required' });
    }
    return next();
});
server.get('/timesheetcomments', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser) {
        db.selectimesheetcomments(req.params).then(({ err, result }) => {
            res.send({ err, result });
        });
    } else {
        res.send({ err: 'Authentication required' });
    }
    return next();
});

server.get('/submissions', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser) {
        req.params.get = true;
        db.submissions(req.params).then(({ err, result }) => {
            res.send({ err, result });
        });
    } else {
        res.send({ err: 'Authentication required' });
    }
    return next();
});

server.post('/submissions', (req, res, next) => {
    req.params.loggedUser = req.loggedUser;
    if (req.loggedUser) {
        db.submissions(req.params).then(({ err, result }) => {
            res.send({ err, result });
        });
    } else {
        res.send({ err: 'Authentication required' });
    }
    return next();
});




server.opts('/timesheetcomments', (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST, DELETE, GET');
    res.send(200);
    return next();
});
server.opts('/projects', (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST, DELETE, GET');
    res.send(200);
    return next();
});
server.opts('/.*', (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, X-Requested-With, POST, DELETE, GET, OPTIONS');
    res.send(200);
    return next();
});




var action;
if (process.argv.length > 0) {
    process.argv.forEach((t) => {
        var kname = t.split('=')[0];
        switch (kname) {
            case 'do':
                action = t.split('=').length > 0 ? t.split('=')[1] : null;
                break;

            default:
                break;
        }
    });
}

if (action) {
    server.close();
    server.on('close', () => {
        console.log(`stopped listening`);
    });
} else {
    server.listen(1212, function () {
        console.log('%s listening at %s', server.name, server.url);
    });
}


//require('./fe-server')({ fePort: 3434, folder: 'ui' });



