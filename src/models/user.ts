import mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshTokens: {
        type: [String],
        required: false
    }
},{
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);