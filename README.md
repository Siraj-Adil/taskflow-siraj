# TaskFlow — Backend API

TaskFlow is a backend API for a minimal task management system.

The system is built with **Node.js, Express, Prisma ORM, and PostgreSQL**, and fully containerized using Docker.

---

## Table of Contents

-   [1. Overview](#1-overview)
-   [2. Tech Stack](#2-tech-stack)
-   [3. Architectural Decisions](#3-architectural-decisions)
-   [4. Project Structure](#4-project-structure)
-   [5. Running Locally](#5-running-locally)
-   [6. Database & Migrations](#6-database--migrations)
-   [7. API Testing (Postman Collection)](#7-api-testing-postman-collection)
-   [8. Automatic Testing (Integration Tests)](#8-automatic-testing-integration-tests)
-   [9. API Endpoints](#9-api-endpoints)
-   [10. Authorization Logic](#10-authorization-logic)
-   [11. What I’d Improve With More Time](#11-what-id-improve-with-more-time)

---

## 1. Overview

TaskFlow is a backend API for a project and task management system with authentication, role-based access control, and collaborative task assignment.

### Core features

-   RESTful APIs with validation, and consistent error handling
-   Users can register/login and manage projects and tasks
-   JWT-based authentication with secure password hashing (bcrypt)
-   Prisma + PostgreSQL for data modeling and migrations
-   Role + relationship-based authorization (owner, assignee, external user)
-   Fully containerized with Docker and tested using Jest + Supertest

### Bonus Features

-   Paginations on list endpoints
-   4 integration test suites (46 total test cases covering full API workflows)
-   Project statistics endpoint (`GET /projects/:id/stats`) with task counts by status/assignee

---

## 2. Tech Stack

-   Node.js (Express)
-   Prisma ORM
-   PostgreSQL
-   JWT Authentication
-   bcryptjs (password hashing)
-   Jest + Supertest (integration tests)
-   Docker + Docker Compose

| Layer                | Technology                               |
| -------------------- | ---------------------------------------- |
| **Backend**          | Node.js (v22) (JavaScript, ES Modules)   |
| **Framework**        | Express.js (v5)                          |
| **Database**         | PostgreSQL (v18)                         |
| **ORM**              | Prisma ORM (v6.19)                       |
| **Authentication**   | JWT (jsonwebtoken v9, HS256, 24h expiry) |
| **Password Hashing** | bcryptjs (cost 12)                       |
| **Validation**       | Zod (v4)                                 |
| **Testing**          | Jest (v30) + Supertest (v7)              |
| **Enviornment**      | dotenv (v17)                             |
| **CORS**             | cors middleware (v2.8)                   |
| **Container**        | Docker multi-stage build                 |

---

## 3. Architectural Decisions

### Why Monolith?

-   Chosen for simplicity and fast development within assignment scope
-   Single deployable service makes Docker setup and reviewer execution straightforward
-   No need for inter-service communication given limited domain (users, projects, tasks)
-   Reduces operational and architectural overhead

### Why Express.js?

-   Minimal and unopinionated, allowing full control over structure and middleware
-   Fast to build REST APIs with clean routing and middleware support
-   Works well for modular controller-based architecture used in this project

### Why Prisma?

-   Simplifies database access with clean and readable query APIs
-   Schema-driven approach ensures consistency between code and database
-   Migration system keeps database changes versioned and reproducible

### Why Controller-Based Structure?

-   Clear separation of concerns by domain (auth, projects, tasks)
-   Keeps routes thin and focused only on request mapping
-   Improves readability and maintainability for review
-   Easy to extend without refactoring existing modules

### Key Tradeoffs

-   No service layer abstraction → kept logic in controllers for simplicity and speed
-   No caching layer (Redis) → not required for expected scale
-   No async job system → kept flow synchronous for predictability
-   Inline authorization checks → explicit and easier to audit during review

---

## 4. Project Structure

```
taskflow-siraj/
├── docker-compose.yaml                 # Full stack orchestration (API + DB)
├── .env                                # Local environment variables (not committed)
├── .env.example                        # Environment template for setup
├── Taskflow.postman_collection.json    # API testing collection
├── .gitignore
├── README.md
│
└── backend/
    ├── Dockerfile                      # Multi-stage Node.js build
    ├── package.json                    # Dependencies and scripts
    ├── package-lock.json
    ├── jest.config.js                  # Test configuration (Jest + Supertest)
    ├── eslint.config.js                # Linting rules
    │
    ├── prisma/
    │   ├── schema.prisma               # Database schema (PostgreSQL models)
    │   ├── seed.js                     # Seed script (test user, project, tasks)
    │   └── migrations/                 # Prisma migrations (versioned DB changes)
    │
    ├── src/
    │   ├── app.js                      # Express app setup (middleware + routes)
    │   ├── server.js                   # Server entry point
    │   │
    │   ├── config/
    │   │   └── db.js                   # Prisma client / DB connection setup
    │   │
    │   ├── controllers/                # Business logic layer
    │   │   ├── auth.controller.js
    │   │   ├── project.controller.js
    │   │   └── task.controller.js
    │   │   └── user.controller.js
    │   │
    │   ├── middleware/
    │   │   └── auth.middleware.js      # JWT authentication guard
    │   │
    │   ├── routes/                     # API route definitions
    │   │   ├── auth.routes.js
    │   │   ├── project.routes.js
    │   │   └── task.routes.js
    │   │   └── user.routes.js
    │   │
    │   ├── utils/
    │   │   └── jwt.js                  # JWT token generation & verification
    │   │
    │   └── validations/                # Zod schemas for request validation
    │       ├── auth.validation.js
    │       ├── project.validation.js
    │       └── task.validation.js
    │
    └── tests/
        ├── auth.test.js
        ├── project.test.js
        ├── task.test.js
        └── full.role.based.test.js     # End-to-end role + permission flow tests
```

---

## 5. Running Locally

### Prerequisites

-   Docker installed
-   Docker Compose enabled

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/taskflow.git
cd taskflow-siraj

# 2. Create environment file
cp .env.example .env

# 3. Run the application (one command)
docker compose up
```

The app is now running at port 3000. Database, migrations, and seed data are handled automatically.

### What happens automatically

When containers start:

-   PostgreSQL container starts and becomes healthy
-   Backend container builds and starts
-   Prisma migrations run automatically: `npx prisma migrate deploy`
-   Database seed runs automatically: `npx prisma db seed`
-   Server starts on: `http://localhost:3000`

### Verify setup

-   API Base URL: http://localhost:3000
-   Test credentials (seeded user):

```json
{
    "email": "test@example.com"
    "password": "password123"
}
```

### Run tests (optional)

```bash
docker exec -it taskflow_backend npm run test
```

### Rebuilding After Changes in project

```bash
docker compose build --no-cache
docker compose up
```

---

## 6. Database & Migrations

### Database Schema

**User**

-   id (UUID)
-   name, email, password
-   created_at

**Project**

-   id (UUID)
-   name, description
-   owner_id → User
-   created_at

**Task**

-   id (UUID)
-   title, description
-   status (todo | in_progress | done)
-   priority (low | medium | high)
-   project_id → Project
-   assignee_id → User (optional)
-   due_date
-   timestamps

**Relationships**

-   User → Projects (1:N, owner)
-   Project → Tasks (1:N)
-   User → Tasks (1:N, assignee)

### Database Migrations

-   Database schema is managed using Prisma Migrate
-   All schema changes are version-controlled inside:

```bash
prisma/migrations/
```

-   Migrations are executed automatically during Docker startup using:

```bash
npx prisma migrate deploy
```

This ensures the database is always in sync with the application schema without manual steps.

### Seeding Strategy

-   A seed script is used to initialize test data:

```bash
prisma/seed.js
```

-   Seed runs automatically after migrations during container startup:

```bash
npx prisma db seed
```

Seed Data Includes:

-   1 test user (for immediate login testing)

```json
{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
}
```

-   1 sample project owned by the test user

```json
{
    "name": "Test Project",
    "description": "Seed project"
}
```

-   3 tasks with different statuses and priorities

```json
{
    "tasks": [
        {
            "title": "Todo task",
            "status": "todo",
            "priority": "low"
        },
        {
            "title": "In progress task",
            "status": "in_progress",
            "priority": "medium"
        },
        {
            "title": "Done task",
            "status": "done",
            "priority": "high"
        }
    ]
}
```

### Database Reset (Optional)

-   Rollbacks are handled via controlled redeployment and migration history
-   To fully reset the database:

```bash
docker compose down -v
docker compose up --build
```

---

## 7. API Testing (Postman Collection)

A complete Postman collection is included in the repository:

```
Taskflow.postman_collection.json
```

### What it includes:

-   Full authentication flow (register, login)
-   Project CRUD operations
-   Task CRUD operations
-   Automatic token handling using collection variables
-   Dynamic chaining of IDs (user_id, project_id, task_id)

### Features:

-   Automatically stores JWT token after login
-   Saves user_id, project_id, and task_id for chained requests
-   Ready-to-use test flow without manual setup
-   Covers full end-to-end API workflow

### How to use:

-   Import Taskflow.postman_collection.json into Postman
-   Execute requests in sequence: Auth → Projects → Tasks
-   Login request will automatically store the token
-   Subsequent requests will use saved variables
-   Base URL: `http://localhost:3000`

---

## 8. Automatic Testing (Integration Tests)

-   4 integration test suites using Jest + Supertest
-   46 total test cases covering full API workflows

### Coverage Includes:

-   Authentication flow (register, login, JWT validation)
-   Project CRUD operations
-   Task CRUD operations
-   Role-based access control (owner, assignee, external user)
-   End-to-end workflow validation (assignment → access change → permissions)

### Test Type

-   Integration tests (not unit tests)
-   Tests run against real Express app with database interactions

Note: For simplicity, test devDependencies (jest & supertest) are included in the Docker image to allow running tests inside the container. In a production setup, tests would run in a separate container or CI pipeline, and the production image would exclude devDependencies for optimization.

### Run Tests

```bash
docker exec -it taskflow_backend npm run test
```

### Stopping app

```bash
docker compose down
```

---

## 9. API Endpoints

**Base URL:** `http://localhost:3000`

All authenticated endpoints require: `Authorization: Bearer <token>`

### API Documentation (Swagger)

This project includes interactive API documentation using Swagger (OpenAPI).

#### Swagger UI

You can explore and test all endpoints directly from the browser at. `http://localhost:3000/api-docs`

### Authentication

#### POST /auth/register

Password must be atleast 8 characters.

```json
// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }

// Response 201
{ "token": "eyJhbGci...", "user": { "id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428", "name": "John Doe", "email": "john@example.com" } }
```

#### POST /auth/login

```json
// Request
{ "email": "jane@example.com", "password": "secret123" }

// Response 200
{ "token": "eyJhbGci...", "user": { "id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428", "name": "Jane Doe", "email": "jane@example.com" } }
```

### Projects

#### GET /projects

List projects the user owns OR has tasks in.

```json
// Response 200
{
    "projects": [
        {
            "id": "uuid",
            "name": "New Project",
            "description": "Optional description",
            "owner_id": "uuid",
            "created_at": "2026-04-14T20:11:25.790Z"
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
    }
}
```

#### POST /projects

Description, owner_id are optional. Creates a new project

```json
// Request
{ "name": "New Project", "description": "Optional" }

// Response 201 — created project
{
    "id": "c785f228-1d2f-4ec7-9e92-b05a229c6137",
    "name": "New Project",
    "description": "Optional description",
    "owner_id": "uuid",
    "created_at": "2026-04-14T20:11:25.790Z"
}
```

#### GET /projects/:id

Returns project with all its tasks.

```json
// Response 200
{
    "project": {
        "id": "c785f228-1d2f-4ec7-9e92-b05a229c6137",
        "name": "New Project",
        "description": "Optional description",
        "owner_id": "uuid",
        "created_at": "2026-04-14T20:11:25.790Z",
        "tasks": [
            {
                "id": "uuid",
                "title": "Design homepage",
                "description": null,
                "status": "todo",
                "priority": "high",
                "project_id": "uuid",
                "assignee_id": "uuid",
                "due_date": "2026-04-15T00:00:00.000Z",
                "created_at": "2026-04-14T20:13:23.403Z",
                "updated_at": "2026-04-14T20:13:23.403Z"
            }
        ]
    }
}
```

#### PATCH /projects/:id

Description, owner_id are optional. Update project details (owner only)

```json
// Request
{ "name": "Updated Name", "description": "Updated" }

// Response 200 — updated project
{
    "id": "c785f228-1d2f-4ec7-9e92-b05a229c6137",
    "name": "Updated Name",
    "description": "Updated description",
    "owner_id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428",
    "created_at": "2026-04-14T21:27:38.278Z"
}
```

#### DELETE /projects/:id

Delete project (cascade delete tasks) (owner only)

```
Response 204 No Content
```

#### GET /projects/:id/stats

Get project's task counts by status/assignee

```json
// Response 200
{
    "total_tasks": 10,
    "by_status": { "todo": 3, "in_progress": 5, "done": 2 },
    "by_assignee": [
        { "assignee_id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428", "assignee_name": "Jane Doe", "count": 6 }
    ]
}
```

### Tasks

#### GET /projects/:id/tasks

Supports filters: `?status=todo&assignee=uuid&page=1&limit=10`

```json
// Response 200
{
    "tasks": [
        {
            "id": "affaa7ff-6ce7-4566-b4c3-752dff856974",
            "title": "Design homepage",
            "description": null,
            "status": "todo",
            "priority": "high",
            "project_id": "c785f228-1d2f-4ec7-9e92-b05a229c6137",
            "assignee_id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428",
            "due_date": "2026-04-15T00:00:00.000Z",
            "created_at": "2026-04-14T21:28:05.485Z",
            "updated_at": "2026-04-14T21:28:05.485Z"
        }
    ],
    "pagination": {
        "total": 1,
        "page": 1,
        "limit": 10,
        "totalPages": 1
    }
}
```

#### POST /projects/:id/tasks

All fields optional except title. Create task (owner & project member)

```json
// Request
{
    "title": "Design homepage",
    "description": "Create mockups",
    "priority": "high",
    "assignee_id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428",
    "due_date": "2026-04-15"
}

// Response 201 — created task
{
    "id": "affaa7ff-6ce7-4566-b4c3-752dff856974",
    "title": "Design homepage",
    "description": "Create mockups",
    "status": "todo",
    "priority": "high",
    "project_id": "c785f228-1d2f-4ec7-9e92-b05a229c6137",
    "assignee_id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428",
    "due_date": "2026-04-15T00:00:00.000Z",
    "created_at": "2026-04-14T21:28:05.485Z",
    "updated_at": "2026-04-14T21:28:05.485Z"
}
```

#### PATCH /tasks/:id

All fields optional. (Project Owner + Task Assignee)

```json
// Request
{ "title": "Updated title", "status": "done", "priority": "high" }

// Response 200 — updated task
{
    "id": "affaa7ff-6ce7-4566-b4c3-752dff856974",
    "title": "Updated title",
    "description": null,
    "status": "done",
    "priority": "high",
    "project_id": "c785f228-1d2f-4ec7-9e92-b05a229c6137",
    "assignee_id": "6ae6dc5e-0f72-494e-9a2d-e3e9dd1bf428",
    "due_date": "2026-04-15T00:00:00.000Z",
    "created_at": "2026-04-14T21:28:05.485Z",
    "updated_at": "2026-04-14T21:28:13.025Z"
}
```

#### DELETE /tasks/:id

Delete task (owner & project member)

```
Response 204 No Content
```

### Users

#### GET /users

```json
// Response 200 — updated task
{
  "users": [
    {
      "id": "80fe1c4f-0da0-4ab4-bc65-38481944a4ec",
      "name": "Test User",
      "email": "test@example.com",
      "password": "$2b$12$DpMCbE6VUXOBdc38IIk6M.UOd1nCuja1rAgEhXSbtatQGtf8qODqW",
      "created_at": "2026-04-21T11:30:02.826Z"
    }
  ]
}
```

### Health

#### GET /health

```json
// Response 200 — updated task
{
  "status": "ok",
  "uptime": 1070.21249158,
  "timestamp": "2026-04-21T11:47:53.074Z"
}
```

### Error Responses

| Status | Response                                                                       |
| ------ | ------------------------------------------------------------------------------ |
| 400    | `{ "error": "validation failed", "fields": { "email": "Email is required" } }` |
| 401    | `{ "error": "unauthorized" }`                                                  |
| 403    | `{ "error": "forbidden" }`                                                     |
| 404    | `{ "error": "not found" }`                                                     |

---

## 10. Authorization Logic

### Auth routes

-   No authentication required

### Projects routes

| Route                | Authorized Users            |
| -------------------- | --------------------------- |
| GET /projects        | Project Owner + Team member |
| POST /projects       | Any authenticated user      |
| GET /projects/:id    | Project Owner + Team member |
| PATCH /projects/:id  | Project Owner               |
| DELETE /projects/:id | Project Owner               |

### Task Routes

| Route                    | Authorized Users              |
| ------------------------ | ----------------------------- |
| GET /projects/:id/tasks  | Project Owner + Team member   |
| POST /projects/:id/tasks | Project Owner + Team member   |
| PATCH /tasks/:id         | Project Owner + Task Assignee |
| DELETE /tasks/:id        | Project Owner + Task Assignee |

---

## 11. What I’d Improve With More Time

-   **Refresh Token System**

    -   Add refresh tokens for better session management and security

-   **Stronger Authorization (RBAC)**

    -   Introduce role-based access control instead of inline checks
    -   Separate permissions (owner, member, viewer)

-   **Stronger Integration Testing**

    -   Increase test coverage for edge cases and failure scenarios
    -   Use a dedicated test database instead of shared/dev DB
    -   Run tests in an isolated container environment (separate from app runtime)

-   **Pagination & Filtering Enhancements**

    -   Add cursor-based pagination for better scalability
    -   Improve filtering (search, date ranges, sorting)

-   **Service Layer Abstraction**

    -   Move business logic from controllers to services for better separation

-   **Caching Layer**

    -   Use Redis for frequently accessed data (projects/tasks)

-   **Better Error Handling**

    -   Centralized error handler with consistent response structure

-   **Background Jobs**

    -   Add async processing (e.g., notifications, emails)

-   **CI/CD & Production Readiness**
    -   Add CI pipeline for tests & linting
    -   Optimize Docker image (exclude devDependencies)

**Author:** Siraj Adil
