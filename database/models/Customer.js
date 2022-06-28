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
    //both email and pnumber should be unique to each customer
    email: {
        type: Number,
        required: true
        
    },
    pnumber: {
        type: String,
        required: true
        
    },

    pw :{
        type:String,
        required: true
    },

    //Array of Drinks, for rendering of favorte drinks of customer in Favorites Page
    //[0..*] at any time can have 0 to many drinks 
    favoritedrinks : [{
        type: Schema.Types.ObjectId,
        ref: 'Drink'

    }],

    
    paymentmethod : {
        type: String,
        default: null
        
    },

    methodno : {
        type: Number,
        default: null
    }


});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;