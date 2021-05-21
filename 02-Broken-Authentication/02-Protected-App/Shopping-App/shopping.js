// whether this version of the app has the vulnerabilities on
let vulnerable = false

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
    duration: 3 * 60 * 1000,
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


// cart is something that should be stored during normal use, no need for db
app.get('/home', requireLogin, function (req, res) {

    var errorMessage = null;
    let products = [];
    var cart = [];

    if (req.session.cart) {
        cart = req.session.cart;
    } else {
        req.session.cart = cart;
    }

    // this gets price information from the front end and trusts it
    // don't take the price from the front end

    try {

        var query = 'USE shopdb; SELECT * FROM products';

        conn.query(query, (err, result) => {

            if (err) {
                throw err;
            }

            result[1].forEach(function (r) {
                var product = {};
                product['id'] = r['id'];
                product['name'] = r['name'];
                product['price'] = r['price'];
                product['description'] = r['description'];
                products.push(product);
            });

            res.render('home', {
                _products: products,
                _cart: cart,
                _errorMessage: errorMessage,
                _accountName: req.session.accountName
            });
        });

    } catch (err) {
        console.log(err);
        errorMessage = "error in sql";
        res.render('home', {
            _products: products,
            _cart: cart,
            _errorMessage: errorMessage,
            _accountName: req.session.accountName
        });
    }
});

app.get('/product', function (req, res) {
    // check whether this exists in the database
    var query = "USE shopdb; SELECT * FROM products WHERE name=?";

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
                    //                    res.send("found");   
                    res.send(result);

                } else {
                    res.send(result);

                }
                //                res.send(result);
            }

        });
    } else {
        res.send(req.query['name']);
    }

});


app.get('/additem', function (req, res) {
    var cart = [];

    if (req.session.cart) {
        cart = req.session.cart;
    } else {
        req.session.cart = cart;
    }

    var id = req.query['id'];
    var item = {};
    var query = "USE shopdb; SELECT * FROM products WHERE id=?";

    if (vulnerable) {
        query = query.replace("?", id);
    } else {
        query = mysql.format(query, [id]);
    }

    // get the item from the db
    conn.query(query, function (err, result) {

        var itemFromDb = {};

        if (err) {
            console.log(err);
            itemFromDb = null;
        } else {
            itemFromDb['id'] = result[1][0]['id'];
            itemFromDb['name'] = result[1][0]['name'];
            itemFromDb['price'] = result[1][0]['price'];
            itemFromDb['quantity'] = 1;
        }

        // if we found an item in the db...
        if (itemFromDb) {
            var itemInCart = false;
            // check if this cart already has the item
            for (var i = 0; i < cart.length; i++) {
                if (cart[i]['id'] == id) {
                    cart[i]['quantity'] = parseInt(cart[i]['quantity']) + 1;
                    itemInCart = true;
                }
            }

            if (!itemInCart) {
                cart.push(itemFromDb);
            }

            req.session.cart = cart;

            res.redirect('/home');
        } else {
            console.log("no such item found");

            res.redirect('/home');
        }
    });
});

app.get('/deleteitem', function (req, res) {
    var cart = [];

    if (req.session.cart) {
        cart = req.session.cart;
    } else {
        req.session.cart = cart;
    }

    var id = req.query['id'];
    var item = {};
    var query = "USE shopdb; SELECT * FROM products WHERE id=?";

    if (vulnerable) {
        query = query.replace("?", id);
    } else {
        query = mysql.format(query, [id]);
    }

    // get the item from the db
    conn.query(query, function (err, result) {

        var itemFromDb = {};

        if (err) {
            console.log(err);
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
                if (cart[i]['id'] == id) {
                    if (parseInt(cart[i]['quantity']) > 0) {
                        cart[i]['quantity'] = parseInt(cart[i]['quantity']) - 1;
                        itemIndex = i;
                    } else {
                        console.log("item in cart already at 0 quantity!");
                    }
                }
            }

            if ((itemIndex > -1) && parseInt(cart[i]['quantity']) == 0) {
                cart = cart.splice(i, 1);
            }

            req.session.cart = cart;

            res.redirect('/home');
        } else {
            console.log("no such item found");

            res.redirect('/home');
        }
    });
});



// testing functionality
app.all('/test', function (req, res) {

    var cart = [];
    var item1 = {};
    var item2 = {};

    item2['name'] = 'name';
    item1['name'] = 'name';

    cart.push(item1);
    cart.push(item2);

    res.render('test', {
        _cart: cart
    });

});


app.get('/viewcart', requireLogin, function (req, res) {
    var cart = [];
    var errorMessage = null;

    if (!req.session.cart) {
        req.session.cart = cart;
        errorMessage = "cart empty";

        res.render('viewcart', {
            _cart: cart,
            _errorMessage: errorMessage
        });
    } else {
        cart = req.session.cart;
        res.render('viewcart', {
            _cart: cart,
            _errorMessage: errorMessage
        });
    }
});


app.get('/viewprofile', requireLogin, function (req, res) {
    var errorMessage = null;

    // get receipts for this user and render the profile page with them
    var receipts = null;

    // get account details from db to render the profile page with
    var userDetails = null;

    // construct query to get acct details
    var queryAcct = "USE shopdb; SELECT * FROM appusers WHERE id=" + req.session.userId;

    // save to database
    conn.query(queryAcct, function (err, result) {
        if (err) {
            console.log(err);
            errorMessage = err;
            res.render('viewprofile', {
                _receipts: receipts,
                _userDetails: userDetails,
                _errorMessage: errorMessage
            });
        } else {
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
                    var query = "USE shopdb; SELECT * FROM receipts WHERE appuser_id=" + req.session.userId + " AND purchase_date >='2020-01-01'";

                    // save to database
                    conn.query(query, function (err1, result1) {
                        if (err1) {
                            console.log(err1);
                            errorMessage = err1;
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

app.post('/checkout', requireLogin, function (req, res) {
    var cart = [];

    if (!req.session.cart) {
        req.session.cart = cart;
        errorMessage = "cart empty";
        res.render('viewcart', {
            _cart: cart,
            _errorMessage: errorMessage
        });
    } else {
        cart = req.session.cart;

        // create receipt
        var receipt = {};
        receipt['username'] = req.session.username
        receipt['cart'] = cart;
        receipt['payment_method'] = req.body.payment_card_num + " " + req.body.payment_card_ext;
        receipt['shipping_address'] = req.body.shipping_address;
        receipt['shipping_recipient'] = req.body.shipping_recipient;

        // get list of items and quantities
        //
        //        var item_list_json = []
        //        for (var i = 0; i < cart.length; i++) {
        //            var item_json = {};
        //            item_json["name"] = cart[i]['name'];
        //            item_json["quantity"] = cart[i]['quantity'];
        //            item_list_json.push(item_json.toString());
        //        }

        //        receipt['item_list'] = item_list_json.toString();


        //        for (var i = 0; i < cart.length; i++) {
        //            var cartItem = cart[i]['name'] + " (" + cart[i]['quantity'] + ")";
        //            receipt['item_list'] += cartItem;
        //
        //            if (i < cart.length - 1) {
        //                receipt['item_list'] += ",";
        //            }
        //        }


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
        var query = " USE shopdb; INSERT INTO receipts(shipping_address,shipping_recipient,items,subtotal, grandtotal, appuser_id) VALUES('" + receipt['shipping_address'] + "','" + receipt['shipping_recipient'] + "','" + JSON.stringify(receipt['item_list']) +
            "'," + receipt['subtotal'] + "," + receipt['grandtotal'] + "," + req.session.userId + ");"

        receipt['purchase_date'] = new Date(Date.now()).formatMMDDYYYY();

        //        console.log(receipt['cart']);
        console.log(query);

        // save to database
        conn.query(query, function (err, result) {
            if (err) {
                console.log(err);
                errorMessage = err;
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


app.post('/createNew', function (req, res) {
    var amount = parseFloat(req.body.amount);
    var username = req.session.username;
    var query;
    var errorMessage = null;

    //    query = "USE shopdb; INSERT INTO accounts(amount, appuser_id) VALUES(?,(select id from appusers where username=?));";
    query = "USE shopdb; INSERT INTO accounts(amount, appuser_id) VALUES(" + amount + ",(select id from appusers where username='" + username + "'));";

    console.log(query);

    conn.query(query, (err, result) => {

        if (err) {
            throw err;
        }
        console.log(result);
        res.redirect('/home');
    });

})


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

        if (vulnerable) {
            query = query.replace("?", "'" + userName + "'");
        } else {
            query = mysql.format(query, [userName]);
        }

        console.log(query);

        conn.query(query, (err, result) => {

            // vuln
            if (err) {
                res.send(result);
            } else {
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

                    console.log(password);

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
                            req.session.accountName = userName;
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

        user[0] = req.body.username;
        user[1] = req.body.password;
        user[2] = req.body.firstname;
        user[3] = req.body.lastname;
        user[4] = req.body.address;

        // SCP: rudimentary password pattern matching
        var badPasswords = ["admin", "password", "password123", "P@ssw0rd"];

        // check password against commonly used passwords
        if (badPasswords.includes(user[1])) {
            errorMessage = "invalid password - please use an uncommon password";
            res.render('register', {
                _errorMessage: errorMessage
            });
        } else {
            bcrypt.hash(user[1], 10, function (err, hash) {

                if (err) {
                    res.send(err);
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
                            req.session.username = user[0];
                            res.redirect('/home');
                        }
                    });
                }
            }); // bcrypt hash

        }


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
