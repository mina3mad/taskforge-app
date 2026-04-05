# taskforge-app
TaskForge is a project management application inspired by tools like Jira, designed to help teams organize their work, collaborate efficiently, and track progress across projects.


## Tech Stack:
Language: TypeScript (strict mode)
Backend: NestJS
Frontend: React
Database: PostgreSQL
ORM: TypeORM
Containerization: Docker & Docker Compose

----------------------------------------------------------------------------------------------------
## Features
### 1-Authentication Service:

User registration (email & password)
Login with JWT access token & refresh token
Secure token refresh flow
Logout (refresh token invalidation)
Role-Based Access Control (RBAC)


### 2-Project Management:

Create, update, delete projects
Assign users to projects
Project ownership support
Role-based permissions enforcement


### 3-Task Management:

CRUD operations for tasks
Assign tasks to users
Task lifecycle:
BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → QA → DONE
                                   ↘ REOPENED → IN_PROGRESS
Role-based task permissions


### 4-Bonus Features Implemented:
- Pagination on list endpoints
- Search & filtering (tasks by status / assignee)
- API Documentation via Postman

----------------------------------------------------------------------------------------------------
## Postman Docs:
https://documenter.getpostman.com/view/37303980/2sBXionVdN

## Test Credentials:
Use the following admin account to test the system:
Email: admin@example.com
Password: Admin@123

----------------------------------------------------------------------------------------------------
## Setup Guide

```bash
1. Clone the Repository

git clone https://github.com/mina3mad/taskforge-app.git

cd taskforge-app

2. Environment Variables

Create a .env file based on .env.example.
If no `.env` file is provided, default values defined in `docker-compose.yml` will be used.

3. Run with Docker

docker-compose up --build

This will start:

Backend API
Frontend app
PostgreSQL database (Migrations will run)


4. Access the Application
Frontend: http://localhost:80
Backend API: http://localhost:3001

```
----------------------------------------------------------------------------------------------------
## Trade-offs

- First time working with React, so the main focus was on backend functionality (auth, RBAC,        project/task management) rather than advanced frontend UI/UX.
- Used Postman documentation instead of Swagger to save time.
- Relied on manual API testing using Postman for all endpoints instead of automated unit tests due to time constraints.

----------------------------------------------------------------------------------------------------
## Enhancements

- Integrate Swagger/OpenAPI documentation
- Implement real email service (e.g. SendGrid or nodemailer)
- Add notifications system
- Improve UI/UX
- Optimize database queries and indexing
