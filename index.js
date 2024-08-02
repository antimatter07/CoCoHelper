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

 // connection string from Atlas using 'Copy connection string' : mongodb://localhost:27017/
 const mongoURI = 'mongodb://127.0.0.1:27017/CoCoDB';

 mongoose.connect(mongoURI,
{useNewURLParser: true, useUnifiedTopology: true}); // Create database connection
 
 
 // For File Uploads
 const fileUpload = require('express-fileupload');
 const bcrypt = require('bcrypt');
 const Drink = require("./database/models/Drink");
 const Customer = require("./database/models/Customer");
 const Order = require("./database/models/Order");
 const Entry = require("./database/models/Entry");
 const Favorites = require('./database/models/Favorites');
 const path = require('path');
 const saltRounds = 10;
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
                store: MongoStore.create({mongoUrl: mongoURI})
            }));


//destroy session when user logs out
app.get('/logout', function(req, res) {

    req.session.destroy(function(err) {
        if(err) throw err;

        /*
            redirects the client to `/profile` using HTTP GET,
            defined in `../routes/routes.js`
        */
        res.redirect('/login');
    });

})
//delete entries when user checks out
app.get('/deletecart', function(req, res) {

    console.log('delete cart request recieved: ' + req.session.pnumber)
    Entry.deleteMany({pnumber: req.session.pnumber}, function(err, docs) {
        if(err) {
            console.log(err);
        } else {
            console.log('deleted entries: ');
        }
    })

});
app.get('/addorder', function(req, res) {

    console.log('add order req recieved: ' + req.query.quantity +"" + req.query.amountdue);

    const newOrder = new Order({

        //_id determines Mongoose data type
        _id : new mongoose.Types.ObjectId(),

        pnumber: req.session.pnumber,
        quantity: req.query.quantity,
        amountdue: req.query.amountdue,
        orderno: req.query.orderno,
        status: req.query.status



    });

    newOrder.save(function(err) {
        if(err) {
            console.log(err);
            res.send(400, 'Bad Request');
        } else {
            console.log("new Order made: " +newOrder);
            
        }
    });

    Customer.findOneAndUpdate({pnumber: req.session.pnumber}, {order: newOrder._id},  function(err, docs) {

        if(err) {
            console.log(err);
        } else {
            console.log("retrieved customer to add order to: " + docs)
            res.redirect('back');


        }
    });

    
    
});
//request to delete cart entry from DB
app.get('/delete-entry', function(req, res) {

    console.log('delete entry recieved:' + req.query.drinkname);

    console.log(req.query.size);
    console.log(req.query.sugarlevel);
    console.log(req.query.icelevel);
    console.log(req.query.amount);

    console.log('sessioN: ' + req.session.pnumber);
    console.log("**QUERY DRINKNAME:" + req.query.drinkname +"****");
    
    var query = {
        drinkname: req.query.drinkname,
        size: req.query.size,
        sugarlevel: req.query.sugarlevel,
        icelevel: req.query.icelevel,
        amount: req.query.amount,
        pnumber: req.session.pnumber
    }
    if(req.session.pnumber) {

        //pull to DELETE specific entry from entry array of customer
        /*
        this does not work
        Customer.updateOne({pnumber: req.session.pnumber}, {
            $pull: {

            cart_entries: {drinkname: req.query.drinkname}}});
            */

        Entry.findOneAndDelete(query, function(err, docs) {
            console.log('entry deleted' + docs)
        });


    } else {
        res.redirect('back');
    }

});

//request to delete cart entry from DB
app.get('/find-entry', function(req, res) {

    console.log('find entry recieved:' + req.query.drinkname);

    console.log(req.query.size);
    console.log(req.query.sugarlevel);
    console.log(req.query.icelevel);
    console.log(req.query.amount);
    console.log("new price: " + req.query.newprice);

    console.log('session: ' + req.session.pnumber);
    console.log("**QUERY DRINKNAME:" + req.query.drinkname +"****");
    
    var query = {
        drinkname: req.query.drinkname,
        size: req.query.size,
        sugarlevel: req.query.sugarlevel,
        icelevel: req.query.icelevel,
        amount: req.query.amount,
        pnumber: req.session.pnumber
    }
    if(req.session.pnumber) {

        //pull to DELETE specific entry from entry array of customer
        /*
        this does not work
        Customer.updateOne({pnumber: req.session.pnumber}, {
            $pull: {

            cart_entries: {drinkname: req.query.drinkname}}});
            */

        Entry.findOneAndUpdate(query, {amount: req.query.newamount, price: req.query.newprice}, function(err, docs) {
            if(err) {
                console.log(err)
            } else
            console.log('entry found and udpated' + docs);
            res.status(200).send(docs.toJSON());
        });


    } else {
        res.redirect('back');
    }

});

//request to delete cart entry from DB
//request to delete cart entry from DB
app.get('/update-entryprice', function(req, res) {

    console.log('update entry amt request recieved:' + req.query.drinkname);

    console.log(req.query.size);
    console.log(req.query.sugarlevel);
    console.log(req.query.icelevel);
    console.log(req.query.amount);

    
    console.log("**QUERY DRINKNAME:" + req.query.drinkname +"****");
    
    var query = {
        drinkname: req.query.drinkname,
        size: req.query.size,
        sugarlevel: req.query.sugarlevel,
        icelevel: req.query.icelevel,
        amount: req.query.amount,
        pnumber: req.session.pnumber
    }
    if(req.session.pnumber) {

        //pull to DELETE specific entry from entry array of customer
        /*
        this does not work
        Customer.updateOne({pnumber: req.session.pnumber}, {
            $pull: {

            cart_entries: {drinkname: req.query.drinkname}}});
            */

        Entry.findOneAndUpdate(query, {amount: req.query.newamount}, function(err, docs) {
            if(err) {
                console.log(err)
            } else
            console.log('entry found and udpated' + docs);
            res.status(200).send(docs.toJSON());
        });


    } else {
        res.redirect('back');
    }

});






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
                res.render('cart', {cartentries});

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
        price: req.body.price,
        drinkimg : req.body.drinkimg,
        pnumber: req.session.pnumber


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

    console.log("find drink req received " + req.query.drinkname);

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

app.get('/profile',function(req, res) {

    if(req.session.pnumber) {
        res.redirect('/profile/' + req.session.pnumber);
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
        var projection = 'firstname lastname pnumber email';

        var userDetails = {};


        Customer.findOne(query, projection, function(err, result) {

            if(err) {
                console.log(err);
            } else {
                if(result != null) {
                    userDetails.firstname = result.firstname;
                    userDetails.lastname = result.lastname;
                    userDetails.pnumber = result.pnumber;
                    userDetails.email = result.email

                    res.render('profile', userDetails);
                } else {
                    res.redirect('/login');
                }
                //comment
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

                bcrypt.compare(req.body.password, result.pw, function(err, equal) {

                    if(equal) {
                       
                        res.redirect('/profile/' + customer.pnumber);
                    } else {

                        
                        //TODO:
                        //if not equal, display error message thru hbs or at least make field color red
                        res.render("login", {error: 'Incorrect password.'});
                    }

                })
            
                
            }
            else {
                res.render('login', {error: 'Incorrect email and/or password.'});
            }


        } 

    });

});
//POST request to register a user, create a new User in the DB
app.post('/registeruser', function(req,res) {
    console.log('post req received to register user: ' + req.body.firstname);

    //email and pnumber SHOULD be unique, check if it exists
    //if it doesnt exist, make account
    Customer.find({$or:[ {email:req.body.email}, {pnumber:req.body.pnumber}]}, function(err, docs) {
        if(err) {
            console.log(err);
            res.render('reg');
        } else {

            if(docs.length) {
                console.log('USER EXISTS! ' + docs);
                res.render('reg', {error: 'The email and/or phone number is already used by an existing user.'}); 
                
            } else {

                console.log('User does not exist, proceed with making a customer account');
                bcrypt.hash(req.body.cpassword, saltRounds, function(err, hash) {

                    Customer.create({
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        pnumber: req.body.pnumber,
                        pw: hash
            
            
                    }, function (err, docs) {
                        if (err){
                            console.log(err);
                        }
                        else{
                            res.redirect('/login');
                            
                            
                        }
                    });
                })

            }
        }
    });

    
    

});

//Render Status View
app.get('/status', function(req, res) {
    if(req.session.pnumber) {
        Order.find({pnumber: req.session.pnumber}, {}, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log("RETRIEVED ORDERS " + data);
                res.render('status', {data: data});
            }
        });
    } else {
        res.redirect('/login');
    }
});


//Render Favorites View
app.get('/favorites', function(req, res) {
    if(req.session.pnumber) {
        Favorites.find({pnumber: req.session.pnumber}, {}, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log("RETRIEVED FAVORITES " + data);
                res.render('favorites', {data: data});
            }
        });
    } else {
        res.redirect('/login');
    }
});


//Add Drink to Favorites
app.post('/addtofavorites', function(req,res) {
    Favorites.findOne({pnumber: req.session.pnumber, drinkname: req.body.drinkname}, function(err, success) {
        if(err) {
            console.log(err);
        } else if(success) {
            console.log("ALREADY IN FAVORITES");
        } else {
            const faveDrink = new Favorites({
                //_id determines Mongoose data type
                _id : new mongoose.Types.ObjectId(),
        
                pnumber: req.session.pnumber,
                drinkname: req.body.drinkname,
                drinkimg : req.body.drinkimg
            });
            
            faveDrink.save(function(err) {
                if(err) {
                    console.log(err);
                    res.send(400, 'Bad Request');
                } else {
                    console.log("ADDED TO FAVORITES " + faveDrink);
                }
            });
        }
    });
});


//Remove Drink from Favorites
app.post('/removefavorites', function(req,res) {
    Favorites.deleteOne({pnumber: req.session.pnumber, drinkname: req.body.drinkname}, function(err) {
        if(err) {
            console.log(err);
            res.send(400, 'Bad Request');
        } else {
            console.log("REMOVED FROM FAVORITES " + req.body.drinkname);
        }
    });
});


//render register page
app.get('/register', function(req, res) {

    res.render('reg');

    

    
});
//render log ihn apge
app.get('/login', function(req, res) {

    if(req.session.pnumber) {
        res.redirect('/profile/' + req.session.pnumber);
    } else {
    res.render('login');
    }

    

    
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