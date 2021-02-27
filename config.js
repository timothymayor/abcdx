var environments = {};

// Staging (Default) environment
environments.staging = {
    'port': 9000,
    'envName': 'staging',
    'hashSecret': 'NairaboxBoxOfficeService',
    'mongodb': 'mongodb+srv://root:rootpa$$@cluster0-xgxsl.mongodb.net/nairabox-box-office?retryWrites=true&w=majority',
    'jwtOptions': {
        'issuer': 'JORG Technologies',
        'audience': 'http://nairabox.com',
        'expiresIn': '24h',
        'algorithm': 'RS256',
    }
};

// Production environment
environments.production = {
    'port': process.env.PORT || 5000,
    'envName': 'production',
    'hashSecret': 'NairaBoxOfficeService',
    'mongodb': 'mongodb+srv://root:rootpa$$@cluster0-xgxsl.mongodb.net/nairabox-box-office?retryWrites=true&w=majority',
    'jwtOptions': {
        'issuer': 'JORG Technologies',
        'audience': 'http://nairabox.com',
        'expiresIn': '24h',
        'algorithm': 'RS256',
    }
};

var currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;

