const fs = require('fs');
const mongoose = require('mongoose');
const BOT = require('./bot/base.js');
const isProduction = process.env.NODE_ENV && process.env.NODE_ENV === 'production';
const rooms = {};
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

    console.log(`toad is ready on port ${(process.env.PORT || 4433)}`);
    io = require('socket.io')(app);

    mongoose.connect(process.env.MONGODB_URI);

    io.on('connection', (socket) => {

        console.log('Connected');

        socket.on('register', (data) => {

            BOT.register(data)
                .then((client) => {
                    socket.emit('registered', { client, socket : socket.id });
                })
                .catch(emitError.bind(null, socket));

        });

        socket.on('ready', (data) => {

            BOT.ready(data)
                .then((client) => {
                    console.log(client.name);
                    createRoom(io, client.name);
                    socket.join(rooms[client.name]);
                })
                .catch(emitError.bind(null, socket));

        });

        socket.on('join', (data) => {

            data = typeof date === 'object' ? data : { room: data };

            BOT.join(data, socket)
                .then((client) => {
                    if (rooms && client.name in rooms) {
                        socket.join(rooms[client.name]);
                    } else {
                        emitError('Room isn\'t ready');
                    }
                })
                .catch(emitError.bind(null, socket));

        });

        socket.once('disconnect', function () {
            console.log('Disconnected');
        });

    });

    function emitError(socket, err) {
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

function createRoom(io, room) {

    console.log(`Creating ${room}`);

    if (room in rooms) {
        return rooms[room];
    }

    var nsp = io.of(`/${room}`);
    nsp.on('connection', function(socket){

        console.log(`${socket.id} joined ${room}`);

        nsp.emit('joined', `Someone joined ${room}`);

        //socket.emit('joined', { socket : socket.id });

        socket.on('command', (data) => {

            nsp.emit('error', { message : err });

            BOT.command(data)
                .then((client) => {
                    nsp.emit('command', data);
                })
                .catch(emitError.bind(socket))

        });

    });

    rooms[room] = nsp;

    console.log(JSON.stringify(rooms));

}
