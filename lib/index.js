var formidable = require('formidable');


var U = {};
U.parseFormFields = function (req) {
    return new Promise(function (resolve, reject) {
        var form = new formidable.IncomingForm();
        try {
            form.parse(req, function (err, fields, files) {
                resolve(fields);
            });
        } catch (r) {
            resolve({});
        }
    });
};
U.guid = (len) => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    if (len == 8) {
        return s4() + s4();
    }
    switch (len) {
        case 4:
            return s4();
            break;
        case 8:
            return s4() + s4();
            break;
        case 12:
            return s4() + s4() + s4();
            break;
    }
    return s4() + s4() + s4() + s4() + s4() + s4() + (new Date).getTime().toString(16);
};

U.getParameterByNameSync = function (name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    var queryParamVal = null;
    if (!results) {
        return queryParamVal;
    }
    if (!results[2]) {
        return queryParamVal;
    }
    queryParamVal = decodeURIComponent(results[2].replace(/\+/g, " "));
    return queryParamVal;
};


U.RouteClass = function (u, f) {
    this.Url = u;
    this.Fn = f;
};
U.sendResObject = function (res, headers, resObject) {
    res.writeHead(200, headers);
    res.end(JSON.stringify(resObject));
};

U.fallBackRoute = function (req, res, headers) {
    var resObject = {};
    resObject.Body = {
    };
    U.sendResponse(res, headers, resObject, 200);
};

U.sendResponse = (res, headers, resObject, resCode) => {
    headers["Content-Type"] = "text/json";
    res.writeHead(resCode, headers);
    res.end(JSON.stringify(resObject));
};

module.exports = U;