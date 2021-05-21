
DROP DATABASE shopdb;
CREATE DATABASE shopdb;
USE shopdb;
/*
SCP: creating a personal table separate from the highly targeted appusers table to mitigate data loss in the event of a leak
*/
CREATE TABLE appusers 
(
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    , username VARCHAR(255) UNIQUE 
    , password VARCHAR(255)
    
);

CREATE TABLE appusers_personal 
(
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    , firstname VARCHAR(255)
    , lastname VARCHAR(255)
    , address VARCHAR(255)
    , appuser_id SMALLINT UNSIGNED NOT NULL
    , FOREIGN KEY fk (appuser_id) REFERENCES appusers (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
);

CREATE TABLE products
(
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    , name VARCHAR(255) NOT NULL
    , make VARCHAR(255)
    , price DECIMAL(11,2) UNSIGNED NOT NULL
    , description VARCHAR(510)
    , thumbnail VARCHAR(255) # location on disk
);

CREATE TABLE receipts
(
    id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
    , shipping_address VARCHAR(255)
    , shipping_recipient VARCHAR(255)
    , items VARCHAR(1024) NOT NULL
    , subtotal DECIMAL(20,2) UNSIGNED NOT NULL
    , grandtotal DECIMAL(20,2) UNSIGNED NOT NULL
    , appuser_id SMALLINT UNSIGNED NOT NULL
    , purchase_date TIMESTAMP /* this should automatically use the current date */
    , FOREIGN KEY fk (appuser_id) REFERENCES appusers (id)
);

GRANT ALL PRIVILEGES ON shopdb.* TO 'appaccount'@'localhost' IDENTIFIED BY 'apppass';
