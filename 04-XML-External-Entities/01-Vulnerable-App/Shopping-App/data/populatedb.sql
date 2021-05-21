USE shopdb;

INSERT INTO products (name,make,price,description,thumbnail)
VALUES 
    ('soap','dove',3.99,'hand soap for anyone','locationonserver'),
    ('paper towels','brawny',5.99,'strongest paper towels there are','locationonserver'),
    ('toothpaste','colgate',4.99,'new freshbreeze toothpaste','locationonserver'),
    ('cat food','cats for cats',10.99,'only the best for my bkitties','locationonserver');




 INSERT INTO appusers (username, password, firstname, lastname, address) 
 VALUES ('mr.awesome', '$2b$10$baSgqErZ9TIpWOYfa45cYOEUU0U7SjYgQjxY0S6yCzxXm1b4Sc.3W', 'mr', 'awesome', 'password is password');  
 
  
INSERT INTO appusers (username, password, firstname, lastname, address) 
VALUES ('test', '$2b$10$jLqh2LA0VF8.KGy.EOjVHew34QqjDvf.OaOjOwjFsr2gAlC6IAwEW', 'test', 'test', 'test');  
 INSERT INTO appusers (username, password, firstname, lastname, address) 
 VALUES ('username', '$2b$10$j3WsKRy3UQwEDImdvQrpcuLInUD6EHzGIkZMcbv7HeExArWmgibAi', 'firstname', 'lastname', 'address');