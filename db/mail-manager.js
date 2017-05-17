'use strict';
var nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'muralit.evoke@gmail.com', // my mail
        pass: 'Murali@123'
    }
}));

// setup email data with unicode symbols
let mailOptions = {
    from: '"Timesheet Manager" <muralit.evoke@gmail.com>',
    to: 'mtottimpudi@evoketechnologies.com',
    subject: 'Hello ✔',
    text: 'Hello world ?',
    html: '<b>Hello world ?</b>'
};

// send mail with defined transport object

var disableMail = true;

module.exports = {
    sendMail: function (options) {
        options = options || mailOptions;
        return new Promise((res, rej) => {
            if (disableMail) {
                res({});
            } else {
                transporter.sendMail(options, (error, info) => {
                    res({ error, result: info });
                });
            }
        });
    }
};