const mongoose = require('mongoose');
//model for an entry in the shopping cart

const EntrySchema = new mongoose.Schema({
    
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


//when a doc is made, automaticall make object ID a field in the docu as well
//needed for deletion, updating in Shopping Cart page
EntrySchema.virtual('id', {
    id: this.id
});

const Entry = mongoose.model('Entry', EntrySchema);

module.exports = Entry;