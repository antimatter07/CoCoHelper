/*****************
 *
 * To use mongoose and connect to the database
 * + schema model
 * + Create an instance of the schema model
 * + Insert it into the database via mongoose connection
 */

const express = require("express");
const config = require("./config");
const session = require("express-session");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");
const authMiddleware = require('./authMiddleware');

const winston = require("winston");
const logtail = new Logtail(config.logtailKey);
require("winston-daily-rotate-file");

const app = new express();

const logtailTransport = new LogtailTransport(logtail);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    logtailTransport,
  ]
});

if (process.env.NODE_ENV !== "production") {
  const fileTransport = new winston.transports.DailyRotateFile({
    filename: "logs/application-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
  });
  logger.add(fileTransport);
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const MongoStore = require("connect-mongo");

const mongoURI = config.mongoURI;

mongoose
  .connect(mongoURI, { useNewURLParser: true, useUnifiedTopology: true })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", { error: err });
    process.exit(1);
  });

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const Drink = require("./database/models/Drink");
const Customer = require("./database/models/Customer");
const Order = require("./database/models/Order");
const Entry = require("./database/models/Entry");
const Favorites = require("./database/models/Favorites");
const UserSecurity = require("./database/models/UserSecurity");
const SecurityQuestions = require("./database/models/SecurityQuestions");
const path = require("path");
const saltRounds = 10;
// lockout mechanism stuff
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`, { ip: req.ip });
  next();
});

var hbs = require("hbs");

app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoURI }),
  })
);
logger.info("Session middleware set up");

const adminRoutes = require("./routes/adminRoutes")(logger);

app.use("/admin", adminRoutes);

app.get('/logout', authMiddleware('customer'), function(req, res) {
  try {
    logger.info(`User logged out`, { user: req.session.pnumber });
    req.session.destroy(function (err) {
      if (err) {
        logger.error("Error destroying session", { error: err });
        throw err;
      }
      res.redirect("/login");
    });
  } catch (err) {
    logger.error("Error logging out", { error: err });
    next(new Error('Internal Server Error'));
  }
});

app.get('/deletecart', authMiddleware('customer'), function(req, res) {
  logger.info(`Delete cart request received`, { user: req.session.pnumber });
  Entry.deleteMany({ pnumber: req.session.pnumber }, function (err, docs) {
    if (err) {
      logger.error("Error deleting cart entries", { error: err });
      return next(new Error('Internal Server Error'));
    }
    logger.info("Cart entries deleted", { user: req.session.pnumber });
    res.status(200).send("Cart entries deleted");
  });
});

app.get('/addorder', authMiddleware('customer'), function(req, res) {
  logger.info("Add order request received", {
    user: req.session.pnumber,
    quantity: req.query.quantity,
    amountdue: req.query.amountdue,
  });

  const newOrder = new Order({
    _id: new mongoose.Types.ObjectId(),
    pnumber: req.session.pnumber,
    quantity: req.query.quantity,
    amountdue: req.query.amountdue,
    orderno: req.query.orderno,
    status: req.query.status,
  });

  newOrder.save(function (err) {
    if (err) {
      logger.error("Error saving new order", { error: err });
      res.status(400).send("Bad Request");
    } else {
      logger.info("New order created", { order: newOrder });
    }
  });

  Customer.findOneAndUpdate(
    { pnumber: req.session.pnumber },
    { order: newOrder._id },
    function (err, docs) {
      if (err) {
        logger.error(err);
      } else {
        logger.info("Retrieved customer to add order to: " + docs);
        res.redirect("back");
      }
    }
  );
});

app.get('/delete-entry', authMiddleware('customer'), function(req, res) {
  logger.info("Delete entry request received", {
    user: req.session.pnumber,
    drinkname: req.query.drinkname,
  });

  var query = {
    drinkname: req.query.drinkname,
    size: req.query.size,
    sugarlevel: req.query.sugarlevel,
    icelevel: req.query.icelevel,
    amount: req.query.amount,
    pnumber: req.session.pnumber,
  };
  if (req.session.pnumber) {
    Entry.findOneAndDelete(query, function (err, docs) {
      if (err) {
        logger.error("Error deleting entry", { error: err });
      } else {
        logger.info("Entry deleted", { entry: docs });
      }
    });
  } else {
    res.redirect("back");
  }
});

app.get('/find-entry', authMiddleware('customer'), function(req, res) {
  logger.info("Find entry request received", {
    drinkname: req.query.drinkname,
    size: req.query.size,
    sugarlevel: req.query.sugarlevel,
    icelevel: req.query.icelevel,
    amount: req.query.amount,
    newprice: req.query.newprice,
    session: req.session.pnumber,
  });

  var query = {
    drinkname: req.query.drinkname,
    size: req.query.size,
    sugarlevel: req.query.sugarlevel,
    icelevel: req.query.icelevel,
    amount: req.query.amount,
    pnumber: req.session.pnumber,
  };

  if (req.session.pnumber) {
    Entry.findOneAndUpdate(
      query,
      { amount: req.query.newamount, price: req.query.newprice },
      function (err, docs) {
        if (err) {
          logger.error("Error updating entry", { error: err });
          next(new Error('Internal Server Error'));
        } else {
          logger.info("Entry found and updated", { entry: docs });
          res.status(200).send(docs.toJSON());
        }
      }
    );
  } else {
    res.redirect("back");
  }
});

app.get('/update-entryprice', authMiddleware('customer'), function(req, res) {
  logger.info("Update entry amount request received", {
    drinkname: req.query.drinkname,
    size: req.query.size,
    sugarlevel: req.query.sugarlevel,
    icelevel: req.query.icelevel,
    amount: req.query.amount,
  });

  var query = {
    drinkname: req.query.drinkname,
    size: req.query.size,
    sugarlevel: req.query.sugarlevel,
    icelevel: req.query.icelevel,
    amount: req.query.amount,
    pnumber: req.session.pnumber,
  };

  if (req.session.pnumber) {
    Entry.findOneAndUpdate(
      query,
      { amount: req.query.newamount },
      function (err, docs) {
        if (err) {
          logger.error("Error updating entry", { error: err });
          next(new Error('Internal Server Error'));
        } else {
          logger.info("Entry found and updated", { entry: docs });
          res.status(200).send(docs.toJSON());
        }
      }
    );
  } else {
    res.redirect("back");
  }
});

app.get('/cart', authMiddleware('customer'), async function(req, res) {
  try {
    if (!req.session.pnumber) {
      logger.warn("Unauthorized access attempt to cart", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.redirect("/login");
    }
    logger.info("Authorized access to cart", {
      url: req.originalUrl,
      user: req.session.pnumber,
    });
    const customer = await Customer.findOne({ pnumber: req.session.pnumber })
      .populate("cart_entries")
      .exec();
    const cartentries = customer.cart_entries;
    logger.info("Cart entries retrieved", { entries: cartentries });
    res.render("cart", { cartentries });
  } catch (err) {
    logger.error("Error retrieving cart entries", { error: err });
    next(new Error('Internal Server Error'));
  }
});

app.post('/addtocart', authMiddleware('customer'), async function(req, res) {
  try {
    logger.info("Add to cart request received", {
      user: req.session.pnumber,
      drinkname: req.body.drinkname,
    });

    const newEntry = new Entry({
      _id: new mongoose.Types.ObjectId(),
      drinkname: req.body.drinkname,
      sugarlevel: req.body.sugarlevel,
      icelevel: req.body.icelevel,
      size: req.body.size,
      amount: req.body.amount,
      price: req.body.price,
      drinkimg: req.body.drinkimg,
      pnumber: req.session.pnumber,
    });

    await newEntry.save();
    logger.info("New cart entry created", { entry: newEntry });

    const customer = await Customer.findOneAndUpdate(
      { pnumber: req.session.pnumber },
      { $push: { cart_entries: newEntry._id } }
    );
    logger.info("Customer updated with new cart entry", { customer: customer });

    res.redirect("back");
  } catch (err) {
    logger.error("Error adding to cart", { error: err });
    res.status(400).send("Bad Request");
  }
});

app.get('/find-drink-object', authMiddleware('customer'), async function(req, res) {
  try {
    logger.info(
      "find drink OBJECT (return non json) req received" + req.query.drinkname
    );

    const drink = await Drink.findOne({
      drinkname: req.query.drinkname,
    }).exec();
    if (!drink) {
      logger.error("Drink not found");
      return res.redirect("back");
    }

    logger.info("Drink retrieved from add-drink request: " + drink);

    res.status(200).send(drink);
  } catch (err) {
    logger.error(err);
    next(new Error('Internal Server Error'));
  }
});

app.get('/find-drink', authMiddleware('customer'), async function(req, res) {
  try {
    logger.info("find drink req received " + req.query.drinkname);

    const drink = await Drink.findOne({
      drinkname: req.query.drinkname,
    }).exec();
    if (!drink) {
      logger.error("Drink not found");
      return res.redirect("back");
    }

    logger.info("Drink retrieved from find-drink request: " + drink);

    res.status(200).send(drink.toJSON());
  } catch (err) {
    logger.error(err);
    next(new Error('Internal Server Error'));
  }
});

app.get('/menu', authMiddleware('customer'), function(req, res) {
  try {
    if (!req.session.pnumber) {
      logger.warn("Unauthorized access attempt to menu", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.redirect("/login");
    }
    logger.info("Authorized access to menu", {
      url: req.originalUrl,
      user: req.session.pnumber,
    });

    Drink.find(
      { category: "milktea" },
      "drinkname drinkimg category",
      function (err, docs) {
        if (err) {
          logger.error(err);
          return next(new Error('Internal Server Error'));
        } else {
          logger.info("Docs retrieved: ", docs);
          const milktea_drinks = docs;
          res.render("menu", { milktea_drinks });
        }
      }
    );
  } catch (error) {
    logger.error("Error in /menu route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get('/profile', authMiddleware('customer'), function(req, res) {
  try {
    if (!req.session.pnumber) {
      logger.warn("Unauthorized access attempt to profile", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.redirect("/login");
    }
    logger.info("Authorized access to profile", {
      url: req.originalUrl,
      user: req.session.pnumber,
    });

    res.redirect("/profile/" + req.session.pnumber);
  } catch (error) {
    logger.error("Error in /profile route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/profile/:pnumber", async function (req, res) {
  try {
    if (!req.session.pnumber) {
      logger.warn("Unauthorized access attempt to specific profile", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        attemptedProfile: req.params.pnumber,
      });
      return res.redirect("/login");
    }

    const result = await Customer.findOne(
      { pnumber: req.params.pnumber },
      "firstname lastname pnumber email"
    );

    if (!result) {
      logger.warn("Profile not found", {
        requestedProfile: req.params.pnumber,
      });
      return res.status(404).render("error", { message: "Profile not found" });
    }

    logger.info("User profile retrieved successfully", {
      user: req.params.pnumber,
    });
    res.render("profile", result);
  } catch (error) {
    logger.error("Error retrieving user profile", {
      error: error,
      user: req.params.pnumber,
    });
    res.status(500).render("error", { message: "An error occurred" });
  }
});

app.post("/loginuser", async function (req, res) {
  try {
    const email = req.body.email.replace(" ", "");
    const customer = await Customer.findOne({ email: email });

    if (!customer) {
      logger.warn("Failed login attempt - user not found", { email: req.body.email });
      return res.render("login", { error: "Incorrect email and/or password." });
    }

    // Check if account is locked
    if (customer.lockoutUntil && customer.lockoutUntil > Date.now()) {
      logger.warn("Login attempt on locked account", { email: req.body.email });
      return res.render("login", { error: "Account is temporarily locked. Please try again later or reset your password." });
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, customer.pw);
    
    if (isPasswordValid) {
      // Reset failed attempts on successful login
      customer.failedLoginAttempts = 0;
      customer.lockoutUntil = null;
      await customer.save();

      req.session.email = customer.email;
      req.session.pnumber = customer.pnumber;
      req.session.firstname = customer.firstname;
      req.session.lastname = customer.lastname;

      logger.info("Successful login", { email: req.body.email });
      res.redirect("/profile/" + customer.pnumber);
    } else {
      // Increment failed attempts
      customer.failedLoginAttempts += 1;

      if (customer.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        customer.lockoutUntil = new Date(Date.now() + LOCKOUT_TIME);
        logger.warn(`Account locked: ${email}`);
      }

      await customer.save();

      if (customer.lockoutUntil && customer.lockoutUntil > Date.now()) {
        logger.warn("Account locked after failed attempt", { email: req.body.email });
        res.render("login", { error: "Account is temporarily locked. Please try again later or reset your password." });
      } else {
        logger.warn("Failed login attempt - incorrect password", { email: req.body.email });
        res.render("login", { error: "Incorrect email and/or password." });
      }
    }
  } catch (error) {
    logger.error("Error during login process", { error: error, email: req.body.email });
    res.status(500).render("error", { message: "An error occurred during login" });
  }
});

app.post("/registeruser", function (req, res) {
  try {
    logger.info("User registration attempt", { email: req.body.email });

    Customer.find(
      { $or: [{ email: req.body.email }, { pnumber: req.body.pnumber }] },
      function (err, docs) {
        if (err) {
          logger.error("Error finding existing user", { error: err });
          res.render("reg");
        } else {
          if (docs.length) {
            res.render("reg", {
              error:
                "The email and/or phone number is already used by an existing user.",
            });
          } else {
            bcrypt.hash(req.body.cpassword, saltRounds, function (err, hash) {
              Customer.create(
                {
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  email: req.body.email,
                  pnumber: req.body.pnumber,
                  pw: hash,
                },
                function (err, docs) {
                  if (err) {
                    logger.error("Error creating new user", { error: err });
                  } else {
                    logger.info("New user registered", {
                      email: req.body.email,
                    });
                    UserSecurity.create(
                      {
                        pnumber: req.body.pnumber,
                        security_questions: [req.body.question1, req.body.question2, req.body.question3],
                        security_answers: [
                          req.body.answer1, 
                          req.body.answer2, 
                          req.body.answer3
                        ],
                        new_password_age: new Date(),
                        last_login_attempt: new Date()
                      },
                    
                      function (err, docs) {
                        if (err) {
                          logger.error("Error creating user security", { error: err });
                          console.log("Error creating new user security");
                          return;
                        }
              
                        logger.info("User security created for new customer", {
                          email: req.body.email,
                        });


                    res.redirect("/login");
                  }
                );
                    
                  }
                }
              );
            });
          }
        }
      }
    );
  } catch (error) {
    logger.error("Error during user registration", {
      error: error,
      email: req.body.email,
    });
    res
      .status(500)
      .render("error", { message: "An error occurred during registration" });
  }
});

app.get('/status', authMiddleware('customer'), function(req, res) {
  try {
    if (!req.session.pnumber) {
      logger.warn("Unauthorized access attempt to status", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.redirect("/login");
    }
    logger.info("Authorized access to status", {
      url: req.originalUrl,
      user: req.session.pnumber,
    });

    Order.find({ pnumber: req.session.pnumber }, {}, function (err, data) {
      if (err) {
        logger.error("Error retrieving orders", { error: err });
      } else {
        logger.info("Retrieved orders", { data: data });
        res.render("status", { data: data });
      }
    });
  } catch (error) {
    logger.error("Error in /status route", { error: error });
    res.status(500).render("error", { message: "An error occurred" });
  }
});

app.get('/favorites', authMiddleware('customer'), function(req, res) {
  try {
    if (!req.session.pnumber) {
      logger.warn("Unauthorized access attempt to favorites", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });
      return res.redirect("/login");
    }
    logger.info("Authorized access to favorites", {
      url: req.originalUrl,
      user: req.session.pnumber,
    });

    Favorites.find({ pnumber: req.session.pnumber }, {}, function (err, data) {
      if (err) {
        logger.error("Error retrieving favorites", { error: err });
      } else {
        logger.info("Retrieved favorites", { data: data });
        res.render("favorites", { data: data });
      }
    });
  } catch (error) {
    logger.error("Error in /favorites route", { error: error });
    res.status(500).render("error", { message: "An error occurred" });
  }
});

app.post('/addtofavorites', authMiddleware('customer'), function(req, res) {
  try {
    Favorites.findOne(
      { pnumber: req.session.pnumber, drinkname: req.body.drinkname },
      function (err, success) {
        if (err) {
          logger.error("Error finding favorite", { error: err });
          next(new Error('Internal Server Error'));
        } else if (success) {
          logger.info("Drink already in favorites");
          res.status(200).send("Drink already in favorites");
        } else {
          const faveDrink = new Favorites({
            _id: new mongoose.Types.ObjectId(),
            pnumber: req.session.pnumber,
            drinkname: req.body.drinkname,
            drinkimg: req.body.drinkimg,
          });

          faveDrink.save(function (err) {
            if (err) {
              logger.error("Error adding to favorites", { error: err });
              next(new Error('Internal Server Error'));
            } else {
              logger.info("Added to favorites", { drink: faveDrink });
              res.status(200).send("Added to favorites");
            }
          });
        }
      }
    );
  } catch (error) {
    logger.error("Error in /addtofavorites route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.post('/removefavorites', authMiddleware('customer'), function(req, res) {
  try {
    logger.info("Remove from favorites request", {
      user: req.session.pnumber,
      drinkname: req.body.drinkname,
    });
    Favorites.deleteOne(
      { pnumber: req.session.pnumber, drinkname: req.body.drinkname },
      function (err) {
        if (err) {
          logger.error("Error removing from favorites", { error: err });
          next(new Error('Internal Server Error'));
        } else {
          logger.info("Removed from favorites", {
            drinkname: req.body.drinkname,
          });
          res.status(200).send("Removed from favorites");
        }
      }
    );
  } catch (error) {
    logger.error("Error in /removefavorites route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/register", function (req, res) {
  try {
    res.render("reg");
  } catch (error) {
    logger.error("Error in /register route", { error: error });
    res.status(500).render("error", { message: "An error occurred" });
  }
});

app.get("/login", function (req, res) {
  try {
    if (req.session.pnumber) {
      res.redirect("/profile/" + req.session.pnumber);
    } else {
      res.render("login");
    }
  } catch (error) {
    logger.error("Error in /login route", { error: error });
    res.status(500).render("error", { message: "An error occurred" });
  }
});

app.get("/loginuser", function (req, res) {
  try {
    res.render("login");
  } catch (error) {
    logger.error("Error in /loginuser route", { error: error });
    res.status(500).render("error", { message: "An error occurred" });
  }
});

app.post("/upload-drinkimg", function (req, res) {
  try {
    const { drinkimg } = req.files;
    if (!drinkimg) {
      return res.status(400).send("No file uploaded");
    }

    const uploadPath = path.resolve(
      __dirname,
      "public/drink_images",
      drinkimg.name
    );
    drinkimg.mv(uploadPath, (error) => {
      if (error) {
        logger.error("Error uploading file", {
          error: error,
          filename: drinkimg.name,
        });
        return res.status(500).send("Error uploading file");
      }
      res.redirect("/milktea");
    });
  } catch (error) {
    logger.error("Error in file upload process", { error: error });
    res.status(500).send("An error occurred during file upload");
  }
});

app.get("/delete-drink", function (req, res) {
  try {
    var drinkname = req.query.drinkname;
    logger.info("/delete-drink request received: " + drinkname);
    Drink.deleteOne({ drinkname: drinkname }, function (err, docs) {
      if (err) {
        logger.error("Error deleting drink", { error: err });
      } else {
        logger.info("Drink deleted successfully");
        res.redirect('/milktea')
      }
    });
  } catch (error) {
    logger.error("Error in /delete-drink route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.post("/add-drink", function (req, res) {
  try {
    logger.info("Add drink request received", {
      drinkname: req.body.drinkname,
      category: req.body.category,
    });
    var regprice = req.body.regprice;
    var lprice = req.body.lprice;
    var drinkname = req.body.drinkname;
    var category = req.body.category;
    var drinkimg = req.body.drinkimg;
    var filename = drinkimg.replace(/C:\\fakepath\\/, "");
    Drink.create(
      {
        regprice: regprice,
        lprice: lprice,
        drinkname: drinkname,
        category: category,
        drinkimg: "/drink_images/" + filename,
      },
      (error, post) => {
        if (error) {
          logger.error("Error adding new drink", { error: error });
          res.status(500).send("Error adding drink");
        } else {
          logger.info("New drink added successfully", { drink: post });
          res.redirect("/milktea");
        }
      }
    );
  } catch (error) {
    logger.error("Error in /add-drink route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/", function (req, res) {
  res.redirect("/login");
});

app.get("/milktea", function (req, res) {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "milktea" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving milktea drinks", { error: err });
          } else {
            logger.info("Docs retrieved for milktea", { drinks: docs });
            const milktea_drinks = docs;
            res.render("menu_admin", { milktea_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /milktea route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/fruittea", function (req, res) {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "fruittea" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving fruit tea drinks", { error: err });
          } else {
            logger.info("Docs retrieved for fruit tea", { drinks: docs });
            const milktea_drinks = docs;
            res.render("menu_admin", { milktea_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /fruittea route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/coffee", function (req, res) {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "coffee" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving coffee drinks", { error: err });
          } else {
            logger.info("Docs retrieved for coffee", { drinks: docs });
            const milktea_drinks = docs;
            res.render("menu_admin", { milktea_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /coffee route", { error: error });
    next(new Error('Internal Server Error'));
  }
});
app.get("/slush", function (req, res) {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "slush" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving slush drinks", { error: err });
          } else {
            logger.info("Docs retrieved for slush", { drinks: docs });
            const slush_drinks = docs;
            res.render("menu_admin", { slush_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /slush route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/choco", function (req, res) {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "choco" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving choco drinks", { error: err });
          } else {
            logger.info("Docs retrieved for choco", { drinks: docs });
            const choco_drinks = docs;
            res.render("menu_admin", { choco_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /choco route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/freshtea", function (req, res) {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "freshtea" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving freshtea drinks", { error: err });
          } else {
            logger.info("Docs retrieved for freshtea", { drinks: docs });
            const freshtea_drinks = docs;
            res.render("menu_admin", { freshtea_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /freshtea route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/juice", function (req, res) {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "juice" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving juice drinks", { error: err });
          } else {
            logger.info("Docs retrieved for juice", { drinks: docs });
            const juice_drinks = docs;
            res.render("menu_admin", { juice_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /juice route", { error: error });
    next(new Error('Internal Server Error'));
  }
});
/*
app.get("/menu/:category", function (req, res) {
  try {
    if (!req.session.pnumber) {
      logger.warn("Unauthorized access attempt to menu category", {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        category: req.params.category,
      });
      return res.redirect("/login");
    }

    logger.info("Authorized access to menu category", {
      url: req.originalUrl,
      user: req.session.pnumber,
      category: req.params.category,
    });

    const validCategories = [
      "milktea",
      "juice",
      "freshtea",
      "fruittea",
      "coffee",
      "slush",
      "choco",
    ];
    if (!validCategories.includes(req.params.category)) {
      logger.warn("Invalid menu category accessed", {
        category: req.params.category,
        user: req.session.pnumber,
      });
      return res.status(404).send("Category not found");
    }

    Drink.find(
      { category: req.params.category },
      "drinkname drinkimg category",
      function (err, docs) {
        if (err) {
          logger.error("Error retrieving drinks for category", {
            error: err,
            category: req.params.category,
            user: req.session.pnumber,
          });
          return res.status(500).send("An error occurred");
        }

        logger.info("Drinks retrieved successfully for category", {
          category: req.params.category,
          count: docs.length,
          user: req.session.pnumber,
        });

        const drinks = docs;
        res.render("menu", { drinks });
      }
    );
  } catch (error) {
    logger.error("Error in /menu/:category route", { error: error });
    next(new Error('Internal Server Error'));
  }
});
*/
app.get("/menu/milktea", function (req, res) {
  try {
    if (req.session.pnumber) {
      Drink.find(
        { category: "milktea" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving milktea drinks", { error: err });
          } else {
            logger.info("Docs retrieved for milktea", { drinks: docs });
            const milktea_drinks = docs;
            res.render("menu", { milktea_drinks });
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    logger.error("Error in /menu/milktea route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/menu/juice", function (req, res) {
  try {
    if (req.session.pnumber) {
      Drink.find(
        { category: "juice" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving juice drinks", { error: err });
          } else {
            logger.info("Docs retrieved for juice", { drinks: docs });
            const juice_drinks = docs;
            res.render("menu", { juice_drinks });
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    logger.error("Error in /menu/juice route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/menu/freshtea", function (req, res) {
  try {
    if (req.session.pnumber) {
      Drink.find(
        { category: "freshtea" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving freshtea drinks", { error: err });
          } else {
            logger.info("Docs retrieved for freshtea", { drinks: docs });
            const freshtea_drinks = docs;
            res.render("menu", { freshtea_drinks });
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    logger.error("Error in /menu/freshtea route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/menu/fruittea", function (req, res) {
  try {
    if (req.session.pnumber) {
      Drink.find(
        { category: "fruittea" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving fruittea drinks", { error: err });
          } else {
            logger.info("Docs retrieved for fruittea", { drinks: docs });
            const fruittea_drinks = docs;
            res.render("menu", { fruittea_drinks });
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    logger.error("Error in /menu/fruittea route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/menu/coffee", function (req, res) {
  try {
    if (req.session.pnumber) {
      Drink.find(
        { category: "coffee" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving coffee drinks", { error: err });
            next(new Error('Internal Server Error'));
          } else {
            logger.info("Coffee drinks retrieved successfully", {
              drinks: docs,
            });
            const coffee_drinks = docs;
            res.render("menu", { coffee_drinks });
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    logger.error("Error in /menu/coffee route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/menu/slush", function (req, res) {
  try {
    if (req.session.pnumber) {
      Drink.find(
        { category: "slush" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving slush drinks", { error: err });
            next(new Error('Internal Server Error'));
          } else {
            logger.info("Slush drinks retrieved successfully", {
              drinks: docs,
            });
            const slush_drinks = docs;
            res.render("menu", { slush_drinks });
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    logger.error("Error in /menu/slush route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/menu/choco", function (req, res) {
  try {
    if (req.session.pnumber) {
      Drink.find(
        { category: "choco" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error("Error retrieving choco drinks", { error: err });
            next(new Error('Internal Server Error'));
          } else {
            logger.info("Choco drinks retrieved successfully", {
              drinks: docs,
            });
            const choco_drinks = docs;
            res.render("menu", { choco_drinks });
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    logger.error("Error in /menu/choco route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get("/product_manager_dashboard", (req, res) => {
  try {
    if (req.session.admin && req.session.admin.role === "product_manager") {
      Drink.find(
        { category: "milktea" },
        "drinkname drinkimg category",
        function (err, docs) {
          if (err) {
            logger.error(
              "Error retrieving milktea drinks for product manager dashboard",
              { error: err }
            );
            next(new Error('Internal Server Error'));
          } else {
            logger.info(
              "Milktea drinks retrieved successfully for product manager dashboard",
              { drinks: docs }
            );
            const milktea_drinks = docs;
            res.render("menu_admin", { milktea_drinks });
          }
        }
      );
    } else {
      res.redirect("/admin/login");
    }
  } catch (error) {
    logger.error("Error in /product_manager_dashboard route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.get('/logout_PM', authMiddleware('product_manager'), (req, res) => {
  try {
    req.session.destroy(function (err) {
      if (err) {
        logger.error("Error destroying session during logout", { error: err });
        next(new Error('Internal Server Error'));
      } else {
        res.redirect("/admin/login");
      }
    });
  } catch (error) {
    logger.error("Error in /logout_PM route", { error: error });
    next(new Error('Internal Server Error'));
  }
});

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);

    logger.error('Error occurred:', { error: err, url: req.url, method: req.method });

    res.render('error', {
        statusCode: err.status || 500,
        message: err.message || 'An unexpected error occurred'
    });
});


var server = app.listen(3000, function () {
  logger.info("Server running on port 3000");
});
