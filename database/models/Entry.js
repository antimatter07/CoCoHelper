const mongoose = require('mongoose');
//model for an entry in the shopping cart

const EntrySchema = new mongoose.Schema({
    drinkname: {
        type: String
     
    },

    size: {
        type: String,
        enum: ['regular', 'large']
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
        type: String
        
    },

    icelevel : {
        type: String,
        enum : ['more', 'normal', 'less', 'none']
    }
    
}); // JSON format, consisting of the name: type collection

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = Entry;