// whether this version of the app has the vulnerabilities on
let vulnerable = true

// express setup
let express = require('express');

let app = express();

// parsing request bodies setup
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));

// ejs setup
app.set('view engine', 'ejs');

// this forces ejs to serve the css content to teh front end
// having a public folder and contents inside of it is also required
let path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// cookie parsing setup
let cookieParser = require('cookie-parser');
app.use(cookieParser());


// functions for sessions and login
var session = require('client-sessions');
app.use(session({
    cookieName: 'session',
    secret: 'aJuq39pyyyKjLJuYfDE1qsdi6',
    duration: 30 * 60 * 1000,
    /* three minutes */
    activeDuration: 10 * 60 * 10,
    httpOnly: true,
    ephemeral: true
}));



// middleware for session checking
app.use(function (req, res, next) {
    'use strict';
    if (req.session.username) {
        req.user = req.session.username
        delete req.user.password;
        req.session.username = req.user;
        res.locals.user = req.user;
        next();
    } else {
        next();
    }
});

// sql
var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "localhost",
    user: "appaccount",
    password: "apppass",
    multipleStatements: true

});

// bcrypt for hash
var bcrypt = require('bcrypt');


const expressSanitizer = require('express-sanitizer');

app.use(expressSanitizer());

// endpoint for home page
app.get('/home', requireLogin, function (req, res) {

    // instantiate error message just in case
    var errorMessage = null;

    // array of products that would go in cart
    let products = [];

    // cart of user
    var cart = [];

    // if cart exists, get it, if not, initialize it with the empty one
    if (req.session.cart) {
        cart = req.session.cart;
    } else {
        req.session.cart = cart;
    }

    try {

        // construct query to get products
        var query = 'USE shopdb; SELECT * FROM products';

        // execute query to get available products
        conn.query(query, (err, result) => {
            if (err) {
                // vulnerable
                // if any problems, send error to front end
                res.send(err);
            } else {
                // if there are returned items...
                result[1].forEach(function (r) {
                    // push the products found into an array of product dicts 
                    var product = {};
                    product['id'] = r['id'];
                    product['name'] = r['name'];
                    product['price'] = r['price'];
                    product['description'] = r['description'];
                    products.push(product);
                });

                // render the home page with the products, user's cart, and error messages if any
                res.render('home', {
                    _products: products,
                    _cart: cart,
                    _errorMessage: errorMessage,
                    _accountName: req.session.accountName
                });
            }


        });

    } catch (err) {
        // if there's a problem retrieving the products, an issue may be caught here
        console.log(err);
        // construct error message to display on front end
        errorMessage = "error in sql - check back end";

        // render home page with error message
        res.render('home', {
            _products: products,
            _cart: cart,
            _errorMessage: errorMessage,
            _accountName: req.session.accountName
        });
    }
});

// endpoint for a specific produdct
// there should also be a 'name' of a product found in the GET parameters
app.get('/product', function (req, res) {
    // check whether this exists in the database
    // construct query
    var query = "USE shopdb; SELECT * FROM products WHERE name=?";

    // execute query and return the product details
    if (vulnerable) {
        query = query.replace("?", "'" + req.query['name'] + "'");
        console.log(query);

        conn.query(query, function (err, result) {

            var itemFromDb = {};

            if (err) {
                res.send(err);
                console.log(err);
            } else {

                if (result[1].length > 0) {
                    res.send(result);

                } else {
                    res.send(result);

                }
            }

        });
    } else {
        res.send(req.query['name']);
    }

});

// endpoint to add an item to the cart
app.get('/additem', function (req, res) {
    // initialize an empty cart
    var cart = [];

    // if a cart exists within the session, put it in the initialized var
    // otherwise, initialize the session cart
    if (req.session.cart) {
        cart = req.session.cart;
    } else {
        req.session.cart = cart;
    }

    // get the ID of the item
    var id = req.query['id'];

    // construct the query to get the item information
    var query = "USE shopdb; SELECT * FROM products WHERE id=?";

    // SCP: using prepared statements to sanitize input
    query = mysql.format(query, [id]);

    // get the item from the db
    // execute the query
    conn.query(query, function (err, result) {

        // initialize an emtpy value for the item
        var itemFromDb = {};

        // check if an item exists
        if (err) {
            // if an item doesn't exist, print the error
            console.log(err);

            // todo: come back and make this insecure
            itemFromDb = null;
        } else {
            itemFromDb['id'] = result[1][0]['id'];
            itemFromDb['name'] = result[1][0]['name'];
            itemFromDb['price'] = result[1][0]['price'];
            itemFromDb['quantity'] = 1;
        }

        // if we found an item in the db...
        if (itemFromDb) {
            // initialize a value to determine whether the item exists in the cart already
            var itemInCart = false;

            // check if this cart already has the item
            for (var i = 0; i < cart.length; i++) {
                if (cart[i]['id'] == id) {
                    cart[i]['quantity'] = parseInt(cart[i]['quantity']) + 1;
                    itemInCart = true;
                }
            }

            // if the item isn't in the cart, put it in there
            if (itemInCart == false) {
                cart.push(itemFromDb);
            }

            // update the cart in the session
            req.session.cart = cart;

            // send the user to the home page with the cart updated
            res.redirect('/home');
        } else {
            // if the item wasn't found, print an error message and return the user to the home page 
            console.log("no such item found");

            res.redirect('/home');
        }
    });
});

// endpoint to delete an item from the cart
app.get('/deleteitem', function (req, res) {

    // initialize an empty cart
    var cart = [];

    // if a cart exists within the session, put it in the initialized var
    // otherwise, initialize the session cart
    if (req.session.cart) {
        cart = req.session.cart;
    } else {
        req.session.cart = cart;
    }

    // get the ID of the item
    var id = req.query['id'];

    // construct the query to get the item information
    var query = "USE shopdb; SELECT * FROM products WHERE id=?";

    // SCP: using prepared statements to sanitize input
    query = mysql.format(query, [id]);

    // get the item from the db
    conn.query(query, function (err, result) {

        // initialize an emtpy value for the item
        var itemFromDb = {};

        // check if an item exists
        if (err) {
            // if an item doesn't exist, print the error
            console.log(err);

            // todo: come back and make this insecure
            itemFromDb = null;
        } else {
            itemFromDb['id'] = result[1][0]['id'];
            itemFromDb['name'] = result[1][0]['name'];
            itemFromDb['price'] = result[1][0]['price'];
            itemFromDb['quantity'] = 1;
        }


        // if we found an item in the db...
        if (itemFromDb) {
            var itemIndex = -1;
            // check if this cart already has the item
            for (var i = 0; i < cart.length; i++) {
                // if the item is found
                if (cart[i]['id'] == id) {
                    // check to make sure that there is enough of the item in the cart to be removed
                    if (parseInt(cart[i]['quantity']) > 0) {
                        // subtract the quantity to be removed by 1
                        cart[i]['quantity'] = parseInt(cart[i]['quantity']) - 1;
                        itemIndex = i;
                    } else {
                        console.log("item in cart already at 0 quantity!");
                    }
                }
            }

            // gets rid of the item in the cart if the item exists in the cart but has a quantity of 0
            if ((itemIndex > -1) && parseInt(cart[i]['quantity']) == 0) {
                cart = cart.splice(i, 1);
            }

            // update the session's cart
            req.session.cart = cart;

            // redirect the user to the home page
            res.redirect('/home');
        } else {
            console.log("no such item found");

            res.redirect('/home');
        }
    });
});

// view the items in the cart
app.get('/viewcart', requireLogin, function (req, res) {
    var cart = [];
    // initialize error message just in case
    var errorMessage = null;

    // check whether cart exists    
    if (!req.session.cart) {
        // if there is no cart..
        req.session.cart = cart;

        // construct error message
        errorMessage = "cart empty";

        // render page with no cart
        res.render('viewcart', {
            _cart: cart,
            _errorMessage: errorMessage
        });
    } else {
        // if there is a cart
        cart = req.session.cart;
        // render the page with no error message
        res.render('viewcart', {
            _cart: cart,
            _errorMessage: errorMessage
        });
    }
});

// endpoint to view the profile of the logged in user
app.get('/viewprofile', requireLogin, function (req, res) {
    var errorMessage = null;

    // get receipts for this user and render the profile page with them
    var receipts = null;

    // get account details from db to render the profile page with
    var userDetails = null;

    // construct query to get acct details
    var queryAcct = "USE shopdb; SELECT * FROM appusers WHERE id=?";

    // SCP: using prepared statements to sanitize input
    queryAcct = mysql.format(queryAcct, [req.session.userId]);

    // execute query
    conn.query(queryAcct, function (err, result) {
        if (err) {
            // if there is an error, log it
            console.log(err);

            errorMessage = "no such profile exists - contact system administrator";

            // render the profile page
            res.render('viewprofile', {
                _receipts: receipts,
                _userDetails: userDetails,
                _errorMessage: errorMessage
            });
        } else {
            // if there was a query result
            if (result[1].length > 0) {
                // initialize detials
                userDetails = {};

                // fill with values returned from query
                userDetails['firstname'] = result[1][0]['firstname'];
                userDetails['lastname'] = result[1][0]['lastname'];
                userDetails['address'] = result[1][0]['address'];
                userDetails['username'] = result[1][0]['username'];

                // check whether the client requested receipts
                if (!req.query['date_from']) {
                    // render the page if there was no query
                    res.render('viewprofile', {
                        _receipts: receipts,
                        _userDetails: userDetails,
                        _errorMessage: errorMessage
                    });
                } else {

                    // get the dates from the front end
                    var dateFrom = req.query['date_from'];
                    var dateTo = req.query['date_to'];

                    // query to get receipts
                    var query = "USE shopdb; SELECT * FROM receipts WHERE appuser_id= ? AND purchase_date >='2020-01-01'";

                    // SCP: using prepared statements to sanitize input
                    query = mysql.format(query, [req.session.userId]);

                    // save to database
                    conn.query(query, function (err1, result1) {
                        if (err1) {
                            console.log(err1);
                            errorMessage = "unable to find receipts";
                            res.render('viewprofile', {
                                _receipts: receipts,
                                _userDetails: userDetails,
                                _errorMessage: errorMessage
                            });
                        } else {
                            if (result1[1].length > 0) {
                                receipts = [];

                                result1[1].forEach(function (r) {
                                    var receipt = {};
                                    receipt['shipping_address'] = r['shipping_address'];
                                    receipt['shipping_recipient'] = r['shipping_recipient'];

                                    receipt['item_list'] = JSON.parse(r['items'])['items'];
                                    receipt['subtotal'] = r['subtotal'];
                                    receipt['grandtotal'] = r['grandtotal'];
                                    receipt['purchase_date'] = new Date(r['purchase_date']).formatMMDDYYYY();
                                    receipts.push(receipt);
                                });
                            }

                            res.render('viewprofile', {
                                _receipts: receipts,
                                _userDetails: userDetails,
                                _errorMessage: errorMessage
                            });
                        }

                    });

                }
            }
        }

    });



});

// POST only
// endpoint to checkout and capture 'payment' information
app.post('/checkout', requireLogin, function (req, res) {
    var cart = [];

    // if there is no cart, send the user away from the checkout page
    if (!req.session.cart) {
        // initialize the session cart
        req.session.cart = cart;

        // send them to the viewcart page with an error message
        errorMessage = "cart empty";
        res.render('viewcart', {
            _cart: cart,
            _errorMessage: errorMessage
        });
    } else {
        // get the cart from the session
        cart = req.session.cart;

        // create receipt
        var receipt = {};

        // get information from the request body
        receipt['username'] = req.session.username
        receipt['cart'] = cart;
        receipt['payment_method'] = req.body.payment_card_num + " " + req.body.payment_card_ext;
        receipt['shipping_address'] = req.body.shipping_address;
        receipt['shipping_recipient'] = req.body.shipping_recipient;


        // get subtotal
        // vulnerable does not check for price validity
        receipt['subtotal'] = 0.00;
        receipt['grandtotal'] = 0.00;
        for (var i = 0; i < cart.length; i++) {
            receipt['subtotal'] = parseFloat(receipt['subtotal']) + parseFloat(cart[i]['price']);
        }

        // get grandtotal
        receipt['grandtotal'] = (parseFloat(receipt['subtotal']) * 1.075).toFixed(2);

        receipt['item_list'] = {};
        receipt['item_list']['items'] = cart


        // save receipt
        receipt['purchase_date'] = new Date(Date.now()).formatMMDDYYYY();

        var query = " USE shopdb; INSERT INTO receipts(shipping_address,shipping_recipient,items,subtotal, grandtotal, appuser_id) VALUES(?,?,?,?,?,?);"
        // SCP: using prepared statements to sanitize input
        query = mysql.format(query, [receipt['shipping_address'], receipt['shipping_recipient'], JSON.stringify(receipt['item_list']), receipt['subtotal'], receipt['grandtotal'], req.session.userId]);

        // save to database
        conn.query(query, function (err, result) {
            if (err) {
                console.log(err);

                errorMessage = "cannot create receipt";

                res.render('viewcart', {
                    _cart: cart,
                    _errorMessage: errorMessage
                });
            } else {
                cart = [];
                req.session.cart = cart;
                res.render('thankyoupurchase', {
                    _receipt: receipt
                });
            }

        });

    }
});



// The handler for the request of the login page
// @param req - the request
// @param res - the response 
app.all("/login", function (req, res) {

    // error message if any
    var errorMessage = null;

    // if this is the first time the page was visited....
    if (Object.keys(req.body).length === 0) {
        res.render('login', {
            _errorMessage: errorMessage
        });

        // if this is not the first time the page was visited...
    } else {
        // Get the username and password data from the form
        var userName = req.body.username;
        var password = req.body.password;
        var match;
        var query = "USE shopdb; SELECT username, password, id FROM appusers WHERE username=?";

        // SCP: using prepared statements to utilize input sanitization 
        query = mysql.format(query, [userName]);

        console.log(query);

        conn.query(query, (err, result) => {

            if (err) throw err;

            console.log(result[1].length);

            var hash;

            // if there were any accounts associated...
            if (result[1].length > 0) {

                var account = result[1][0];

                console.log(account);

                // check password
                console.log("matched username...");

                // store the hashed password from the db
                hash = account['password'];

                var userId = account['id'];


                // compare stored hash with plaintext password using bcrypt	
                bcrypt.compare(password, hash, (err2, isMatch) => {
                    // error with compare
                    if (err2) {
                        throw err2;
                    }

                    // if username/password match
                    if (isMatch) {
                        console.log("plaintext match: " + isMatch);
                        match = isMatch;
                        req.session.username = userName;

                        req.session.userId = userId;

                        res.redirect('/home');

                        // if username/password don't match
                    } else {
                        console.log("couldn't find match");

                        errorMessage = "Login attempt failed. Username/password combination not found.";

                        res.render('login', {
                            _errorMessage: errorMessage
                        });

                    }
                });

            } else {
                console.log("couldn't find match");

                errorMessage = "Login attempt failed. Username/password combination not found.";

                res.render('login', {
                    _errorMessage: errorMessage
                });
            }
        });
    }
});

// The end-point for creating an account
app.all("/register", function (req, res) {

    var errorMessage = null;

    // if this is the first time the page was visited....
    if (Object.keys(req.body).length === 0) {
        res.render('register', {
            _errorMessage: errorMessage
        });

        // if this is not the first time the page was visited...
    } else {

        var user = [];


        //SCP: sanitizing user input from form fields using express-sanitizer
        user[0] = req.sanitize(req.body.username);
        user[1] = req.sanitize(req.body.password);
        user[2] = req.sanitize(req.body.firstname);
        user[3] = req.sanitize(req.body.lastname);
        user[4] = req.sanitize(req.body.address);

        bcrypt.hash(user[1], 10, function (err, hash) {

            if (err) {
                throw err;
            } else {
                var query = "USE shopdb; INSERT INTO appusers (username, password, firstname, lastname, address) VALUES (?, ?, ?, ?, ?)";

                if (vulnerable) {
                    query = query.replace("?, ?, ?, ?, ?", "'" + user[0] + "', '" + hash + "', '" + user[2] + "', '" + user[3] + "', '" + user[4] + "'");
                } else {
                    query = mysql.format(query, [user[0], hash, user[2], user[3], user[4]]);
                }

                conn.query(query, (err2, result) => {

                    if (err2) {
                        if (vulnerable) {
                            res.send(err2);
                        } else {
                            console.log(err2);
                            throw err2;
                        }
                    } else {
                        // save the newly inserted user's ID into the session (so the profile page doesn't bug out)
                        req.session.userId = result[1]['insertId'];
                        req.session.username = user[0];
                        res.redirect('/home');
                    }
                });
            }
        }); // bcrypt hash

    }

});

// the end-point for logging out
app.get("/logout", function (req, res) {
    req.session.reset();
    res.redirect("/");
});


// GET '/' 
// 
// Should return route request based on session cookie
//
// req = the request
// resp = the response
app.get('/', function (req, res) {
    if (req.session && req.session.username) {
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});



// middleware for login required
function requireLogin(req, res, next) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
};


Date.prototype.formatMMDDYYYY = function () {
    return (this.getMonth() + 1) +
        "/" + this.getDate() +
        "/" + this.getFullYear();
}

// create http server
app.listen(3000);
