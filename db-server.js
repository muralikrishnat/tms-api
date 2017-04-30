var http = require('http');

var getServer = () => {
    return http.createServer((request, response) => {
        var contentType = request.headers['content-type'];
        console.log('request', contentType);
        response.end();
    });
};

var action;
if (process.argv.length > 0) {
    process.argv.forEach((t) => {
        var kname = t.split('=')[0];
        if (kname === 'do' && t.split('=').length > 0) {
            action = t.split('=')[1];
        }
    });
}

var server = getServer();
var startServer = () => {
    server.listen(1213, () => {
        console.log('Started listening  on 1213!!!!!!');
    });
};

if (action && action === 'stop') {
    server.close(() => {
        console.log('Stopped listening  on 1213!!!!!!');
        startServer();
    });
} else {
    startServer();
}


