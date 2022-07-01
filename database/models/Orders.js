var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({

    pnumber: {
        type: Number,
        required: true
    },

    orderno: Number,
    orderdate: Date,
    itemname: String,
    itemsize: String,
    quantity: Number,
    amountdue: mongoose.Types.Decimal128,

    status: {
        type: String,
        enum: ['Ready', 'In Progress']
    }
});

module.exports = mongoose.model('Orders', OrderSchema);