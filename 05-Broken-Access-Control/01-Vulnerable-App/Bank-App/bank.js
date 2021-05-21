/*
   
    3.3.5	Broken Access Control
    
    3.3.5.1	Bank App
        The bank application will be modified in the following ways to expose the vulnerability:
        1.	User accounts shall now include a ‘user_role’ attribute
        2.	A new feature shall be added to allow a user to navigate to a page called ‘appconfig’ that includes application configuration and other administrative information
        a.	When a user navigates to this page from the home page via a button, the back-end shall check the user’s role to determine if the user’s role has access to the page
        i.	If the account does not have access, the button shall redirect the user to the home page
        ii.	If the account does have access, the button shall redirect the user to the ‘appdetails’ page
        b.	The application shall not check the account accessibility if the page is navigated to through the URL

*/


// SCP = secure coding practice

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

const expressSanitizer = require('express-sanitizer');
app.use(expressSanitizer());

// endpoint for home page
app.get('/home', requireLogin, function (req, res) {
    //app.get('/home', function (req, res) {
    // array to hold accounts of the logged in user
    var accounts = [];
    // if any errors occur, the message will need to be saved and sent back
    var errorMessage = null;
    // name of each account
    var accountName;

    //  query to get accounts of logged in user
    var query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE appusers.username=?";

    // SCP: using prepared statements to construct queries which provides input sanitization
    query = mysql.format(query, [req.session.username]);

    conn.query(query, (err, result) => {

        // SCP: do not show the complete error message to the front end
        if (err) {
            // save the empty array into the session
            req.session.accounts = accounts;

            // log that no accounts were found
            console.log("no accounts found!");

            // update the error message to be displayed on the home page
            // SCP: minimize error details displayed to user
            errorMessage = "no accounts found!";

            // render the home page with the error message 
            res.render('home', {
                _accounts: accounts,
                _errorMessage: errorMessage,
                _accountName: req.session.username
            });
        } else {
            // if the query returned any results...
            if (result[1].length > 0) {

                // save the results into the accounts array
                result[1].forEach(function (acct) {
                    var account = {};
                    account['accountNumber'] = acct['accountnumber'];
                    account['accountAmt'] = acct['amount'];
                    accounts.push(account);
                });

                // update the session to include the updated accounts array
                req.session.accounts = accounts;

                // save the name of the user to display on the home page
                req.session.accountName = result[1][0]['firstname'];

                // render the home page with the accounts, error message, and name
                res.render('home', {
                    _accounts: accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.accountName
                });
            } else {
                // save the empty array into the session
                req.session.accounts = accounts;

                // log that no accounts were found
                console.log("no accounts found!");

                // update the error message to be displayed on the home page
                errorMessage = "no accounts found!";

                // render the home page with the error message 
                res.render('home', {
                    _accounts: accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.username
                });
            }
        }


    });

});

// endpoint to log out of the system
app.get("/logout", function (req, res) {
    // log the event
    console.log("logging out");

    // reset the session
    req.session.reset();

    // redirect the user to the login page
    res.redirect("/");
});

// endpoint to 'withdraw' money from the account
app.post('/withdraw', requireLogin, function (req, res) {

    // variable to save the amount
    var amount = parseFloat(req.body.withdrawamount);

    // save which account to withdraw money from
    var account = req.body.withdrawaccount;

    // initialize an error message variable just in case
    var errorMessage = null;

    // get the accounts list from the session
    var accounts = req.session.accounts;

    // get the account get the account to be withdrawn
    var query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE accounts.accountnumber = ? AND appusers.username = ?";

    // SCP: using prepared statements to construct queries which provides input sanitization
    query = mysql.format(query, [account, req.session.username]);

    // execute the query
    conn.query(query, (err2, result) => {

        // if there was an error in the original query to find the account, log it. 
        if (err2) {
            console.log("no such account found");
            console.log(err2);
            // construct error message
            // SCP: minimize error details displayed to user
            errorMessage = "error: no accounts found with that number";

            // update accounts from session
            var accounts = req.session.accounts;

            // render home page with error message
            res.render('home', {
                _accounts: accounts,
                _errorMessage: errorMessage,
                _accountName: req.session.username
            });
        } else {

            // if an account was found
            if (result[1].length === 1) {

                try {
                    // update the account based on the amount
                    var queryUpdate;

                    // get the balance of the account
                    var currentAmount = parseFloat(result[1][0]['amount']);

                    // calculate the new amount
                    var newAmount = currentAmount - amount;

                    // SCP: check whether the account balance allows a withdrawl before attempting
                    if (newAmount < 0) {

                        console.log("attempted to withdraw too much");

                        // log error message
                        errorMessage = "error: not enough money to withdraw";

                        res.render('home', {
                            _accounts: accounts,
                            _errorMessage: errorMessage,
                            _accountName: req.session.username
                        });
                    } else {
                        // construct query to update account amount
                        queryUpdate = "USE users; UPDATE accounts SET amount=? WHERE accountnumber=?";
                        // SCP: using prepared statements to construct queries which provides input sanitization
                        queryUpdate = mysql.format(queryUpdate, [newAmount, account]);

                        // execute update
                        conn.query(queryUpdate, (err3, result3) => {
                            if (err3) {
                                // log error message
                                console.log(err3);

                                // SCP: construct error message without stack trace for home page
                                errorMessage = "error: could not process withdrawl";

                                // render home page with error messge
                                res.render('home', {
                                    _accounts: accounts,
                                    _errorMessage: errorMessage,
                                    _accountName: req.session.username
                                });
                            } else {
                                // render home page wth updated accounts
                                res.redirect('/home');
                            }
                        })


                    }
                } catch (e) {
                    console.log(e);
                    res.send(e);
                }


            } else {
                console.log("no such account found");
                // construct error message
                errorMessage = "error: no accounts found with that number";

                // update accounts from session
                var accounts = req.session.accounts;

                // render home page with error message
                res.render('home', {
                    _accounts: accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.username
                });
            }




        }
    });

})

// endpoint for deposit feature
app.post('/deposit', requireLogin, function (req, res) {
    // get the amount to be deposited from the form
    var amount = parseFloat(req.body.depositamount);

    // get the account number from the form
    var account = req.body.depositaccount;

    // initialize an error message in case one is needed
    var errorMessage = null;

    // construct query to update account TODO: change query
    var query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE accounts.accountnumber= ? AND appusers.username= ?";

    // SCP: using prepared statements to construct queries which provides input sanitization
    query = mysql.format(query, [account, req.session.username]);

    // execute query to update account with more money
    conn.query(query, (err2, result) => {

        // if an error was created, log/send it
        if (err2) {
            // log result
            console.log("no account found for account number: " + account);

            console.log(err2);

            // construct error message
            // SCP: minimize error details displayed to user
            errorMessage = "unable to process deposit";

            // render home page with error message
            res.render('home', {
                _accounts: req.session.accounts,
                _errorMessage: errorMessage,
                _accountName: req.session.username
            });
        } else {
            // if the query returned a result
            if (result[1].length === 1) {
                // get the current balance of the account
                var currentAmount = parseFloat(result[1][0]['amount']);

                // calculate the new balance
                var newAmount = currentAmount + amount;

                // construct query to update account balance
                var queryUpdate = "USE users; UPDATE accounts SET amount=? WHERE accountnumber=?";

                // SCP: using prepared statements to construct queries which provides input sanitization
                queryUpdate = mysql.format(queryUpdate, [newAmount, account]);

                // execute query
                conn.query(queryUpdate, (err3, result3) => {
                    // send/log error if one is thrown
                    if (err3) {
                        // log result
                        console.log(err3);

                        // construct error message
                        // SCP: minimize error details displayed to user
                        errorMessage = "error: unable to process transaction";

                        // render home page with error message
                        res.render('home', {
                            _accounts: req.session.accounts,
                            _errorMessage: errorMessage,
                            _accountName: req.session.username
                        });
                        // if no error was thrown, redirect
                    } else {
                        // log transaction
                        console.log("updated balance for account: " + account + " new balance: " + newAmount);

                        // send user back to home page to view results
                        res.redirect('/home');
                    }
                })

                // if the query found no results...
            } else {
                // log result
                console.log("no account found for account number: " + account);

                // construct error message
                errorMessage = "error: no accounts found with number " + account;

                // render home page with error message
                res.render('home', {
                    _accounts: req.session.accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.username
                });
            }

        }
    });

})

// endpoint for transfer feature
app.post('/transfer', requireLogin, function (req, res) {
    // get amount to transfer from the form
    var amount = parseFloat(req.body.transferamount);

    // get the sending account from the form
    var accountSender = req.body.transfersender;

    // get the receiving account from the form
    var accountReciever = req.body.transferreciever;

    // initialize an error message just in case
    var errorMessage = null;

    // construct the query to be used TODO: vuln
    var query = "USE users; SELECT * FROM accounts LEFT JOIN appusers ON accounts.appuser_id=appusers.id WHERE (accounts.accountnumber= ? OR accounts.accountnumber= ? ) AND appusers.username= ?";

    // SCP: using prepared statements to construct queries which provides input sanitization
    query = mysql.format(query, [accountSender, accountReciever, req.session.username])

    // execute the query
    conn.query(query, (err, result) => {

        // send/log the error if there was one
        if (err) {
            console.log(err);
            // construct error message
            errorMessage = "unable to perform transfer";

            // redirect user to home page with error message
            res.render('home', {
                _accounts: req.session.accounts,
                _errorMessage: errorMessage,
                _accountName: req.session.username
            });
            // if the query was successful..
        } else {

            // and if the query returned both accounts... 
            if (result[1].length === 2) {

                // initialize a variable to save the account numbers
                var sendingAccount;

                // initialize a variable to save the account numbers
                var receivingAccount;

                // ensure that the sender and receiver are correctly saved
                if (result[1][0]['accountnumber'] == accountSender) {
                    sendingAccount = result[1][0];
                    receivingAccount = result[1][1];
                } else {
                    sendingAccount = result[1][1];
                    receivingAccount = result[1][0];
                }

                // get the current balance of the sending account
                var senderAccountBalance = parseFloat(sendingAccount['amount']);

                // get the current balance of the receiving account
                var recieverAccountBalance = parseFloat(receivingAccount['amount']);

                // make sure that the sender's account balance will not be negative after the transfer 
                if (senderAccountBalance >= amount) {
                    // calculate the new balance of the accounts
                    senderAccoutBalance = senderAccountBalance - amount;

                    // calculate the new balance of the accounts
                    recieverAccountBalance = recieverAccountBalance + amount;

                    // construct the query to perform the update
                    queryUpdate = "USE users; UPDATE accounts SET amount=? WHERE accountnumber=?; UPDATE accounts SET amount=? WHERE accountnumber=?;";

                    // SCP: using prepared statements to construct queries which provides input sanitization
                    queryUpdate = mysql.format(queryUpdate, [senderAccountBalance, sendingAccount['accountnumber'], recieverAccountBalance, receivingAccount['accountnumber']]);

                    // execute the query to update the account balances
                    conn.query(queryUpdate, (err3, result3) => {
                        // if an error occurred, log/send the error
                        if (err3) {
                            console.log(err3);

                            // construct error message
                            // SCP: minimize error details displayed to user
                            errorMessage = "unable to perform transfer";

                            // redirect user to home page with error message
                            res.render('home', {
                                _accounts: req.session.accounts,
                                _errorMessage: errorMessage,
                                _accountName: req.session.username
                            });
                        } else {
                            // log update
                            console.log("accounts updated with new balances! sender: " + senderAccountBalance + " receiver: " + recieverAccountBalance);

                            // redirect user to home to view the results
                            res.redirect('/home');
                        }
                    });
                    // if the transfer could not be processed, then return that error message
                } else {
                    // insufficient funds
                    console.log("Unable to process transfer, insufficient funds!");

                    // construct error message
                    // SCP: minimize error details displayed to user
                    errorMessage = "unable to perform transfer: sending account insufficient funds";

                    // redirect user to home page with error message
                    res.render('home', {
                        _accounts: req.session.accounts,
                        _errorMessage: errorMessage,
                        _accountName: req.session.username
                    });
                }

            } else {
                // if the accounts sent from the home page were not found
                console.log("no such account found");

                // construct error message
                errorMessage = "error: no accounts found with that number";
                var accounts = req.session.accounts;

                // redirect user to home page with error message
                res.render('home', {
                    _accounts: accounts,
                    _errorMessage: errorMessage,
                    _accountName: req.session.username
                });
            }

        }
    });

})

// endpoint to create a new account
app.post('/createNew', function (req, res) {
    // get starting balance from form
    var amount = parseFloat(req.body.amount);

    // get user details
    var username = req.session.username;

    // initialize error message just in case
    var errorMessage = null;

    // construct query to create new account
    var query;
    //    query = "USE users; INSERT INTO accounts(amount, appuser_id) VALUES(?,(select id from appusers where username=?));";
    query = "USE users; INSERT INTO accounts(amount, appuser_id) VALUES(?,(select id from appusers where username=?));";

    query = mysql.format(query, [amount, username]);

    console.log(query);

    conn.query(query, (err, result) => {
        // send/log error if there was an error
        if (err) {
            console.log(err);

            // construct error message
            // SCP: minimize error details displayed to user
            errorMessage = "unable to perform account creation";

            // redirect user to home page with error message
            res.render('home', {
                _accounts: req.session.accounts,
                _errorMessage: errorMessage,
                _accountName: req.session.username
            });
        } else {
            // log the newly created account
            console.log("new account added with balance " + amount);

            // send the user back to the home page to view account
            res.redirect('/home');

        }
    });

})


// The handler for the request of the login page
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

        var query = "USE users; SELECT username, password, id FROM appusers WHERE username=?";

        // construct sql statement
        // SCP: using prepared statements to construct queries which provides input sanitization
        query = mysql.format(query, [userName]);

        console.log(query);

        conn.query(query, (err, result) => {

            if (err) {
                errorMessage = "Login attempt failed. Username/password combination not found.";

                res.render('login', {
                    _errorMessage: errorMessage
                });
            } else {
                var hash;

                if (result[1].length === 1) {

                    var account = result[1][0];

                    // check password
                    console.log("matched username...");

                    // store the hashed password from the db
                    hash = account['password'];

                    // compare stored hash with plaintext password using bcrypt	

                    bcrypt.compare(password, hash, (err2, isMatch) => {
                        // error with compare
                        if (err2) {
                            console.log(err2);

                            errorMessage = "Login attempt failed";

                            res.render('login', {
                                _errorMessage: errorMessage
                            });
                        }

                        // if username/password match
                        if (isMatch) {
                            match = isMatch;

                            req.session.username = userName;

                            res.redirect('/home');
                            // if username/password don't match
                        } else {
                            console.log("couldn't find match with encrypted password");

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
        console.log(req.body);

        var user = [];

        // SCP: input sanitization using express sanitizer
        user[0] = req.sanitize(req.body.username);
        user[1] = req.sanitize(req.body.password);
        user[2] = req.sanitize(req.body.firstname);
        user[3] = req.sanitize(req.body.lastname);
        user[4] = req.sanitize(req.body.address);

        // perform hashing on user password
        bcrypt.hash(user[1], 10, function (err, hash) {

            if (err) {
                console.log(err);
                errorMessage = "Registration attempt failed";

                res.render('login', {
                    _errorMessage: errorMessage
                });
            } else {
                // construct query to register account
                var query = "USE users; INSERT INTO appusers (username, password, firstname, lastname, address, role_id) VALUES (?, ?, ?, ?, ?, 1); INSERT INTO accounts(amount , appuser_id) VALUES (0.00 , LAST_INSERT_ID());";

                // SCP: using prepared statements to construct queries which provides input sanitization
                query = mysql.format(query, [user[0], hash, user[2], user[3], user[4]]);

                conn.query(query, (err2, result) => {

                    if (err2) {
                        console.log(err2);
                        errorMessage = "Registration attempt failed";

                        res.render('login', {
                            _errorMessage: errorMessage
                        });
                    } else {
                        console.log("registration complete!");

                        req.session.username = user[0];

                        res.redirect('/home');

                    }
                });
            }
        }); // bcrypt hash
    }
});

// returns route based on user session
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
        console.log("login required!");
        res.redirect('/login');
    } else {
        console.log("login not required!");
        next();
    }
};



//The handler for the request of the appconfig page
// it should use a function to determine user role
app.get('/appconfig', requireLogin, function (req, res) {

    if (req.query['accountAccess'] === '0') {
        res.render("appconfig");

    } else {
        res.render('home', {
            _accounts: req.session.accounts,
            _errorMessage: "you do not have privileges for that page",
            _accountName: req.session.username
        });

    }

});





// create http server
app.listen(3000);
