/*****************
 * 
 * To use mongoose and connect to the database
 * + schema model
 * + Create an instance of the schema model
 * + Insert it into the database via mongoose connection
 */

 const express = require('express');
 // import module `express-session`
 const session = require('express-session');
 const app = new express();
 const mongoose = require('mongoose');
 var bodyParser = require('body-parser');

 const MongoStore = require('connect-mongo');

 mongoose.connect('mongodb://localhost/CoCoDB',
{useNewURLParser: true, useUnifiedTopology: true}); // Create database connection
 
 
 // For File Uploads
 const fileUpload = require('express-fileupload');

 const Drink = require("./database/models/Drink");
 const Customer = require("./database/models/Customer");
 const Orders = require("./database/models/Orders");
 const Entry = require("./database/models/Entry");
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

// session middleware and session store
app.use(session({ secret: 'CoCoHelper-session', 
                'resave': false, 
                'saveUninitialized': false,
                store: MongoStore.create({mongoUrl: 'mongodb://localhost/CoCoDB'})
            }));


app.get('/cart', function(req, res) {

    if(req.session.pnumber) {

        //add .populate and .exec to query so that actual cart_entrires are returned and NOT jsut 
        //object_ids of cart entries
        Customer.findOne({pnumber: req.session.pnumber}) .populate('cart_entries') 
        .exec(function(err,docs) {
            if(err) {
                console.log(err);
            } else {
                const cartentries = docs.cart_entries;
                console.log("ENTRIES RETRIEVED" + cartentries);
                res.render('cart', cartentries);

            }
        });

    } else {
        res.redirect('/login');
    }

});

//when user clicks add to cart, append new cart entry to the Entrires array of customer
app.post('/addtocart', function(req,res) {
    console.log('add to cart req recieved: ' + req.body.drinkname + req.body.price + req.body.size + req.body.sugarlevel + req.body.icelevel + "amt: " + req.body.amount);
    

    
    //make new Entry and append to array of Entries of curr Customer
    const newEntry = new Entry({

        //_id determines Mongoose data type
        _id : new mongoose.Types.ObjectId(),


        drinkname: req.body.drinkname,
        sugarlevel : req.body.sugarlevel,
        icelevel : req.body.icelevel,
        size :  req.body.size,
        amount : req.body.amount,
        price: req.body.price


    });

    //save New entry in DB
    newEntry.save(function(err) {
        if(err) {
            console.log(err);
            res.send(400, 'Bad Request');
        } else {
            console.log("new netry made: " +newEntry);
            
        }
    })

    

    //push ._id of new Entry, only used ._id for other Mongoose documents
    //link reference of newEntr to customer
    Customer.findOneAndUpdate({pnumber: req.session.pnumber}, {$push:{cart_entries: newEntry._id}},  function(err, docs) {

        if(err) {
            console.log(err);
        } else {
            console.log("retrieved customer to add entry to: " + docs)
            res.redirect('back');


        }
    });
    
    //res.redirect('back');

});

//returns NOT jsonified drink object
app.get('/find-drink-object', function(req, res) {

    console.log("find drink OBJECT (return non json) req received" + req.query.drinkname);

    Drink.findOne({drinkname: req.query.drinkname}, function(err, docs) {
        if(err) {
            console.log(err);
            res.redirect('back');
        } else {
            console.log("drink retrieved from add-drink request: " + docs);
            
            //toJSON() is called to parse Decimal128 types into string

            res.status(200).send(docs);
        }

    })

});

//when cart-icon of a drink in menu is clicked, return data about that specific drink to client
app.get('/find-drink', function(req, res) {

    console.log("find drink req received" + req.query.drinkname);

    Drink.findOne({drinkname: req.query.drinkname}, function(err, docs) {
        if(err) {
            console.log(err);
            res.redirect('back');
        } else {
            console.log("drink retrieved from find-drink request: " + docs);
            
            //toJSON() is called to parse Decimal128 types into string

            res.status(200).send(docs.toJSON());
        }

    })

});

app.get('/menu', function(req, res) {

    //if session doesnt exist, redirect to login page
    if(req.session.pnumber) {

        Drink.find({category: 'milktea'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved: ", docs);
                
                const milktea_drinks = docs;
                res.render('menu',{milktea_drinks});
                
               
            }
        });
    } else {
        res.redirect('/login');
    }


})
//pnumber since its unique for each customer, possibly can also use email
//sample req: /profile/12345678
//render profile page of user
app.get('/profile/:pnumber', function(req, res) {

    //find a user with pnumber equal to parameter in get URL(:pnumber)
    //only render profile page if the user is logged in (session object has a value)
    if(req.session.pnumber) {
        
        var query = {pnumber: req.params.pnumber};

        //what to return from query
        var projection = 'firstname lastname';

        var userDetails = {};


        Customer.findOne(query, projection, function(err, result) {

            if(err) {
                console.log(err);
            } else {
                if(result != null) {
                    userDetails.firstname = result.firstname;
                    userDetails.lastname = result.lastname;

                    res.render('profile', userDetails);
                } else {
                    res.redirect('/login');
                }
            }

        })

    } else {
        //to protect user data, redirect to login page 
        res.redirect('/login');
    }

});


//when user clicks on log in button 
app.post('/loginuser', function(req, res) {

    console.log("log in POST req recieved: " + req.body.email + " " + req.body.password);
    email = req.body.email.replace(" ", "");
   
    Customer.findOne({email: email}, function (err, result) {
        console.log("retrieved customer: " + result);
        if(err) {
            console.log(err)
        } else {
            if(result) {
                var customer = {

                    email: result.email,
                    pnumber: result.pnumber
                }

                //store to session object for future access
                //email, pnumber, and names can now be accessed from any succeeding HTTP request
                //while session hasnt ended
                //session can store multiple values
                req.session.email = customer.email;
                req.session.pnumber = customer.pnumber;
                req.session.firstname = result.firstname;
                req.session.lastname = result.lastname;

                console.log("retrieved customer: " + customer);

                //TODO: implement password hashing here later
                if(req.body.password === result.pw) {
                    console.log(req.body.password === result.pw);
                    res.redirect('/profile/' + customer.pnumber);
                } else {
                    //TODO:
                    //if not equal, display error message thru hbs or at least make field color red
                    res.redirect("/login");
                }
            }
            else {
                res.redirect('/login');
            }


        } 

    });

});
//POST request to register a user, create a new User in the DB
app.post('/registeruser', function(req,res) {
    console.log('post req received to register user: ' + req.body.firstname);
    //TODO: password hashing later
    Customer.create({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        pnumber: req.body.pnumber,
        pw: req.body.cpassword


    }, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            res.redirect('/login');
            
            
        }
    });
    

});

//render register page
app.get('/register', function(req, res) {

    res.render('reg');

    

    
});
//render log ihn apge
app.get('/login', function(req, res) {

    res.render('login');

    

    
});

app.get('/loginuser', function(req, res) {

    res.render('login');

    

    
});
/*Uploads actual drink image to public/drink_images. /add-drink adds doc to DB */
app.post('/upload-drinkimg', function(req, res) {

    const {drinkimg} = req.files
   
    
    drinkimg.mv(path.resolve(__dirname,'public/drink_images',drinkimg.name),(error) => {
        res.redirect('/')
    })

    
});

/*Request to delete a drink from the db */
app.get('/delete-drink', function(req, res) {

    var drinkname = req.query.drinkname;

    console.log("/delete-drink request recieved: " + drinkname);

    Drink.deleteOne({drinkname : drinkname}, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            
            
        }
    });



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
    

    console.log('post add-drink request received: %s %s %s %s', drinkname, lprice, category, filename);

    
    

        Drink.create({
        
            
            regprice: regprice,
            lprice: lprice,
            drinkname: drinkname,
            category: category,
            drinkimg: '/drink_images/' + filename
            
            

        }, (error,post) => {

           
            res.redirect('back');
        })

    
});

app.get('/', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'milktea'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved: ", docs);
            
            const milktea_drinks = docs;
            res.render('menu_admin',{milktea_drinks});
            
           
        }
    });

   

    

    
   
    
   
});

app.get('/milktea', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'milktea'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved for milktea: ", docs);
            
            const milktea_drinks = docs;
            res.render('menu_admin',{milktea_drinks});
            
            
           
        }
    });

   
app.get('/status', function(req, res) {
    db.findMany(Orders, {}, null, (data) => {
        res.render('status', {data: data});
    });
});
    

    
   
    
   
});

app.get('/fruittea', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'fruittea'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved for fruit tea: ", docs);
            
            const milktea_drinks= docs;
            res.render('menu_admin',{milktea_drinks});
           
            
           
        }
    });

   

    
   
});

app.get('/coffee', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'coffee'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved for fruit tea: ", docs);
            
            const milktea_drinks= docs;
            res.render('menu_admin',{milktea_drinks});
           
            
           
        }
    });

   

    
   
});

app.get('/slush', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'slush'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved for fruit tea: ", docs);
            
            const milktea_drinks= docs;
            res.render('menu_admin',{milktea_drinks});
           
            
           
        }
    });

   

    
   
});

app.get('/choco', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'choco'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved for fruit tea: ", docs);
            
            const milktea_drinks= docs;
            res.render('menu_admin',{milktea_drinks});
           
            
           
        }
    });

   

    
   
});

app.get('/freshtea', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'freshtea'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved for fruit tea: ", docs);
            
            const milktea_drinks= docs;
            res.render('menu_admin',{milktea_drinks});
           
            
           
        }
    });

   

    
   
});

app.get('/juice', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    Drink.find({category: 'juice'}, 'drinkname drinkimg category', function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Docs retrieved for fruit tea: ", docs);
            
            const milktea_drinks= docs;
            res.render('menu_admin',{milktea_drinks});
           
            
           
        }
    });

   

    
   
});

//below is menu requests for CUSTOMER 
app.get('/menu/milktea', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    if(req.session.pnumber) {
        Drink.find({category: 'milktea'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved for milktea: ", docs);
                
                const milktea_drinks = docs;
                res.render('menu',{milktea_drinks});
                
                
            
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/menu/juice', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    if(req.session.pnumber) {
        Drink.find({category: 'juice'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved for fruit tea: ", docs);
                
                const milktea_drinks= docs;
                res.render('menu',{milktea_drinks});
            
                
            
            }
        });
    } else {
        res.redirect('/login');
    }

   

    
   
});

app.get('/menu/freshtea', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    if(req.session.pnumber) {
        Drink.find({category: 'freshtea'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved for fruit tea: ", docs);
                
                const milktea_drinks= docs;
                res.render('menu',{milktea_drinks});
            
                
            
            }
        });
    } else {
        res.redirect('/login');
    }

   

    
   
});

app.get('/menu/fruittea', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    if(req.session.pnumber) {
        Drink.find({category: 'fruittea'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved for fruit tea: ", docs);
                
                const milktea_drinks= docs;
                res.render('menu',{milktea_drinks});
            
                
            
            }
        });
    } else {
        res.redirect('/login');
    }

   

    
   
});

app.get('/menu/coffee', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    if(req.session.pnumber) {
        Drink.find({category: 'coffee'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved for fruit tea: ", docs);
                
                const milktea_drinks= docs;
                res.render('menu',{milktea_drinks});
            
                
            
            }
        });
    } else {
        res.redirect('/login');
    }

   

    
   
});

app.get('/menu/slush', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    if(req.session.pnumber) {
        Drink.find({category: 'slush'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved for fruit tea: ", docs);
                
                const milktea_drinks= docs;
                res.render('menu',{milktea_drinks});
            
                
            
            }
        });
    } else {
        res.redirect('/login');
    }

   

    
   
});

app.get('/menu/choco', function(req, res) {
   
    //retrieve all Drinks in db and render to menu_admin.hbs
    if(req.session.pnumber) {
        Drink.find({category: 'choco'}, 'drinkname drinkimg category', function (err, docs) {
            if (err){
                console.log(err);
            }
            else{
                console.log("Docs retrieved for fruit tea: ", docs);
                
                const milktea_drinks= docs;
                res.render('menu',{milktea_drinks});
            
                
            
            }
        });
    } else res.redirect('/login');

   

    
   
});






 
 var server = app.listen(3000, function() {
     console.log("Node server is running at port 3000....");
 });