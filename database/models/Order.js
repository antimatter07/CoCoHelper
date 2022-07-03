var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({

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

module.exports = mongoose.model('Order', OrderSchema);