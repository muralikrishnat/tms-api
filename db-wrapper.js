var pg = require('pg');
var U = require('./lib/index');
var config = {
    user: 'postgres',
    database: 'EvokeDBDev',
    password: 'murali',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};
var checkAndConnect = () => {
    return new Promise((res, rej) => {
        pool.connect(function (err, client, done) {
            if (err) {
                res({ err });
            } else {
                res({ client, done });
            }
        });
    });
};