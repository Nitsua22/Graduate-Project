USE shopdb;

INSERT INTO products (name,make,price,description,thumbnail)
VALUES 
    ('soap','dove',3.99,'hand soap for anyone','locationonserver'),
    ('paper towels','brawny',5.99,'strongest paper towels there are','locationonserver'),
    ('toothpaste','colgate',4.99,'new freshbreeze toothpaste','locationonserver'),
    ('cat food','cats for cats',10.99,'only the best for my bkitties','locationonserver');




 INSERT INTO appusers (username, password) 
 VALUES ('mr.awesome', '$2b$10$baSgqErZ9TIpWOYfa45cYOEUU0U7SjYgQjxY0S6yCzxXm1b4Sc.3W');
 INSERT INTO appusers_personal (firstname, lastname, address, appuser_id) VALUES
 ( 'mr', 'awesome', 'password is password',  LAST_INSERT_ID());  
 
  
INSERT INTO appusers (username, password)
VALUES ('test', '$2b$10$jLqh2LA0VF8.KGy.EOjVHew34QqjDvf.OaOjOwjFsr2gAlC6IAwEW')
 INSERT INTO appusers_personal (firstname, lastname, address, appuser_id) VALUES
( 'test', 'test', 'test',  LAST_INSERT_ID());  
 
 INSERT INTO appusers (username, password)
 VALUES ('username', '$2b$10$j3WsKRy3UQwEDImdvQrpcuLInUD6EHzGIkZMcbv7HeExArWmgibAi')
  INSERT INTO appusers_personal (firstname, lastname, address, appuser_id) VALUES
 ( 'firstname', 'lastname', 'address', LAST_INSERT_ID());