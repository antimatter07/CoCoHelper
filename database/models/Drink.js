const mongoose = require('mongoose');

const DrinkSchema = new mongoose.Schema({
    category: String,
    drinkimg:  String,
    regprice:  mongoose.Types.Decimal128,
    lprice: mongoose.Types.Decimal128,
    //PK is drinkname
    drinkname:  String
    
}); // JSON format, consisting of the name: type collection

const Drink = mongoose.model('Drink', DrinkSchema);

module.exports = Drink;
/* 

<div id="edit-popup" >
        
        <h1>Add Drink to Menu</h1>
        

        <label for="drinkimg">Select an image for the drink:</label>

        <input type="file" id="drinkimg" name="drinkimg">
        <form action = "/add-drink" enctype="multipart/form-data">
            <label for="regprice">Regular Price:</label>
            <input type="number" id = "regprice" placeholder="Enter Regular Price" name="regprice" required>

        

            <label for="lprice"><br>Large Price:</label>
            <input type="number" id = "lprice" placeholder="Enter Large Price" name="lprice" required>

            <label for="drinkname"><br>Name:</label>
            <input type="text" id="drinkname" placeholder="Enter Drink Name" name="drinkname" required>
        </form>

        <button id = "savebutton" type="button">Add Drink</button>
        

    </div>
    



*/