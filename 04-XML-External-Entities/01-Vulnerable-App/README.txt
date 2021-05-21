XML External entities
	- application front/back ends communicate using xml
	- xml data is processed without checking
	- remote code is executed, or a file gets returned

- file retrieval should be the go-to
	
- by telling a back-end application that the front end needs a file from the backend, the filename could be used as an xml external entity, so it would just be trusted or sent back


 For example, suppose a shopping application checks for the stock level of a product by submitting the following XML to the server:

<?xml version="1.0" encoding="UTF-8"?>
<stockCheck><productId>381</productId></stockCheck>

The application performs no particular defenses against XXE attacks, so you can exploit the XXE vulnerability to retrieve the /etc/passwd file by submitting the following XXE payload:

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<stockCheck><productId>&xxe;</productId></stockCheck> 

then you get back the contents

OR

SSRF attack, basically force the xml parser to make an HTTP request 