const rooms = require('./rooms.js');
const Client = require('../schemas/client.js');

module.exports = function(data) {

    return new Promise((resolve, reject) => {

        Client.findOne({ name : data.name, api_key : data.api_key })
            .then((client) => {
                rooms.set(client.name);
                resolve(client);
            })
            .catch((err) => {
                reject(err);
            })

    });

};
