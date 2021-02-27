const config = require('../config');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKEY = fs.readFileSync('./certs/private.key', 'utf8');
const publicKEY = fs.readFileSync('./certs/public.key', 'utf8');

var helpers = {};

helpers.hash = (plaintext) => {
    if (typeof (plaintext) === 'string' && plaintext.trim().length > 0) {
        var hash = crypto.createHmac('sha256', config.hashSecret).update(plaintext).digest('hex');
        return hash;
    } else {
        return false;
    }
};

helpers.parseJsonToObject = (str) => {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

helpers.createRandomString = (len) => {
    len = typeof (len) === 'number' && len > 0 ? len : false;
    if (len) {
        var possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var str = '';
        for (let i = 1; i <= len; i++) {
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacter;
        }
        return str;
    } else {
        return false;
    }
};

helpers.generateJWTToken = (data) => {
    return jwt.sign(data, privateKEY, config.jwtOptions);
};

helpers.verifyJWTToken = (jwtToken) => {
    try {
        return jwt.verify(jwtToken, publicKEY, config.jwtOptions);
    } catch (e) {
        console.log('e:', e);
        return null;
    }
};

module.exports = helpers;