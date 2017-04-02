const _ = require('lodash');
const _rooms = {};

var rooms = _rooms;

rooms.set = function (name) {
    if (name in _rooms) {
        return _rooms[name];
    }

    _rooms[name] = {
        clients : [],
        join(id) {
            if (this.clients.indexOf(id) === -1) {
                this.clients.push(id);
            }
        },
        leave(id) {
            _.pull(this.clients, id);
        }
    };

    return _rooms[name];
},
rooms.get = function (name) {
    return _rooms[name];
}

module.exports = rooms;
