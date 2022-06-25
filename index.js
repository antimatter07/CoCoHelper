/*****************
 * 
 * To use mongoose and connect to the database
 * + schema model
 * + Create an instance of the schema model
 * + Insert it into the database via mongoose connection
 */

 const express = require('express');
 const app = new express();
 const mongoose = require('mongoose');
 var bodyParser = require('body-parser');

 mongoose.connect('mongodb://localhost/CoCoDB',
{useNewURLParser: true, useUnifiedTopology: true}); // Create database connection
 
 
 // For File Uploads
 const fileUpload = require('express-fileupload');

 const Drink = require("./database/models/Drink");
 const path = require('path');

 // Initialize data and static folder that our app will use
 app.use(express.json()); // Use JSON throughout our app for parsing
 app.use(express.urlencoded( {extended: true})); // Information consists of more than just strings
 app.use(express.static('public')); // static directory name, meaning that the application will also refer to a folder named 'public'
 app.use(fileUpload()); // for fileuploading

 
 /* using handlebars */
 
 var hbs = require('hbs');
 

app.set('view engine','hbs');

hbs.registerPartials(__dirname + '/views/partials');


app.post('/add-drink', function(req, res) {

    var regprice= req.body.regprice;
    var lprice = req.body.lprice;
    var drinkname =  req.body.drinkname;
    var category = req.body.category;

    console.log('post received: %s %s', drinkname, lprice);

    const {drinkimg} = req.files
    
    drinkimg.mv(path.resolve(__dirname,'public/drink_images',drinkimg.name),(error) => {
        Drink.create({
            
            ...req.body,
            drinkimg:'/drink_images/'+drinkimg.name,
            /*
            regprice: req.body.regprice,
            lprice: req.body.lprice,
            drinkname: req.body.drinkname
            */
            
            

        }, (error,post) => {

           
            res.redirect('/')
        })
    })
});

app.get('/', function(req, res) {
    res.render('menu_admin', {

    })
});

 
 var server = app.listen(3000, function() {
     console.log("Node server is running at port 3000....");
 });