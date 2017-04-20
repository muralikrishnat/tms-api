var http = require('http');
var url = require('url');
var U = require('./lib/index');


var client,
    routings = [];


var isValidationRequired = false;

var createServer = function () {
    return http.createServer(function (req, res) {
        var headers = {};

        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Credentials'] = true;
        headers['Access-Control-Allow-Headers'] = 'content-type';
        headers['Access-Control-Allow-Methods'] = 'DELETE,GET,POST,OPTIONS';

        var isRouteFound = false, fnToCall = null;
        var reqUrl = url.parse(req.url);
        routings.forEach(function (lItem) {
            if (lItem.Url === reqUrl.pathname) {
                isRouteFound = true;
                fnToCall = lItem.Fn;
            }
        });

        if (isRouteFound && fnToCall) {
            if (reqUrl.pathname === '/login' || !isValidationRequired) {
                fnToCall.call(null, req, res, headers);
            } else {
                var lTokenParam = U.getParameterByNameSync('lToken', req.url);
                if (lTokenParam) {
                    var logged = loggedInTokens.filter((m) => { return m.tokenObject == lTokenParam; });
                    if (logged.length > 0) {
                        fnToCall.call(null, req, res, headers);
                    } else {
                        headers["Content-Type"] = "text/json";
                        U.sendResObject(res, headers, {
                            err: 'Permission Denied, lToken expired'
                        });
                    }
                } else {
                    headers["Content-Type"] = "text/json";
                    U.sendResObject(res, headers, {
                        err: 'Login required to get Access DB. Please provide authentication details'
                    });
                }
            }
        } else {
            U.fallBackRoute(req, res, headers);
        }
    });
};



var server = createServer();
server.listen(1212, () => {
    console.log('Server listening started on 1212');
});
