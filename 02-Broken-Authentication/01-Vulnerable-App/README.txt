Changes to the baseline app:
	1. pasword hashing/salting not used
	2. sessionid handled through get request parameter
		- sessionid should determine accounts looked up
		- add uuid package and use it to generate ids
	3. session timeout now 30 minutes
	4. new accts have 'test' 'test' and 'admin' 'admin'

Broken authentication and session management
	- broken authentication could mean that the session id is returned in the http request like a GET request
	       http://example.com/sale/saleitems;jsessionid=2P0OC2JSNDLPSKHCJUN2JV?dest=Hawaii
		   this can be done in the bank app
	- passwords are not properly hashed and salted, and when those passwords are retrieved, they're exposed
			this can be done with a sql injection + something
	- application timeout not set - a public computer can be used
			this can be easily done
	- predictable login credentials for admin accounts
			this is ez
	- forgot password mechanisms that are easy to guess
	
	