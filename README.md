# Todo Backend — Internship Assignment

Small, scalable REST API for a Todo-style tasks app with authentication, RBAC, validation, caching, and a minimal frontend demo (separate). Built with Node.js, Express, MongoDB (Atlas), and Redis (Upstash).

---

## Features implemented

* User registration & login (bcrypt password hashing + JWT)
* Role-based access (user vs admin)
* CRUD APIs for Tasks (title, description, subtasks, status, dueDate, archived)
* API versioning: `/api/v1/*`
* Validation (express-validator)
* Error handling with structured responses `{ error: '...', details?: [...] }`
* Logging (winston)
* Redis caching for GET endpoints (Upstash-ready)
* Postman collection included for API testing
* Swagger UI available at `/api-docs` for interactive API documentation
* Dockerfile included for backend 
---

## Quickstart (local)

### Prerequisites

* Node 18+ (or Node 20)
* npm
* MongoDB (Atlas recommended) — get connection string
* Redis (Upstash recommended) — get `REDIS_URL`

### Install

```bash
git clone <repo-url>
cd todo-backend
npm install
```

### Environment

Create `.env` in project root (example):

```
PORT=5000
MONGO_URI=<your-mongo-connection-string>
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
REDIS_URL=<your_redis_url>    # optional, leave empty to disable caching
CACHE_TTL=60
```

### Run (development)

```bash
npm run dev
# nodemon runs server.js which mounts src/app.js
```

API will be available at `http://localhost:9000/api/v1`.

---

## API docs / Postman / Swagger

Import the Postman collection at `docs/postman_collection.json` into Postman. Set collection/environment variables:
Or visit **http://localhost:9000/api-docs** (Swagger UI) for interactive API documentation.

* `base_url` (e.g. `http://localhost:9000/api/v1`)
* `jwt_token` (populated after login)

Suggested flow:

1. `POST /users/register` → create user
2. `POST /users/login` → store token in `jwt_token`
3. Use token to call `/tasks` endpoints

---

## Code structure (important files)

```
src/
  controllers/
    task.controller.js
    user.controller.js
  models/
    task.model.js
    user.model.js
  routes/
    user.routes.js
    task.routes.js
  validators/
    user.validator.js
    task.validator.js
  middleware/
    authMiddleware.js
    validateRequest.js
  utils/
    logger.js
    cache.js
    redis.js
    scan-delete.js
  app.js
  db.js
server.js
```

---

## Testing

Use the Postman collection to run through typical flows (register/login/tasks CRUD). Tests are manual via Postman in this assignment.

---

## Deployment notes & Scalability (short)

* **Stateless API**: Authentication via JWT; app instances are stateless and can be horizontally scaled behind a load balancer.
* **Centralized cache**: Redis (Upstash) is used and must be a single/shared instance for all app replicas.
* **DB**: MongoDB Atlas for production; use indexes on fields used for filtering and sorting (`owner`, `status`, `createdAt`, `dueDate`).
* **Improvements for higher scale**:

  * Replace list caching `KEYS` usage  with key-indexing or `SCAN` (already done).
  * Add request rate limiting and API gateway.
  * Move long-running tasks to background workers (e.g., processing attachments).
  * Consider cursor-based pagination for very large datasets instead of returning whole lists.
  * Containerize (Docker) and use an orchestrator (Kubernetes) for multi-zone availability.

---

## Deliverables

* Source repo with backend code
* `docs/postman_collection.json` — importable collection
* `README.md` — setup, run, and scalability note
