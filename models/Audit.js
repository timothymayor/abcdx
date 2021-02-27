const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const AuditSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    subscription: {
        type: ObjectId,
        ref: 'Subscription',
    },
    transactionID: {
        type: String,
        required: true,
    },
    method: {
        type: String,
        required: true,
        default: "Unspecified"
    },
    description: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionType: {
        type: String
    }
}, { timestamps: true });

AuditSchema.statics.make = function (payload) {
    return this.create(payload);
}

AuditSchema.statics.get = function (id) {
    return this.findOne({ ['_id']: id });
}

AuditSchema.statics.getAll = function (user) {
    return this.find({ user: user });
}

Audit = mongoose.model('Audit', AuditSchema);

module.exports = Audit;