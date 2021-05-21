USE users;

INSERT INTO appusers (username, password, firstname, lastname, address) 
VALUES ('test', '$2b$10$jLqh2LA0VF8.KGy.EOjVHew34QqjDvf.OaOjOwjFsr2gAlC6IAwEW', 'test', 'test', 'test'); INSERT INTO accounts(amount , appuser_id) VALUES (20.20 , LAST_INSERT_ID());


 INSERT INTO appusers (username, password, firstname, lastname, address) 
 VALUES ('username', '$2b$10$j3WsKRy3UQwEDImdvQrpcuLInUD6EHzGIkZMcbv7HeExArWmgibAi', 'firstname', 'lastname', 'address'); INSERT INTO accounts(amount , appuser_id) VALUES (30.30 , LAST_INSERT_ID());