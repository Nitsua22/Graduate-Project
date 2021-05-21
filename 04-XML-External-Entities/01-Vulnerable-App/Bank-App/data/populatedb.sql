USE users;

 INSERT INTO appusers (username, password, firstname, lastname, address) 
 VALUES ('mr.awesome', '$2b$10$baSgqErZ9TIpWOYfa45cYOEUU0U7SjYgQjxY0S6yCzxXm1b4Sc.3W', 'mr', 'awesome', 'password is password'); INSERT INTO accounts(amount , label, appuser_id) VALUES (10.50 ,'primary', LAST_INSERT_ID());
 
INSERT INTO appusers (username, password, firstname, lastname, address) 
VALUES ('test', '$2b$10$jLqh2LA0VF8.KGy.EOjVHew34QqjDvf.OaOjOwjFsr2gAlC6IAwEW', 'test', 'test', 'test'); INSERT INTO accounts(amount , label, appuser_id) VALUES (20.20 , 'primary',LAST_INSERT_ID());


 INSERT INTO appusers (username, password, firstname, lastname, address) 
 VALUES ('username', '$2b$10$j3WsKRy3UQwEDImdvQrpcuLInUD6EHzGIkZMcbv7HeExArWmgibAi', 'firstname', 'lastname', 'address'); INSERT INTO accounts(amount , label, appuser_id) VALUES (30.30 ,'primary', LAST_INSERT_ID());