const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    pnumber: {
        type: Number,
        required: true,
        unique: true
    },
    pw: {
        type: String,
        required: true
    },
    // Array of Drinks, for rendering of favorite drinks of customer in Favorites Page
    // [0..*] at any time can have 0 to many drinks
    favoritedrinks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drink'
    }],
    paymentmethod: {
        type: String,
        default: null
    },
    methodno: {
        type: Number,
        default: null
    },
    // At any time customer can have 0 to 1 instances of [orderno, amountdue, status]
    // customer can only have 1 order at a time
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    /* [0..*] 0 to many Entry in shopping cart for each Customer */
    cart_entries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entry'
    }],
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lockoutUntil: {
        type: Date,
        default: null
    }
});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
