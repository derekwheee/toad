const rooms = require('./rooms.js');

module.exports = function (data, socket) {

    const room = rooms.get(data.room);

    return new Promise((resolve, reject) => {

        if (room.clients.indexOf(socket.id) === -1) {
            reject('Invalid command request')
        } else {
            resolve(room.clients);
        }

    });

};
