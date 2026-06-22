 # MY ASSESSMENT
 This is user authentication system using React, FastAPI, and PostgreSQL.

 # FEATURES
 User Registeration,
 User Login,
 User Validation,
 User Dashboard,
 PostgreSQL Database Integration,
 Session Management

 ## HOW TO RUN THE PROJECT
 ```bash
 cd front-app--
 npm install
 npm run all
 ```

 ### FRONTEND SETUP AND RUN INSTRUCTIONS
 ```bash
 cd front-app--
 npm install
 npm run dev
 ```

 ### BACKEND SETUP AND RUN INSTRUCTIONS
 ```bash
 cd backend-app
 venv\Scripts\activate
 uvicorn main:app --reload
 ```

 ### DATABASE SETUP
 1. This project uses PostgreSQL
 
 2. Create a databasee named 'userdb':
``` sql
CREATE DATABASEE userdb;
```
3. Open 'main.py' and update the database connection details:
```python 
DATABASEE_URL =
"postgresql://postgres:your_password@localhost:5432\userdb"
```

 

 
