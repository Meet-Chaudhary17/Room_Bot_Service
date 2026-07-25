# Room-Bot: Hostel Room Service Backend

Room-Bot is a production-ready, security-hardened backend application built with **Node.js**, **Express**, **Prisma ORM**, **PostgreSQL**, and **Socket.IO**. It manages hostel student room service requests, automates workload-balanced staff assignments, handles student complaints and feedback, and exposes full administrative dashboard controls.

---

## 🚀 Key Features

- **Identity & Authentication**: JWT session storage in secure HTTP-only cookies, password hashing with bcrypt, role-based authorization rules (Student, Staff, Admin), and email OTP-based account verification.
- **Student Workflows**: Service request creation with auto-assignment matching (finding active, unblocked staff in the student's block with matching role and the lowest active workload, utilizing randomized tie-breaking). Students can also track request logs, log complaints, and leave post-completion ratings.
- **Staff Workflows**: Dashboard statistics, request state tracking (strict lifecycle transitions: `ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `OTP_PENDING` $\rightarrow$ `COMPLETED`), email-based task completion OTP verification, and profile stats (rating averages).
- **Admin Overrides & Controls**: Live aggregates and analytics, student/staff account locks, block management (hard delete guarded by registration dependencies), service type management (soft deletions), and manual request reassignments.
- **Centralized Logs & Real-Time Sync**: Structured Winston logger (clean formats locally, JSON format in production). Authenticated socket handshakes connect clients to personal (`user_${userId}`) and role-based (`role_${role}`) channels, streaming notifications and persisting histories.
- **Hardened & Orchestrated**: Integrated Helmet, CORS, Express compression, Zod-based environment validations, GitHub Actions CI validation, and a multi-stage Docker build config.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v22+)
- **Framework**: Express (v5)
- **Database**: PostgreSQL (v17)
- **ORM**: Prisma Client
- **Real-Time**: Socket.IO
- **Validation**: Zod
- **Logger**: Winston
- **Security**: Helmet, CORS, Express-Rate-Limit, BCrypt, JsonWebToken

---

## 📐 Architecture Flow

The codebase adheres strictly to a clean, layered architecture:

```
Request (HTTP/WS)
  │
  ▼
Routes (Express & Middleware: Auth, Rate Limit)
  │
  ▼
Controllers (Payload validation with Zod Z.parse)
  │
  ▼
Services (Business logic rules, state validations, transaction blocks)
  │
  ▼
Repositories (Prisma ORM database abstractions)
  │
  ▼
Database (PostgreSQL)
```

---

## 📁 Repository Directory Structure

```text
├── .github/workflows/   # CI GitHub Actions pipelines
├── docker-compose.prod.yml # Production orchestration setup
├── backend/
│   ├── prisma/
│   │   └── schema.prisma # PostgreSQL DB schema model definitions
│   ├── src/
│   │   ├── config/      # DB, env validations, and Socket.IO servers
│   │   ├── controllers/ # HTTP handler inputs parsing
│   │   ├── middleware/  # Auth guards, security limits, error boundaries
│   │   ├── repositories/# Prisma queries abstractions
│   │   ├── routes/      # Express API routers definitions
│   │   ├── services/    # Business services and transactional steps
│   │   ├── utils/       # Logger, JWT, OTP, and ApiResponse utilities
│   │   ├── app.js       # App setup and middleware chain
│   │   └── server.js    # Entrypoint binding servers and listeners
│   ├── tests/           # Student, Staff, Admin, and Socket suites
│   ├── Dockerfile       # Multi-stage production container setup
│   └── package.json     # Node script commands and package tree
```

---

## 📋 Environment Configuration

Create a `.env` file inside the `backend` folder matching the following structure:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL Connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/room_bot_service?schema=public"

# JWT Auth secrets
JWT_SECRET="yoursupersecretjwttokenkeyvalue123456"

# SMTP Email configurations (e.g. Mailtrap or Gmail)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="smtp-username"
SMTP_PASS="smtp-password"
```

---

## 💻 Installation & Setup

### 1. Installation
Clone the repository and install the node dependencies:
```bash
cd backend
npm install
```

### 2. Run Database Migrations
Deploy the Prisma database schema and generate the Client:
```bash
npx prisma migrate dev
npx prisma generate
```

### 3. Start Development Server
```bash
npm run dev
```
The backend server will start on `http://localhost:5000`.

### 4. Run Sequential Test Suites
Run all Student, Staff, Admin, and Socket.IO integration test suites:
```bash
npm test
```

---

## 🐳 Docker Deployment

To spin up a production-ready setup with postgres and the backend running under containerized environments:

1. Configure production environment parameters.
2. Build and launch:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```
3. Run migrations on the active container:
   ```bash
   docker exec -it room-bot-backend-prod npx prisma migrate deploy
   ```
   The backend will be live on `http://localhost:5000`.
