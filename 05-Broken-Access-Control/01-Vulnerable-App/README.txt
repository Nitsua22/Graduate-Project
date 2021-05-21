Broken access control
	- any website should have access control. user roles need to be implemented. then, when user roles are implemented, someone who isn't the high role should be able to break that.
		- insecure IDs  -  some form of id, key, index to reference user roles, content, functions.
			- http://localhost:3000/setup?role=admin
			- this then lets you access an admin dashboard
	- any website with a bypassable popup or some such url or content that requires confirmation, login, or anything like that, should have mechanisms in place to make sure that they're not skipped.
			- http://localhost:3000/shop/vip-area
			- vip area or something like that where you need to have an account that pays monthly for a service
			
			
			
updates for shopping app
	- update database table for users to include new thing called 'role' 
	- update database table for user-roles for each role including 'standard-customer','vip-customer','admin'
	- update html generator to include VIP items on list for vip-customers or VIP deals for vip-customer users
	
	
	