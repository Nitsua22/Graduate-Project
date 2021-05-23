USE shopdb;

INSERT INTO products (name,make,price,description,thumbnail)
VALUES 
    ('soap','dove',3.99,'hand soap for anyone','locationonserver'),
    ('paper towels','brawny',5.99,'strongest paper towels there are','locationonserver'),
    ('toothpaste','colgate',4.99,'new freshbreeze toothpaste','locationonserver'),
    ('cat food','cats for cats',10.99,'only the best for my bkitties','locationonserver');




 INSERT INTO appusers (username, password, firstname, lastname, address, picture) 
 VALUES ('mr.awesome', '$2b$10$baSgqErZ9TIpWOYfa45cYOEUU0U7SjYgQjxY0S6yCzxXm1b4Sc.3W', 'mr', 'awesome', 'password is password', 'profile1.jpg');  
 
  
INSERT INTO appusers (username, password, firstname, lastname, address, picture) 
VALUES ('test', '$2b$10$jLqh2LA0VF8.KGy.EOjVHew34QqjDvf.OaOjOwjFsr2gAlC6IAwEW', 'test', 'test', 'test', 'profile1.jpg');  
 
 INSERT INTO appusers (username, password, firstname, lastname, address, picture) 
 VALUES ('username', '$2b$10$j3WsKRy3UQwEDImdvQrpcuLInUD6EHzGIkZMcbv7HeExArWmgibAi', 'firstname', 'lastname', 'address', 'profile1.jpg');
 
  INSERT INTO appusers (username, password, firstname, lastname, address, picture) 
 VALUES ('admin', '$2b$10$YM1Swxc50NXVjgCU9bEpyO5MnlMB12UQmVj4lhX6n9FGrkl.tFESu', 'adminFN', 'adminLN', 'adminAddr', 'profile1.jpg'); 
 
 INSERT INTO appusers (username, password, firstname, lastname, address, picture) 
 VALUES ('root', '$2b$10$pCJo0N4CymoABiBvxy5Wre2qbEdQUT/CCtjms4/4WWbGkMIrF./Ue', 'rootFN', 'rootLN', '0', 'profile1.jpg');
  