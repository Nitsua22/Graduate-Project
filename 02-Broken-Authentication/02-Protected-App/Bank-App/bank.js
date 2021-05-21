var sessionCache = {};

// express setup

let express = require('express');
let app = express();

// sanitizer
var expressSanitizer = require('express-sanitizer');
app.use(expressSanitizer());

// parsing request bodies setup
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));

// ejs setup
app.set('view engine', 'ejs');

const {
    v4: uuidv4
} = require('uuid');


// this forces ejs to serve the css content to teh front end
// having a public folder and contents inside of it is also required
let path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// cookie parsing setup
let cookieParser = require('cookie-parser');
app.use(cookieParser());


// functions for sessions and login
// SCP: session token with apprpriate length
var session = require('client-sessions');
app.use(session({
    cookieName: 'session',
    secret: 'aJuq39pyyyKjLJuYfDE1qsdi6',
    duration: 3 * 60 * 1000,
    /* three minutes */
    activeDuration: 1 * 60 * 10,
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

app.get('/home', requireLogin, function (req, res) {
    var accounts = [];

    var errorMessage = null;
    var accountName;
    var query;

    var query;
    query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE appusers.username=?";
    query = mysql.format(query, [req.session.username]);

    conn.query(query, (err, result) => {

        if (err) {
            throw err;
        }

        if (result[1].length > 0) {

            result[1].forEach(function (acct) {
                var account = {};
                account['accountNumber'] = acct['accountnumber'];
                account['accountAmt'] = acct['amount'];
                accounts.push(account);
            });

            req.session.accounts = accounts;

            req.session.accountName = result[1][0]['firstname'];

            res.render('home', {
                _accounts: accounts,
                _errorMessage: errorMessage,
                _accountName: req.session.accountName
            });
        } else {
            req.session.accounts = accounts;
            console.log("no accounts found!");
            res.render('home', {
                _accounts: accounts,
                _errorMessage: errorMessage,
                _accountName: req.session.username
            });
        }
    });

});

app.get("/logout", function (req, res) {
    console.log("logging out");
    req.session.reset();
    res.redirect("/");
});

app.post('/withdraw', function (req, res) {
    var amount = parseFloat(req.body.withdrawamount);
    var account = req.body.withdrawaccount;
    var errorMessage = null;
    var query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE accounts.accountnumber=" + account + " AND appusers.username='" + req.session.username + "'";


    conn.query(query, (err2, result) => {

        if (err2) {
            console.log(err2);
            throw err2;
        } else {
            console.log(result[1])
            if (result[1].length === 1) {
                var currentAmount = parseFloat(result[1][0]['amount']);
                var newAmount = currentAmount - amount;

                if (newAmount < 0) {
                    console.log("attempted to withdraw too much");
                    errorMessage = "error: not enough money to withdraw";
                    var accounts = req.session.accounts;

                    res.render('home', {
                        accounts,
                        _errorMessage: errorMessage,
                        _accountName: req.session.username
                    });
                } else {
                    var queryUpdate = "USE users; UPDATE accounts SET amount=? WHERE accountnumber=?";
                    queryUpdate = mysql.format(queryUpdate, [newAmount, account]);

                    conn.query(queryUpdate, (err3, result3) => {
                        if (err3) {
                            console.log(err3);
                            throw err3;
                        } else {
                            console.log(result3);
                            //SCP: no longer using the sessionId in the GET parameter
                            res.redirect('/home');

                        }
                    })

                }

            } else {
                console.log("no such account found");
                errorMessage = "error: no accounts found with that number";
                var accounts = req.session.accounts;

                res.render('home', {
                    _accounts: accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.username
                });
            }




        }
    });

})

app.post('/deposit', function (req, res) {
    var amount = parseFloat(req.body.depositamount);
    var account = req.body.depositaccount;
    var errorMessage = null;

    var query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE accounts.accountnumber=" + account + " AND appusers.username='" + req.session.username + "'";

    conn.query(query, (err2, result) => {

        if (err2) {
            console.log(err2);
            throw err2;
        } else {
            console.log(result[1])
            if (result[1].length === 1) {
                var currentAmount = parseFloat(result[1][0]['amount']);
                var newAmount = currentAmount + amount;
                console.log(newAmount);
                var queryUpdate = "USE users; UPDATE accounts SET amount=? WHERE accountnumber=?";
                queryUpdate = mysql.format(queryUpdate, [newAmount, account]);


                conn.query(queryUpdate, (err3, result3) => {
                    if (err3) {
                        console.log(err3);
                        throw err3;
                    } else {
                        console.log(result3);
                        //SCP: no longer using the sessionId in the GET parameter
                        res.redirect('/home');
                    }
                })


            } else {
                console.log("no such account found");
                errorMessage = "error: no accounts found with that number";
                var accounts = req.session.accounts;

                res.render('home', {
                    _accounts: accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.username
                });
            }




        }
    });

})

app.post('/transfer', function (req, res) {
    var amount = parseFloat(req.body.transferamount);
    var accountSender = req.body.transfersender;
    var accountReciever = req.body.transferreciever;

    var errorMessage = null;

    var query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE (accounts.accountnumber=" + accountSender + " OR accounts.accountnumber=" + accountReciever + ") AND appusers.username='" + req.session.username + "'";

    conn.query(query, (err, result) => {

        if (err) {
            console.log(err);
            throw err;
        } else {
            console.log(result[1])

            //if the query returned both accounts... 
            if (result[1].length === 2) {

                var sendingAccount;
                var receivingAccount;

                if (result[1][0]['accountnumber'] == accountSender) {
                    sendingAccount = result[1][0];
                    receivingAccount = result[1][1];
                } else {
                    sendingAccount = result[1][1];
                    receivingAccount = result[1][0];
                }



                var senderAccountBalance = parseFloat(sendingAccount['amount']);
                var recieverAccountBalance = parseFloat(receivingAccount['amount']);


                if (senderAccountBalance > amount) {
                    senderAccoutBalance = senderAccountBalance - amount;
                    recieverAccountBalance = recieverAccountBalance + amount;

                    queryUpdate = "USE users; UPDATE accounts SET amount=? WHERE accountnumber=?; UPDATE accounts SET amount=? WHERE accountnumber=?;";
                    queryUpdate = mysql.format(queryUpdate, [senderAccountBalance, sendingAccount['accountnumber'], recieverAccountBalance, receivingAccount['accountnumber']]);

                    conn.query(queryUpdate, (err3, result3) => {
                        if (err3) {
                            console.log(err3);
                            throw err3;
                        } else {
                            console.log(result3);
                            //SCP: no longer using the sessionId in the GET parameter
                            res.redirect('/home');

                        }
                    });

                } else {
                    //SCP: no longer using the sessionId in the GET parameter
                    res.redirect('/home');


                }

            } else {
                console.log("no such account found");
                errorMessage = "error: no accounts found with that number";
                var accounts = req.session.accounts;

                res.render('home', {
                    _accounts: accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.username
                });
            }

        }
    });

})

app.post('/createNew', function (req, res) {
    var amount = parseFloat(req.body.amount);
    var username = req.session.username;
    var query;
    var errorMessage = null;

    //    query = "USE users; INSERT INTO accounts(amount, appuser_id) VALUES(?,(select id from appusers where username=?));";
    query = "USE users; INSERT INTO accounts(amount, appuser_id) VALUES(" + amount + ",(select id from appusers where username='" + username + "'));";

    console.log(query);

    conn.query(query, (err, result) => {

        if (err) {
            throw err;
        }
        console.log(result);

        //SCP: no longer using the sessionId in the GET parameter
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
        var query = "USE users; SELECT username, password, id FROM appusers WHERE username=?";
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
                        req.session.id = uuidv4(); // -> '6c84fb90-12c4-11e1-840d-7b25c5ee775a' 

                        //                        // add session data to local cache
                        //                        sessionCache[req.session.id] = account['id'];
                        //
                        //
                        //                        res.redirect('/home?sessionId=' + req.session.id);

                        //SCP: no longer using the sessionId in the GET parameter
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
        console.log(req.body);

        var user = [];

        // escape the user submitted data
        user[0] = req.sanitize(req.body.username);
        user[1] = req.sanitize(req.body.password);
        user[2] = req.sanitize(req.body.firstname);
        user[3] = req.sanitize(req.body.lastname);
        user[4] = req.sanitize(req.body.address);


        bcrypt.hash(user[1], 10, function (err, hash) {

            if (err) {
                throw err;
            } else {
                var query = "USE users; INSERT INTO appusers (username, password, firstname, lastname, address) VALUES (?, ?, ?, ?, ?); INSERT INTO accounts(amount , appuser_id) VALUES (0.00 , LAST_INSERT_ID());";
                query = mysql.format(query, [user[0], hash, user[2], user[3], user[4]]);

                console.log(query);

                conn.query(query, (err2, result) => {

                    if (err2) {
                        console.log(err2);
                        throw err2;
                    } else {

                        console.log(result[1])

                        req.session.username = user[0];

                        //SCP: no longer using the sessionId in the GET parameter
                        res.redirect('/home');

                    }
                });
            }
        }); // bcrypt hash

    }




});

// GET '/' 
// 
// Should return route request based on session cookie
//
// req = the request
// resp = the response
app.get('/', function (req, res) {
    //SCP: no longer using the sessionId in the GET parameter
    if (req.session && req.session.username) {
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});



// middleware for login required
function requireLogin(req, res, next) {
    //SCP: remove session token from GET parameter for login 
    if (!req.user) {
        //    if (!req.query['sessionId']) {
        console.log("login required!");
        res.redirect('/login');
    } else {
        console.log("login not required!");
        next();
    }
};




// create http server
app.listen(3000);
