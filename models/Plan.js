const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const SubscriptionPlanSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    movies: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

SubscriptionPlanSchema.statics.make = function(payload) {
    return this.create(payload);
}

SubscriptionPlanSchema.statics.get = function (id){
    return this.findOne({ ['_id']: id });
}

SubscriptionPlanSchema.statics.getAll = function () {
    return this.find({});
}

SubscriptionPlanSchema.statics.remove = function (id) {
    return this.deleteOne({ _id: id});
}


SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
module.exports = SubscriptionPlan;