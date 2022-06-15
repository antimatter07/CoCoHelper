/*****************
 * 
 * To use mongoose and connect to the database
 * + schema model
 * + Create an instance of the schema model
 * + Insert it into the database via mongoose connection
 */

 const express = require('express');
 const app = new express();
 
 
 // For File Uploads
 const fileUpload = require('express-fileupload');
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


app.get('/', function(req, res) {
    res.render('main', {

    })
});

 
 var server = app.listen(3000, function() {
     console.log("Node server is running at port 3000....");
 });