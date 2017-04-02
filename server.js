const fs = require('fs');
const mongoose = require('mongoose');
const BOT = require('./bot/base.js');
const isProduction = process.env.NODE_ENV && process.env.NODE_ENV === 'production';
var https;
var http;
var app;
var io;

mongoose.Promise = global.Promise;

process.on('unhandledRejection', (reason, promise) => {
    console.warn(reason);
    console.warn(promise);
});

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

    const clients = {};

    console.log(`toad is ready on port ${(process.env.PORT || 4433)}`);
    io = require('socket.io')(app);

    mongoose.connect(process.env.MONGODB_URI);

    io.on('connection', (socket) => {

        clients[socket.id] = {
            rooms : []
        };

        socket.on('register', (data) => {

            BOT.register(data)
                .then((client) => {
                    socket.emit('registered', { client, socket : socket.id });
                })
                .catch(emitError.bind(null, socket));

        });

        socket.on('ready', (data) => {

            BOT.ready(data)
                .then((client) => {})
                .catch(emitError.bind(null, socket));

        });

        socket.on('join', (data) => {

            data = typeof date === 'object' ? data : { room: data };

            BOT.join(data, socket)
                .then((client) => {
                    clients[socket.id].rooms.push[data.room];
                    socket.emit('joined', { client, socket : socket.id });
                })
                .catch(emitError.bind(null, socket));

        });

        socket.on('command', (data) => {

            BOT.command(data, socket)
                .then((clients) => {
                    clients.forEach((client) => {
                        io.to(client).emit(data.command, data.data);
                    })
                })
                .catch(emitError.bind(null, socket));

        });

        socket.once('disconnect', function () {
            clients[socket.id].rooms.forEach((room) => {
                BOT.rooms.get(room).leave(socket.id);
            });

            delete clients[socket.id];
        });

    });

    function emitError(socket, err) {
        console.log(err);
        socket.emit('beep', { message : JSON.stringify(err) });
    }

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
