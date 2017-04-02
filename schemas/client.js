const mongoose = require('mongoose');
const hat = require('hat');
const Schema = mongoose.Schema;

module.exports = mongoose.model('Client', new Schema({
    name : String,
    domains : Array,
    api_key : { type: String, default: hat() },
    created : { type: Date, default: Date.now },
}));
