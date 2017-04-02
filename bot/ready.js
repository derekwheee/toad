const Client = require('../schemas/client.js');

module.exports = function(data) {

    return new Promise((resolve, reject) => {

        Client.findOne({ name : data.name, api_key : data.api_key })
            .then((client) => {
                resolve(client);
            })
            .catch((err) => {
                reject(err);
            })

    });

};
