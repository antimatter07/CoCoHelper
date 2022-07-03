const mongoose = require('mongoose');

const FavoritesSchema = new mongoose.Schema({

    pnumber: {
        type: Number,
        required: true
    },

    drinkname: String,
    drinkimg: String
   
});

const Favorites = mongoose.model('Favorites', FavoritesSchema);
module.exports = Favorites;