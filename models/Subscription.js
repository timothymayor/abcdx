const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SubscriptionSchema = new Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    subscriptionPlan: {
        type: ObjectId,
        ref: 'SubscriptionPlan',
        required: true,
    },
    subscriptionType: {
        type: String,
        required: true,
    },
    movies: [
        { showtime: String, date: Date }
    ],
    expires: {
        type: Date,
        required: true,
    },
    status: {
        type: String
    },
    active: {
        type: Boolean,
        required: true
    }
}, { timestamps: true });


SubscriptionSchema.statics.make = function (payload) {
    return this.create(payload);
}

SubscriptionSchema.statics.get = function (field = 'id', id) {
    return this.findOne({ [field]: id });
}

SubscriptionSchema.statics.getAll = function (user) {
    return this.find({ user: user });
}

SubscriptionSchema.statics.cancel = function (id, status = 'cancelled') {
    return this.updateOne({ _id: id }, {
        $set: {
            active: false,
            status: status
        }
    })
}

SubscriptionSchema.statics.redeem = function (id, showtime) {
    return this.updateOne({ _id: id }, {
        $push: {
            showtime: showtime,
            date: new Date().now
        }
    })
}

Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;