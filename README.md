# Graduate-Project

Installation Instructions: 
navigate to the folder of the application you would like to start. Example:
  cd \Web-Security-Project-Root\01-Injection\01-Vulnerable-App\Bank-App

then, install the dependencies with the following command:

npm install

then, follow the instructions in the db_setup_instructions folder, depending on your environment. This will entail installing mariadb and starting the service

then, create the database using the commands outlined in the instructions document "source data\createdb.sql" then "source data\populatedb.sql"

then, start up the server

npm start
