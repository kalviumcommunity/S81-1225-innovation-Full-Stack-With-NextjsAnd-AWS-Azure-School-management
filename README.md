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
