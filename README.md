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

 ### HOW TO RUN FRONTEND SEPARATELY
 ```bash
 cd front-app--
 npm install
 npm run dev
 ```

 ### HOW TO RUN BACKEND SEPARATLEY
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

 

 
