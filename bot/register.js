const Client = require('../schemas/client.js');

module.exports = function (data) {

    return new Promise((resolve, reject) => {
        const client = new Client();

        if (data.secret !== process.env.BOT_SECRET) {
            reject({ message : 'Invalid secret key' })
        }

        Client.find({ name : data.name })
            .then((docs) => {
                if (docs.length) {
                    reject({ message : `${data.name} is unavailable` });
                } else {
                    client.name = data.name;
                    client.domains = data.domains;
                    return client.save();
                }
            })
            .then((client) => {
                resolve(client);
            })
            .catch((err) => {
                reject({ message : err });
            });
    });

};
