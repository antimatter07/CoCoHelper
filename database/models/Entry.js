const mongoose = require('mongoose');
//model for an entry in the shopping cart

const EntrySchema = new mongoose.Schema({
    drink: {
        type: Schema.Types.ObjectId,
        ref: 'Drink'
     
    },

    size: {
        type: String,
        enum: ['Regular', 'Large']
    },
    
    request: {
        type: String,
        default: null
    },

    amount: {
        type: Number
    }, 

    price: {
        type: mongoose.Types.Decimal128

    },

    sugarlevel : {
        type: mongoose.Types.Decimal128,
        
    },

    icelevel : {
        type: String,
        enum : ['more', 'normal', 'less', 'none']
    }
    
}); // JSON format, consisting of the name: type collection

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = Entry;