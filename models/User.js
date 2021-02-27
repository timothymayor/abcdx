const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const UserSchema = new Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        minlength: 10,
        maxlength: 13,
    },
    address: {
        type: String,
    },
    dob: {
        type: Date,
    },
    gender: {
        type: String
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    hasSubscription: {
        type: Boolean,
        default: false,
    },
    subscriptionId: {
        type: ObjectId
    },
    status: {
        type: String,
        required: true,
        default: 'active'
    }
}, { timestamps: true });


UserSchema.statics.make = function (payload) {
    return this.create(payload);
};

UserSchema.statics.get = function (field = 'id', user) {
    return this.findOne({ [field]: user });
}

UserSchema.statics.update = function (id, obj) {
    return this.updateOne({ _id: id }, {
        $set: obj
    });
}

UserSchema.statics.delete = function (id) {
    return this.deleteOne({ _id: id })
}

UserSchema.statics.disable = function (id) {
    return this.updateOne({ _id: id }, {
        $set: {
            active: false,
            status: 'banned'
        }
    })
}

UserSchema.statics.enable = function (id) {
    return this.updateOne({ _id: id }, {
        $set: {
            active: true,
            status: 'active'
        }
    })
}


User = mongoose.model('User', UserSchema);

module.exports = User;