const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({

    pnumber: {
        type: Number,
        required: true
    },

    orderno: Number,
    orderdate: String,
    quantity: Number,
    amountdue: mongoose.Types.Decimal128,

    status: {
        type: String,
        enum: ['Ready', 'In Progress']
    }
});

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;