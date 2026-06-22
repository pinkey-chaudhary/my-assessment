 # MY ASSESSMENT
 This is user authentication system using React, FastAPI, and PostgreSQL.

 # FEATURES
 -User Registeration
 -User Login
 -User Validation
 -Database Integration
 -Session Maintain

 ## HOW TO RUN THE PROJECT
 cd front-app--
 npm install
 npm run all

 ### HOW TO RUN FRONTEND SEPARATELY
 cd front-app--
 npm install
 npm run dev

 ### HOW TO RUN BACKEND SEPARATLEY
 cd backend-app
 venv\Scripts\activate
 uvicorn main:app --reload

 ### DATABASE SETUP
 1.This project uses PostgreSQL
 2.Create a databasee named 'userdb':
... sql
CREATE DATABASEE userdb;
3. Open 'main.py' and update the database connection details:
...python 
DATABASEE_URL =
"postgresql://postgres:your_passwprd@localhost:5432\userdb"

 

 
