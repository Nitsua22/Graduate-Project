USE users;

INSERT INTO roles(id, name)
VALUES(0,'admin');

INSERT INTO roles(id,name)
VALUES(1,'customer');


INSERT INTO appusers (username, password, firstname, lastname, address, role_id) 
VALUES ('admin', '$2b$10$YM1Swxc50NXVjgCU9bEpyO5MnlMB12UQmVj4lhX6n9FGrkl.tFESu', 'admin', 'admin', 'admin',0); INSERT INTO accounts(amount , appuser_id) VALUES (20.20 , LAST_INSERT_ID());


 INSERT INTO appusers (username, password, firstname, lastname, address, role_id) 
 VALUES ('username', '$2b$10$j3WsKRy3UQwEDImdvQrpcuLInUD6EHzGIkZMcbv7HeExArWmgibAi', 'firstname', 'lastname', 'address',1); INSERT INTO accounts(amount , appuser_id) VALUES (30.30 , LAST_INSERT_ID());