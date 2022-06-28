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
    //both or either can be PK, so can use maybe as param sa HTTP requests
    //to render each page for each user
    email: {
        type: String,
        required: true
        
    },
    pnumber: {
        type: Number,
        required: true
        
    },

    pw :{
        type:String,
        required: true
    },

    //Array of Drinks, for rendering of favorte drinks of customer in Favorites Page
    //[0..*] at any time can have 0 to many drinks 
    // can alternatively just be an array of drinknames
    //since with drinkname (PK of Drink), you can make a query for the drink img from the Drinks in db
    favoritedrinks : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Drink'

    }],

    
    paymentmethod : {
        type: String,
        default: null
        
    },

    methodno : {
        type: Number,
        default: null
    },
    //maybe make Order another schema? o kahit hindi na 
    //at any time customer can have 0 to 1 instances of [orderno, amountdue, status]
    //customer can only have 1 order at at ime
    //for order status
    orderno : {
        type: Number
    },

    amountdue : {
        type: mongoose.Types.Decimal128
    },

    status : {
        type: String,
        enum: ['Ready', 'In Progress']

    },

    /*[0..*] 0 to many Entry in shopping cart for each Customer*/
    //for rendering shopping cart page of customer
    cart_entries : [{
        type:  mongoose.Schema.Types.ObjectId,
        ref: 'Entry'

    }]





});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;