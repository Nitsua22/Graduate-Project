Security Misconfiguration
Bank App - 
	Default admin account enabled without changing the password
	Possible to login and get to config page
	Password changing added but does not confirm the current password before changing.
	It is possible to change the password of a different account than the current one signed.

Shopping App - 
	Implement a method to upload files intended for changing a profile picture using 
	express-fileupload
	
	User can upload files that are not images, will not display any image if done
	
	When establishing file upload destination, it is set up to allow for a directory list view 		with the ability to move backwards to the rest of the source code.