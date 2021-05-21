USE users;

 INSERT INTO appusers (username, password, firstname, lastname, address) 
 VALUES ('mr.awesome', '$2b$10$baSgqErZ9TIpWOYfa45cYOEUU0U7SjYgQjxY0S6yCzxXm1b4Sc.3W', 'mr', 'awesome', 'password is password'); INSERT INTO accounts(amount , appuser_id) VALUES (10.50 , LAST_INSERT_ID());

INSERT INTO appusers (username, password, firstname, lastname, address) 
VALUES ('admin', 'admin', 'admin', 'admin', 'admin'); INSERT INTO accounts(amount , appuser_id) VALUES (20.20 , LAST_INSERT_ID());


 INSERT INTO appusers (username, password, firstname, lastname, address) 
 VALUES ('username', '$2b$10$j3WsKRy3UQwEDImdvQrpcuLInUD6EHzGIkZMcbv7HeExArWmgibAi', 'firstname', 'lastname', 'address'); INSERT INTO accounts(amount , appuser_id) VALUES (30.30 , LAST_INSERT_ID());