const mongoose = require('mongoose');
//model for an entry in the shopping cart

const EntrySchema = new mongoose.Schema({
    //as relation to customer
    //need to resort to hav pnumber for each entry because
    //$pull wont work and idk why
    pnumber: {
        type: Number,
        required: true
        
    },

    drinkname: {
        type: String
     
    },

    drinkimg: {
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
}

    , {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
      }
    
); // JSON format, consisting of the name: type collection




const Entry = mongoose.model('Entry', EntrySchema);

module.exports = Entry;