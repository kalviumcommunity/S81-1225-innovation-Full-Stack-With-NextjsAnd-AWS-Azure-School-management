# Student Management System

# Advanced Data Fetching in Next.js (App Router)

## Concept-1: Static, Dynamic, and Hybrid Rendering

This project demonstrates how Next.js App Router supports multiple rendering strategies — Static Site Generation (SSG), Server-Side Rendering (SSR), and Incremental Static Regeneration (ISR). The goal is to understand how choosing the right rendering method impacts performance, scalability, and data freshness in real-world applications.

---

## Rendering Strategies Implemented in This App

| Page           | Rendering Strategy      | Reason                             |
| -------------- | ----------------------- | ---------------------------------- |
| /about         | Static Rendering (SSG)  | Content does not change frequently |
| /dashboard     | Dynamic Rendering (SSR) | Real-time and user-specific data   |
| /announcements | Hybrid Rendering (ISR)  | Needs periodic updates             |

---

## How Rendering Choices Affect Performance, Scalability, and Data Freshness

### 1. Static Rendering (SSG)

**Used in:** About Page

Static pages are generated at build time and served as pre-rendered HTML.

**Impact:**

- Performance: Very high (fastest load time)
- Scalability: Excellent (served via CDN)
- Data Freshness: Low (requires rebuild to update)

**Why chosen:**  
The About page contains static school information that rarely changes.

---

### 2. Dynamic Rendering (SSR)

**Used in:** Dashboard Page

Pages are rendered on every request, ensuring fresh and personalized data.

**Impact:**

- Performance: Moderate (server computation per request)
- Scalability: Limited due to server load
- Data Freshness: Excellent (always up-to-date)

**Why chosen:**  
The Dashboard displays live and user-specific data such as attendance and academic summaries.

---

### 3. Hybrid Rendering (ISR)

**Used in:** Announcements Page

ISR combines static rendering with periodic revalidation using the `revalidate` option.

**Impact:**

- Performance: High
- Scalability: High
- Data Freshness: Good (updated automatically at intervals)

**Why chosen:**  
Announcements need to stay updated but do not require real-time rendering.

---

## Trade-Off Summary

| Rendering Type | Speed  | Scalability | Freshness |
| -------------- | ------ | ----------- | --------- |
| Static (SSG)   | High   | High        | Low       |
| Dynamic (SSR)  | Medium | Low         | High      |
| Hybrid (ISR)   | High   | High        | Medium    |

Each rendering mode optimizes two out of three factors: speed, scalability, and data freshness.

---

## Understanding Cloud Deployments: Docker → CI/CD → AWS/Azure

This section explains how a full-stack application like the **Student Management System** can be taken from a local development environment to the cloud using **Docker**, **CI/CD pipelines**, and **AWS/Azure**, while maintaining security, consistency, and reliability.

---

## 2.12 Docker & Compose Setup for Local Development

This repo includes a Dockerized local stack that runs:

- Next.js app
- PostgreSQL database
- Redis cache

### Files added

- App image build: [sms/Dockerfile](sms/Dockerfile)
- Multi-service local stack: [docker-compose.yml](docker-compose.yml)

### What the Dockerfile does (Next.js)

The [sms/Dockerfile](sms/Dockerfile) builds a production-ready Next.js container:

- Uses `node:20-alpine`
- Installs dependencies with `npm ci` (from `package-lock.json`)
- Runs `npm run build`
- Exposes port `3000`
- Starts with `npm run start`

### What the Compose stack does

The [docker-compose.yml](docker-compose.yml) defines 3 services connected by a shared bridge network (`localnet`):

- `app` (Next.js)
  - Builds from `./sms`
  - Publishes `3000:3000`
  - Injects:
    - `DATABASE_URL=postgres://postgres:password@db:5432/mydb`
    - `REDIS_URL=redis://redis:6379`
- `db` (PostgreSQL 15)
  - Publishes `5432:5432`
  - Persists data using the named volume `db_data` mounted at `/var/lib/postgresql/data`
- `redis` (Redis 7)
  - Publishes `6379:6379`

### Networks, volumes, and environment variables

- **Network**: `localnet` lets containers reach each other by service name (`db`, `redis`).
- **Volume**: `db_data` persists Postgres data across restarts.
- **Env vars**:
  - `DATABASE_URL` points the app to Postgres _inside_ the Docker network (`db:5432`).
  - `REDIS_URL` points the app to Redis _inside_ the Docker network (`redis:6379`).

Note: `depends_on` ensures startup order, but it does not guarantee that Postgres/Redis are fully ready before the app starts.

### Run the full stack locally

From the repo root (same folder as [docker-compose.yml](docker-compose.yml)):

```bash
docker compose up --build
```

If your machine uses the legacy binary:

```bash
docker-compose up --build
```

Stop containers:

```bash
docker compose down
```

Stop and delete the Postgres volume (full reset):

```bash
docker compose down -v
```

### Verify everything is running

- App: http://localhost:3000
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

Useful commands:

```bash
docker ps
docker compose logs -f app
docker compose logs -f db
docker compose logs -f redis
```

### Common issues + fixes (reflection)

- **Port conflict** (`Bind for 0.0.0.0:5432 failed`): stop the service using the port, or change the host mapping in [docker-compose.yml](docker-compose.yml).
- **Docker engine not running (Windows)** (`open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`): start Docker Desktop and ensure it’s using **Linux containers** (WSL2-backed).
- **Slow builds**: first build downloads deps; later builds are faster due to Docker layer caching.
- **App starts before DB is ready**: retry the request, or add DB readiness logic in the app (Compose ordering is not a health guarantee).

### Evidence (screenshots / logs)

Paste your proof here after running locally:

- Screenshot or log showing `docker compose up --build` completed
- Output of `docker ps` showing `nextjs_app`, `postgres_db`, and `redis_cache` running

---

## 2.13 PostgreSQL Schema Design

This project uses a normalized PostgreSQL schema (managed via Prisma ORM) to model the core school-management entities and their relationships.

### Core entities

- `User` (authentication + role)
- `Student` (student profile, 1:1 with `User`)
- `Teacher` (teacher profile, 1:1 with `User`)
- `Class` (a class taught by a teacher)
- `Enrollment` (many-to-many bridge between `Student` and `Class`)
- `Attendance` (per-student, per-class, per-day record)
- `Announcement` (created by a teacher, optionally targeted to a class)

### ER diagram (high level)

```mermaid
erDiagram
  User ||--o| Student : has
  User ||--o| Teacher : has
  Teacher ||--o{ Class : teaches
  Student ||--o{ Enrollment : enrolls
  Class ||--o{ Enrollment : contains
  Student ||--o{ Attendance : marked
  Class ||--o{ Attendance : has
  Teacher ||--o{ Announcement : creates
  Class ||--o{ Announcement : targets
```

### Prisma schema

- Schema file: [sms/prisma/schema.prisma](sms/prisma/schema.prisma)
- Initial migration SQL: [sms/prisma/migrations/20251224153000_init_schema/migration.sql](sms/prisma/migrations/20251224153000_init_schema/migration.sql)
- Seed script: [sms/prisma/seed.js](sms/prisma/seed.js)

### Keys, relationships, constraints, and indexes (examples)

- **Primary keys (PKs)**: all tables use UUID-backed string IDs.
- **Foreign keys (FKs)**:
  - `Student.userId → User.id` (1:1)
  - `Teacher.userId → User.id` (1:1)
  - `Class.teacherId → Teacher.id` (1:N)
  - `Enrollment.studentId → Student.id` and `Enrollment.classId → Class.id` (M:N)
- **Uniqueness constraints**:
  - `User.email` unique
  - `Student.admissionNo` unique
  - `Teacher.employeeNo` unique
  - `Enrollment(studentId, classId)` unique (prevents duplicate enrollment)
  - `Attendance(studentId, classId, date)` unique (one attendance entry per day)
- **Referential actions**:
  - Cascade deletes for dependent records (e.g., deleting a `Student` removes enrollments/attendance)
  - `Announcement.classId` uses `SET NULL` so old announcements can remain even if a class is deleted
- **Indexes**:
  - Common query paths are indexed (e.g., `Class.teacherId`, `Attendance(classId, date)`, `Enrollment(classId)`)

### Normalization notes (1NF / 2NF / 3NF)

- **1NF**: all fields are atomic (no repeating groups stored in a single column).
- **2NF**: many-to-many data is moved into the bridge table `Enrollment` instead of duplicating class lists inside `Student`.
- **3NF**: role-specific attributes are separated into `Student` / `Teacher` instead of bloating `User` with optional columns.

### Migrations, seeding, and verification

1. Ensure Postgres is running (Docker recommended).

```bash
docker compose up -d db redis
```

2. Run migrations and seed data (from the `sms` folder).

```bash
cd sms

# PowerShell example:
$env:DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
npx prisma migrate dev --name init_schema
npx prisma db seed
npx prisma studio
```

### Evidence (screenshots / logs)

Paste your proof here after running locally:

- Terminal output for `npx prisma migrate dev --name init_schema`
- Terminal output for `npx prisma db seed`
- Screenshot of Prisma Studio showing related records (User ↔ Student/Teacher, Enrollment, Attendance)

---

### 1. Containerization Using Docker

Docker is used to package the application along with all its dependencies into a **container**, ensuring that the app runs the same way in development, testing, and production environments.

In this project:

- A **Dockerfile** defines how the Next.js application is built and run.
- The application is exposed on a fixed port (e.g., `3000`) to avoid runtime conflicts.
- Environment-specific configuration is **not hardcoded** into the image.

**Benefits of Docker:**

- Eliminates “works on my machine” issues
- Ensures consistent runtime environments
- Makes deployments repeatable and predictable

---

### 2. CI/CD Pipeline Using GitHub Actions

A **CI/CD pipeline** automates the process of building, testing, and deploying the application whenever new code is merged.

Typical pipeline flow:

```
Code Commit → GitHub Actions Trigger → Docker Image Build → Tests → Deployment
```

In this setup:

- The pipeline builds the Docker image automatically
- Environment variables are injected securely during deployment
- Deployment happens only after successful builds

**Why CI/CD matters:**

- Reduces manual errors
- Enables faster and safer deployments
- Ensures only tested code reaches production

---

### 3. Secure Environment Variable & Secrets Management

One major best practice followed is **never committing secrets to GitHub**.

Instead:

- Environment variables are stored using:

  - GitHub Secrets (for CI/CD)
  - Cloud provider configuration (AWS/Azure)

- Separate environments are maintained:

  - Development
  - Staging
  - Production

Examples of managed secrets:

- Database URLs
- API keys
- Authentication tokens

This ensures security and prevents accidental exposure of sensitive data.

---

### 4. Deployment to AWS / Azure (Conceptual Setup)

The containerized application can be deployed using:

- **AWS EC2 / Elastic Beanstalk**
- **Azure App Service**

Deployment steps:

1. Pull the Docker image
2. Inject environment variables
3. Start the container on a fixed port
4. Route traffic using cloud networking

Using containers ensures versioned deployments and easy rollbacks.

---

### 5. Case Study: “The Never-Ending Deployment Loop”

**Problem Symptoms:**

- CI/CD pipeline fails with “Environment variable not found”
- Errors like “Port already in use”
- Old containers continue running after new deployments

**Root Causes:**

- Environment variables not injected at runtime
- Containers not stopped before redeploying
- Same port reused without cleanup
- No versioned container strategy

**Solutions:**

- Use `.env` files locally and secrets in CI/CD
- Stop and remove old containers before starting new ones
- Use versioned Docker images
- Ensure each pipeline stage hands off cleanly to the next

This creates a reliable **chain of trust**:

```
Code → Container → Pipeline → Cloud → Secure Runtime
```

---

### 6. Reflection

**What was challenging:**

- Understanding how environment variables differ across environments
- Debugging deployment failures caused by missing secrets

**What worked well:**

- Docker provided consistent builds
- CI/CD automation reduced manual effort

**What I would improve next time:**

- Add staging deployments before production
- Implement better logging and monitoring
- Explore Infrastructure as Code (Terraform/Bicep)

---

### Conclusion

Docker and CI/CD pipelines simplify cloud deployments by making them **repeatable, automated, and secure**. When combined with proper environment management and cloud services, they enable scalable and reliable deployments for modern full-stack applications.

---

# Team Branching & PR Workflow

This repo follows a team workflow designed for clear collaboration, reliable reviews, and consistent quality.

## Branch naming conventions

Use these prefixes for all non-`main` branches:

- `feature/<feature-name>`
- `fix/<bug-name>`
- `chore/<task-name>`
- `docs/<update-name>`

Examples:

- `feature/login-auth`
- `fix/navbar-alignment`
- `docs/update-readme`

## Pull request (PR) template

All PRs should follow the template in:

- `.github/pull_request_template.md`

## Code review checklist

Reviewers should check:

- Code follows naming conventions and project structure
- Functionality verified locally (at least the changed flow)
- No unexpected console errors or warnings
- `npm run lint` passes
- `npm run build` passes
- Comments/documentation are meaningful (no noise, explains “why”)
- No secrets / sensitive data committed (API keys, tokens, `.env` files)

## Branch protection rules (GitHub Settings)

Configure in GitHub: Repository → Settings → Branches → Branch protection rules

Protect `main` with:

- Require a pull request before merging
- Require approvals (at least 1 teammate)
- Require status checks to pass before merging
  - Select the CI check name: `sms (lint + build)`
- Require branch to be up to date before merging
- Disallow direct pushes to `main`

## Evidence / screenshots (assignment deliverables)

Add screenshots after you create a real PR:

- Screenshot 1: PR showing the `sms (lint + build)` check passing
- Screenshot 2: PR showing at least one review approval OR resolved review comments

## Reflection (why this helps)

- Branch naming keeps work traceable and reduces confusion.
- PR templates and checklists make reviews faster and more consistent.
- Branch protection ensures code is reviewed and validated before it reaches `main`, improving quality and team velocity.

### Concept-2.10: Environment Variable Management

This project follows best practices for managing environment variables and secrets in a Next.js (App Router) application to ensure security, maintainability, and production readiness.

Environment Files Used

Two environment configuration files are used in this project to clearly separate real secrets from documented placeholders.

.env.local

This file stores real credentials and sensitive configuration values required for the application to function correctly.

Used only in local development

Never committed to GitHub

Contains actual secrets

Examples of values stored here include database URLs, authentication secrets, and private API keys.
