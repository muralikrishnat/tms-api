var http = require('http');

var getServer = () => {
    return http.createServer((request, response) => {
        var contentType = request.headers['content-type'];
        console.log('request', contentType);
        response.end();
    });
};


var server = getServer();
server.listen(1213, () => {
    console.log('Started listening  on 1213!!!!!!');
});