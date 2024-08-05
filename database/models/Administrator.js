const mongoose = require('mongoose');

const AdministratorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    pw: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['product_manager', 'website_administrator'],
        required: true
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lockoutUntil: {
        type: Date,
        default: null
    }
});

const Administrator = mongoose.model('Administrator', AdministratorSchema);

module.exports = Administrator;