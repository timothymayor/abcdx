const helpers = require('./helpers');
const UserModel = require('../models/User');
const SubscriptionModel = require('../models/Subscription');
const AuditModel = require('../models/Audit');
const SubscriptionPlanModel = require('../models/Plan');

var handlers = {};

handlers.ping = (data, callback) => {
    callback(406);
};

handlers.notFound = (data, callback) => {
    callback(404);
};

handlers.users = (data, callback) => {
    var acceptedMethods = ['post', 'get', 'put'];

    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._users = {};

handlers._users.post = (data, callback) => {
    var email = typeof (data.payload.email) === 'string' && data.payload.email.trim().length > 0
        ? data.payload.email.trim()
        : false;
    var password = typeof (data.payload.password) === 'object' && data.payload.password.length === 2
        ? data.payload.password
        : false;
    var fname = typeof (data.payload.first_name) === 'string' && data.payload.first_name.trim().length > 0
        ? data.payload.first_name.trim()
        : false
    var lname = typeof (data.payload.last_name) === 'string' && data.payload.last_name.trim().length > 0
        ? data.payload.last_name.trim()
        : false
    var phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length > 0
        ? data.payload.phone.trim()
        : false
    var address = typeof (data.payload.address) === 'string' && data.payload.address.trim().length > 0
        ? data.payload.address.trim()
        : null
    var dob = typeof (data.payload.dob) === 'string' && data.payload.dob.trim().length > 0
        ? data.payload.dob.trim()
        : null
    var gender = typeof (data.payload.gender) === 'string' && data.payload.gender.trim().length > 0
        ? data.payload.gender.trim()
        : ''

    UserModel.get('email', email).then(isExist => {
        if (isExist){
            return callback(400, {"message": "User with this email already exists"})
        }

        if (email && password && fname && lname && phone) {
            let [pass, verify] = password;
            if (pass === verify) {
                var hashedPassword = helpers.hash(pass);
                if (hashedPassword) {
                    let payload = {
                        email: email,
                        fname: fname,
                        lname: lname,
                        phone: phone,
                        password: hashedPassword,
                        address: address,
                        dob: dob,
                        gender: gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender
                    };
                    UserModel.make(payload).then(document => {
    
                        let encryptedData = (
                            ({ _id, fname, lname, email, address, dob, gender, hasSubscription, status }) => ({ _id, fname, lname, email, address, dob, gender, hasSubscription, status }))
                            (document);
                        let token = helpers.generateJWTToken(encryptedData);
    
                        callback(200, {
                            'message': 'OK', 'payload': {
                                'user': encryptedData,
                                'token': token,
                                'expires': Math.floor(Date.now() / 1000) + (60 * (60 * 24)),
                            }
                        });
    
                    }).catch(err => {
                        console.log(err)
                        callback(500, { 'message': 'Unable to create account. Please try again.' });
                    });
                } else {
                    callback(500, { 'message': 'Failed to create hash' });
                }
            } else {
                callback(400, { 'message': 'Passwords do not match' });
            }
        } else {
            callback(400, { 'message': 'missing required field(s)' });
        }
    }).catch(con => {
        return callback(500, {"message": "Internal Server Error"})
    })
    
};

handlers._users.get = (data, callback) => {
    var user = typeof (data.user) === 'string' && data.user.trim().length > 0
        ? data.user.trim()
        : false;
    if (user) {
        UserModel.get(user).then(document => {
            let payload = (
                ({ _id, email, fname, lname, phone, address, dob, gender, status, hasSubscription, createdAt }) => ({ _id, email, fname, lname, phone, address, dob, gender, status, hasSubscription, createdAt })
            )(document)
            callback(200, { 'message': 'OK', 'payload': payload });
        }).catch(err => {
            callback(500, { 'message': 'failed to fetch user information' })
        })
    } else {
        callback(400, { 'message': 'user identifier not provided' });
    }
};

handlers._users.put = (data, callback) => {
    var user = typeof (data.user) === 'string' && data.user.trim().length > 0
        ? data.user.trim()
        : false;
    if (user) {
        UserModel.update(user, data.payload).then(document => {
            if (document.nModified === 1) {
                callback(200, { 'message': 'Updated successfully' });
            } else {
                callback(500, { 'message': 'Failed to modify' });
            }

        }).catch(err => {
            callback(500, { 'message': 'Failed to update user information' })
        })
    } else {
        callback(400, { 'message': 'user identifier not provided' });
    }
};


handlers.auth = (data, callback) => {
    var acceptedMethods = ['post'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers._auth[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._auth = {};

handlers._auth.post = (data, callback) => {
    var email = typeof (data.payload.email) === 'string' && data.payload.email.trim().length > 0
        ? data.payload.email.trim()
        : false;
    var password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0
        ? data.payload.password.trim()
        : false;

    if (email && password) {
        UserModel.get('email', email).then(document => {
            let hashedPassword = helpers.hash(password);
            if (document['password'] === hashedPassword) {
                let encryptedData = (
                    ({ _id, fname, lname, email, address, dob, gender, hasSubscription, status }) => ({ _id, fname, lname, email, address, dob, gender, hasSubscription, status }))
                    (document);
                let token = helpers.generateJWTToken(encryptedData);
                callback(200, {
                    'message': 'OK', 'payload': {
                        'user': encryptedData,
                        'token': token,
                        'expires': Math.floor(Date.now() / 1000) + (60 * (60 * 24)),
                    }
                });
            } else {
                callback(401, { 'message': 'Invalid email and/or password combination' });
            }
        }).catch(err => {
            callback(401, { 'message': 'Invalid email and/or password combination' });
        })
    } else {
        callback(400, { 'message': 'missing required field(s)' })
    }
};

handlers.subscription = (data, callback) => {
    var acceptedMethods = ['post', 'get', 'put'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers._subscription[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._subscription = {};

handlers._subscription.get = (data, callback) => {
    var user = typeof (data.user) === 'string' && data.user.trim().length > 0
        ? data.user.trim()
        : false;

    if (user) {
        let { format, id } = data.queryStringObject;
        if (format) {
            if (format === 'all') {
                SubscriptionModel.getAll(user).then(document => {
                    callback(200, { "message": "OK", "payload": document })
                }).catch(err => {
                    callback(500, { "message": "Failed to get subscription history" })
                })
            } else {
                callback(404, { "message": "Unknown format specified" })
            }
        } else if (id) {
            SubscriptionModel.get(id).then(document => {
                callback(200, { "message": "OK", "payload": document })
            }).catch(err => {
                callback(500, { "message": "Failed to fetch subscription information" })
            })
        } else {
            UserModel.get(user).then(document => {
                let { subscriptionId } = document;
                if (subscriptionId) {
                    SubscriptionModel.get(subscriptionId).then(doc => {
                        callback(200, { "message": "OK", "payload": doc })
                    }).catch(err => {
                        callback(500, { "message": "Failed to fetch subscription information" })
                    })
                } else {
                    callback(404, { "message": "User has not subscribed" })
                }
            }).catch(err => {
                console.log(err)
                callback(500, { "message": "Failed to fetch user information" })
            });
        }
    } else {
        callback(500, { "message": "Sorry an error occured " })
    }
};

handlers._subscription.post = (data, callback) => {
    var user = typeof (data.user) === 'string' && data.user.trim().length > 0
        ? data.user.trim()
        : false;

    var plan = typeof (data.payload.plan) === 'string' && data.payload.plan.trim().length > 0
        ? data.payload.plan.trim()
        : false;

    var reference = typeof (data.payload.ref) === 'string' && data.payload.ref.trim().length > 0
        ? data.payload.ref.trim()
        : false;

    var channel = typeof (data.payload.channel) === 'string' && data.payload.channel.trim().length > 0
        ? data.payload.channel.trim()
        : 'Unspecified';

    if (user && plan && reference) {
        UserModel.get(user).then(document => {
            // Validate Transaction Reference
            SubscriptionPlanModel.get(plan).then(sub => {
                let date = new Date();
                let expires = date.setDate(date.getDate() + sub.duration);
                let payload = {
                    user: user,
                    subscriptionPlan: sub._id,
                    subscriptionType: 'regular',
                    expires: expires,
                    status: 'active',
                    active: true,
                };
                SubscriptionModel.make(payload).then(doc => {
                    let trans = {
                        user: user,
                        subscription: doc._id,
                        transactionID: reference,
                        description: "Subscription for the month of ",
                        amount: sub.amount,
                        transactionType: 'debit',
                        method: channel
                    };
                    AuditModel.make(trans).then(audit => {
                        document.subscriptionId = doc._id;
                        document.hasSubscription = true;
                        document.save();
                        callback(200, { "message": "OK", "payload": doc })
                    }).catch(err => {
                        callback(500, { "message": "Failed to save transaction" })
                    })
                }).catch(err => {
                    callback(500, { "message": "Sorry an error occured " })
                })
            }).catch(err => {
                callback(404, { "message": "Invalid plan selected" })
            })
        }).catch(err => {
            callback(404, { "message": "User has not subscribed" })
        })
    } else {
        callback(400, { "message": "missing required field(s)" })
    }
};

handlers._subscription.put = (data, callback) => {
    var user = typeof (data.user) === 'string' && data.user.trim().length > 0
        ? data.user.trim()
        : false;

    if (user) {
        UserModel.get(user).then(document => {
            let { subscriptionId } = document;
            SubscriptionModel.cancel(subscriptionId).then(doc => {
                document.hasSubscription = false;
                document.save();

                callback(200, { "message": "Subscription cancelled" });
            }).catch(err => {
                callback(500, { "message": "Sorry an error occured" });
            })
        }).catch(err => {
            callback(500, { "message": "Failed to fetch user information" })
        })
    } else {
        callback(500, { "message": "Sorry an error occurred" })
    }
};

handlers.transaction = (data, callback) => {
    var acceptedMethods = ['get'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers._transaction[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._transaction = {};

handlers._transaction.get = (data, callback) => {
    var user = typeof (data.user) === 'string' && data.user.trim().length > 0
        ? data.user.trim()
        : false;

    if (user) {
        let { format, id } = data.queryStringObject;

        if (format) {

        } else if (id) {
            AuditModel.get(id).then(document => {
                callback(200, { "message": "OK", "payload": document })
            }).catch(err => {
                callback(500, { "message": "Sorry an error occurred " })
            })
        } else {
            UserModel.get(user).then(document => {
                AuditModel.getAll(document._id).then(doc => {
                    callback(200, { "message": "OK", "payload": doc })
                }).catch(err => {
                    callback(500, { "message": "Sorry an error occurred" })
                })
            }).catch(err => {
                callback(500, { "message": "Sorry there was a problem" })
            })
        }
    } else {
        callback(500, { "message": "Sorry an error occured " })
    }
};


handlers.plans = (data, callback) => {
    var acceptedMethods = ['post', 'get'];
    if (acceptedMethods.indexOf(data.method) > -1) {
        handlers._plans[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._plans = {};

handlers._plans.get = (data, callback) => {
    let { id } = data.queryStringObject;
    if (id) {
        SubscriptionPlanModel.get(id).then(document => {
            callback(200, { "message": "OK", "payload": document })
        }).catch(err => {
            callback(500, { "message": "Sorry an error occurred " })
        })
    } else {
        SubscriptionPlanModel.getAll().then(document => {
            callback(200, { "message": "OK", "payload": document })
        }).catch(err => {
            callback(500, { "message": "Sorry and error occurred" })
        })
    }
};


handlers._plans.post = (data, callback) => {
    if (data.headers['requester-x-id'] === 'nairaboxadmin') {
        var name = typeof (data.payload.name) === 'string' && data.payload.name.trim().length > 0
            ? data.payload.name.trim()
            : false;

        var description = typeof (data.payload.description) === 'string' && data.payload.description.trim().length > 0
            ? data.payload.description.trim()
            : false;

        var amount = typeof (data.payload.amount) === 'number' && data.payload.amount > 0
            ? data.payload.amount
            : false;

        var duration = typeof (data.payload.duration) === 'number' && data.payload.duration > 0
            ? data.payload.duration
            : false;

        var movies = typeof (data.payload.movies) === 'number' && data.payload.movies > 0
            ? data.payload.movies
            : false;

        if (name && description && amount && duration && movies) {
            let payload = {
                name: name,
                description: description,
                amount: amount,
                duration: duration,
                movies: movies
            };
            SubscriptionPlanModel.make(payload).then(document => {
                callback(200, { "message": "Plan created successfully" })
            }).catch(err => {
                callback(500, { "message": "Sorry an error occurred " })
            })
        }
    } else {
        callback(404)
    }
}

module.exports = handlers;