/**
 * Server file for API .
 * Author: Ajiboye Tolulope
 */


// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const jwtVerify = require('./middleware/jwt-authorization');

// Configurations
const config = require('./config');

const handlers = require('./services/handlers');
const helpers = require('./services/helpers');
const db = require('./database/db');

const server = http.createServer((req, res) => {
    var parsedUrl = url.parse(req.url, true);
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    var method = req.method.toLowerCase();
    var queryStringObject = parsedUrl.query;
    var headers = req.headers;
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();
        let middlewares  = [jwtVerify,]

        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined'
            ? router[trimmedPath]
            : handlers.notFound;

        middlewares.forEach((fn) => {
            if (fn === jwtVerify){
                Object.keys(jwtMiddlewareProtected).forEach((route) => {
                    let methods = jwtMiddlewareProtected[route];
                    if (route === trimmedPath && methods.indexOf(method) > -1){
                        fn(req, res)
                    }
                });
            }else{
                fn(req, res)
            }
        });

        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer),
            'user': req.headers.user
        };
        
        chosenHandler(data, (statusCode, payload) => {
            // Defaut statusCode
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            // Default payload
            payload = typeof (payload) === 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
});

server.listen(config.port, () => {
    db.startConnection();
    console.log(`Server is running on port ${config.port} in ${config.envName} mode`);  
});

const router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'auth': handlers.auth,
    'subscription': handlers.subscription,
    'transaction': handlers.transaction,
    'plan': handlers.plans
};

const jwtMiddlewareProtected = {
    'users': ['get', 'put'],
    'subscription': ['post', 'get', 'put'],
    'transaction': ['get']
};