const fs = require('fs');
const mongoose = require('mongoose');
const BOT = require('./bot/base.js');
const isProduction = process.env.NODE_ENV && process.env.NODE_ENV === 'production';
var https;
var http;
var app;
var io;

mongoose.Promise = global.Promise;

// Heroku handles SSL through a proxy, so let it do its thing
if (isProduction) {
    http = require('http');
    app = http.createServer(httpHandler).listen(process.env.PORT || 4433);
    init();
} else {
    let pem = require('pem');
    https = require('https');

    require('dotenv').config();

    pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
        app = https.createServer({ key: keys.serviceKey, cert: keys.certificate }, httpHandler).listen(process.env.PORT || 4433);
        init();
    });
}

function init() {

    console.log(`toad is ready on port ${(process.env.PORT || 4433)}`);
    io = require('socket.io')(app);
    mongoose.connect(process.env.MONGODB_URI);
    createBotRoom();

}

function httpHandler(req, res) {

    if (isProduction) {
        res.writeHead(403);
        return res.end();
    }

    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(data);
    });

}

function createBotRoom() {

    const bot = io
        .of('/bot')
        .on('connection', (socket) => {

            console.log('Connected');

            socket.on('register', (data) => {

                BOT.register(data)
                    .then((client) => {
                        bot.to(socket.id).emit('registered', { client, socket : socket.id });
                    })
                    .catch((err) => {
                        bot.to(socket.id).emit('error', err);
                    });

            });

            socket.on('hello', (data) => {

                BOT.connect(data)
                    .then((client) => {
                        bot.to(socket.id).emit('hello', { client, socket : socket.id });
                    })
                    .catch((err) => {
                        bot.to(socket.id).emit('error', { message : err });
                    });

            });

            socket.once('disconnect', function () {
                console.log('Disconnected');
            });

        });

}
