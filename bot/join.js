const url = require('url');
const Client = require('../schemas/client.js');

function isValid (data, socket, client) {
    try {
        var URL = url.parse(socket.request.headers.referer || '');
        var host = URL.hostname;

        if (client.domains.indexOf(host) > -1) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        if (!('api_key' in data)) {
            return false;
        }
        return data.api_key === client.api_key;
    }
}

module.exports = function(data, socket) {

    return new Promise((resolve, reject) => {

        Client.findOne({ name : data.room })
            .then((client) => {
                if (isValid(data, socket, client)) {
                    resolve(client);
                } else {
                    reject('Invalid request');
                }
            })
            .catch((err) => {
                reject(err);
            })

    });

};
