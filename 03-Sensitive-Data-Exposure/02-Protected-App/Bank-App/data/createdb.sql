
DROP DATABASE users;
CREATE DATABASE users;
USE users;
CREATE TABLE appusers 
(
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    , username VARCHAR(255) UNIQUE 
    , password VARCHAR(255)
    , firstname VARCHAR(255)
    , lastname VARCHAR(255)
    , address VARCHAR(255)
);
CREATE TABLE accounts 
(
    accountnumber SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    , amount DECIMAL(13,2)
    , appuser_id SMALLINT UNSIGNED NOT NULL
    , FOREIGN KEY fk (appuser_id) REFERENCES appusers (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);
GRANT ALL PRIVILEGES ON users.* TO 'appaccount'@'localhost' IDENTIFIED BY 'apppass';
