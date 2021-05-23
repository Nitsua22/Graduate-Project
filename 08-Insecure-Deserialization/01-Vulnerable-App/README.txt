Insecure Deserialization
Banking Application-

	The session cookie has been given the value for the role_id of the current user
	The role_id is used for determining access to the config page

Shopping Application-

	The session cookie needs to be modified to allow for a user to send in a reverse
	shell attack, this currently cannot be performed because of the current cookie module


For both Applications-

	The current cookie module client-sessions requires a secret key when running
	which makes it much more difficult to decode the cookie
	The client-sessions module needs to be replaced with another cookie module that does
	not require a secret key