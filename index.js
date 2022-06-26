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

/*Uploads actual drink image to public/drink_images. /add-drink adds doc to DB */
app.post('/upload-drinkimg', function(req, res) {

    const {drinkimg} = req.files
   
    
    drinkimg.mv(path.resolve(__dirname,'public/drink_images',drinkimg.name),(error) => {
        res.redirect('/')
    })

    
});
/*When add drink button is clicked */
app.post('/add-drink', function(req, res) {

    var regprice= req.body.regprice;
    var lprice = req.body.lprice;
    var drinkname =  req.body.drinkname;
    var category = req.body.category;
    var drinkimg = req.body.drinkimg;

    //remove fakepath from filename
    var filename = drinkimg.replace(/C:\\fakepath\\/, '');
    

    console.log('post request received: %s %s %s %s', drinkname, lprice, category, filename);

    
    

        Drink.create({
        
            
            regprice: regprice,
            lprice: lprice,
            drinkname: drinkname,
            category: category,
            drinkimg: '/drink_images/' + filename
            
            

        }, (error,post) => {

           
            res.redirect('/')
        })

    
});

app.get('/', function(req, res) {


    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({}, 'drinkname drinkimg', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved: ", docs);
            const admin_drinks = docs;
            res.render('menu_admin',{admin_drinks});
        }
    });

   
    
   
});

 
 var server = app.listen(3000, function() {
     console.log("Node server is running at port 3000....");
 });