const mongoose = require('mongoose');
const config = require('../config');

mongoose.Promise = global.Promise;
mongoose.set('debug', false); // debug mode on

var db = {}

db.startConnection = () => {
    try {
        mongoose.connect(config.mongodb, { useNewUrlParser: true, useCreateIndex: true });
    } catch (err) {
        mongoose.createConnection(config.mongodb);
    }

    mongoose.connection
        .once('open', () => console.info("\x1b[33m%s\x1b[0m", `[Montior::] Connected to ${config.mongodb}...`))
        .on('error', e => {
            console.log('Could not connect to mongo. Error: ', e.message)
            throw e;
        });
}

module.exports = db;
