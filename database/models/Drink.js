const mongoose = require('mongoose');

const DrinkSchema = new mongoose.Schema({
    category: String,
    drinkimg:  String,
    regprice:  mongoose.Types.Decimal128,
    lprice: mongoose.Types.Decimal128,
    //PK is drinkname
    drinkname:  String
    
}); // JSON format, consisting of the name: type collection

//convert decimals to strings when.toJSON() is called in server side
// this is so that client-side can display the strings properly
DrinkSchema.set('toJSON', {
    transform: (doc, ret) => {
      if(ret.lprice) {
        ret.lprice = ret.lprice.toString();
      }

      if(ret.regprice){
        ret.regprice = ret.regprice.toString();
      }
      return ret;
    },
  });

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