Using Components with Known Vulnerabilities

Banking Application-

	An exercise for the banking application has not been planned yet...

Shopping Application-
	
	***Requires version of express-fileupload 1.1.8 or older***
	Uses the module express-fileupload and system created in 
	exercise 6(security misconfiguration)
		The setting for express-fileupload parseNested has been enabled
	
	With the setting enabled when a file is uploaded it is sent through the 
	function processNested in the module
	Will overide Object.prototype functions if post request is modified to send
	something with the name __proto__.exampleFunction

	A vulnerable version of the processNested function is added into the application folder
	It will need to be manually placed into the express-fileupload module library
	