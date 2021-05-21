TODO
    - [BANK] update code to have more instances of vulnerable/!vulnerable
    - [BANK] update code on sql error to return the error to the front end (register)
    - [SHOP] update code to have more instances of vulnerable/!vulnerable


Exercises: Banking App - TitanicBank
Features:
    1. Customer registration
    2. Deposit
    3. Withdraw
    4. Transfer
    5. Open/close multiple checking/savings account

Vulnerability:
    1. Application does not clean front end data before plugging it into a query
    
Attack Objectives:
    1. Steal other account details
    2. Modify other account details
    3. Steal money (withdraw money from another account)
    4. Steal money (forced transfer from another account)

Attack Vectors:
    1. Registration
    2. Transfer

Exercises: Shopping App - TitanicStore?
Features: 
    1. Customer registration
    2. View Products
    3. Add/Remove items from cart
    4. Checkout
    
Vulnerability:
    1. Application does not clean front end data before plugging it into a query
    
Attack Objectives:
    1. Change the price of an item in the db

Attack Vector:
    1. Registration
    2. Checkout process?
	
	kernel
	32.dll+0xb50b
	kerne1
	kernel
	32.dll





Node.js
Crappy database query handling
By exploiting the SQL injection
1. Steal other people's account info/cred
2. Modify other people's accounts
3. Steal money
Force transfer of money between customer and attacker accounts
Steal particular person's account info
V1 -- 0 defenses
V2 -- some defenses -- stripping out "
Assignment ^
Tutorial video on a basic SQL injection attack
with demo and sample codes
Simple app -- simple online store
3. Demo on how to fix the store app using differences defenses -- especially prepared statements
4. Students will have to fix the banking app
	- similar to the banking app
		- reduce the price of an item using SQL injection
		
	- have a browse
	
	- have a cart
	






How to execute:

unzip the contents into a directory

install npm dependent packages using the following command:
npm install

then, install mariadb (windows? there's an extras for windows section. linux? typical installation)

then, fire up mariadb and use the commands 'source createdb.sql' and 'source populatedb.sql'

then, execute the following command to run the application
npm run server

sometimes windows can't see nodemon, so install globally.

app listens on port 3000

look in the windows details .docx for database details for mariadb/mysql




