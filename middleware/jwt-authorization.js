const helpers = require('../services/helpers');

const jwtVerify = (req, res, next) => {
    let { authorization } = req.headers;
    if (authorization){
        let [type , token ] = authorization.split(' ');
        if (token){
            let legit = helpers.verifyJWTToken(token);
            if (!legit){
                sendError(res)
            }
            req.headers['user'] = legit._id;
        }else{
            sendError(res);
        }
    }else{
        sendError(res);
    }
}

const sendError = (res) => {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(401);
    res.end(JSON.stringify({"message": "Authorization error"}));
}

module.exports = jwtVerify;