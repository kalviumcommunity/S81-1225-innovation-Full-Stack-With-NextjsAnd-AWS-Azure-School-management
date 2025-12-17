This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# 🏫 School Management System

A production-ready Next.js application demonstrating enterprise-level DevOps practices including multi-environment configuration, secure secrets management, and automated CI/CD pipelines.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Multi-Environment Configuration](#multi-environment-configuration)
- [Secure Secrets Management](#secure-secrets-management)
- [CI/CD Pipeline](#cicd-pipeline)
- [Case Study: The Staging Secret That Broke Production](#case-study-the-staging-secret-that-broke-production)
- [Video Walkthrough Guide](#video-walkthrough-guide)

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

---

## 🌍 Multi-Environment Configuration

This project implements a **production-grade multi-environment setup** supporting three distinct environments:

### Environments

| Environment     | Purpose                       | Database            | Debug Mode |
| --------------- | ----------------------------- | ------------------- | ---------- |
| **Development** | Local development and testing | Local PostgreSQL    | Enabled    |
| **Staging**     | Pre-production testing and QA | Staging database    | Disabled   |
| **Production**  | Live user-facing application  | Production database | Disabled   |

### Environment Files

```
📁 Project Root
├── .env.development      # Local development (NOT committed)
├── .env.staging          # Staging environment (NOT committed)
├── .env.production       # Production environment (NOT committed)
└── .env.example          # Template (ONLY file committed)
```

### Environment Variables Structure

Each environment file contains:

```env
# API Configuration
NEXT_PUBLIC_API_URL=          # Environment-specific API endpoint
NEXT_PUBLIC_APP_ENV=          # Environment identifier

# Database Configuration
DATABASE_URL=                  # Environment-specific database connection

# Authentication
JWT_SECRET=                    # Unique secret per environment
NEXT_PUBLIC_APP_NAME=         # Display name with env suffix

# Feature Flags
NEXT_PUBLIC_ENABLE_DEBUG=     # true in dev, false elsewhere
```

### Why This Matters

✅ **Prevents Accidental Data Mixing**: Each environment uses isolated databases  
✅ **Safe Testing**: Staging environment mirrors production without affecting real users  
✅ **Clear Separation**: Developers can't accidentally push staging config to production  
✅ **Audit Trail**: Environment-specific builds are traceable through CI/CD logs

---

## 🔐 Secure Secrets Management

### The Problem

Hardcoding secrets in code or committing `.env` files exposes:

- Database credentials
- API keys
- JWT secrets
- Third-party service tokens

### Our Solution

#### 1. Local Development

- Use `.env.development` for local testing (never committed)
- Each developer maintains their own local credentials

#### 2. GitHub Secrets (CI/CD)

All sensitive values stored securely in GitHub:

**Required Secrets:**

| Secret Name            | Purpose                  | Example                         |
| ---------------------- | ------------------------ | ------------------------------- |
| `DEV_API_URL`          | Development API endpoint | http://localhost:4000           |
| `STAGING_API_URL`      | Staging API endpoint     | https://staging-api.example.com |
| `PROD_API_URL`         | Production API endpoint  | https://api.example.com         |
| `DEV_DATABASE_URL`     | Development database     | postgres://...                  |
| `STAGING_DATABASE_URL` | Staging database         | postgres://...                  |
| `PROD_DATABASE_URL`    | Production database      | postgres://...                  |
| `DEV_JWT_SECRET`       | Development JWT secret   | random_string_dev               |
| `STAGING_JWT_SECRET`   | Staging JWT secret       | random_string_staging           |
| `PROD_JWT_SECRET`      | Production JWT secret    | random_string_prod              |

#### 3. How Secrets Are Injected

In our GitHub Actions workflow:

```yaml
- name: Load Production Environment Variables
  if: github.ref == 'refs/heads/main'
  run: |
    echo "NEXT_PUBLIC_API_URL=${{ secrets.PROD_API_URL }}" >> .env.production
    echo "DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}" >> .env.production
    echo "JWT_SECRET=${{ secrets.PROD_JWT_SECRET }}" >> .env.production
```

**Key Points:**

- ✅ Secrets never appear in code
- ✅ `.env.production` file created **during build**, not committed
- ✅ Different secrets per environment (staging DB ≠ production DB)
- ✅ Secrets encrypted at rest in GitHub

#### 4. Alternative Secret Management (Enterprise)

For production systems, consider:

- **AWS Secrets Manager** / **Parameter Store**
- **Azure Key Vault**
- **HashiCorp Vault**
- **Google Cloud Secret Manager**

---

## 🚀 CI/CD Pipeline

### Automated Deployment Workflow

Our [GitHub Actions workflow](.github/workflows/deploy.yml) automatically:

1. **Detects Branch**: `development`, `staging`, or `main`
2. **Loads Correct Secrets**: Branch-specific environment variables
3. **Builds Application**: Environment-aware production build
4. **Runs Security Checks**: Scans for exposed secrets in commits
5. **Deploys**: (Configure based on hosting provider)

### Build Commands

```bash
# Development build
npm run build:development

# Staging build
npm run build:staging

# Production build
npm run build:production
```

### Branch Strategy

```
main (production)
  ↑
staging (pre-production testing)
  ↑
development (active development)
```

**Deployment Flow:**

1. Developers work on `development` branch
2. Merge to `staging` for QA testing
3. After approval, merge to `main` for production release

### Security Checks

Our pipeline includes automated security validation:

```yaml
security-check:
  steps:
    - name: Check for exposed secrets
      run: |
        # Fails if database credentials found in committed files

    - name: Verify .gitignore rules
      run: |
        # Ensures .env files are properly excluded
```

---

## 📚 Case Study: The Staging Secret That Broke Production

### 🚨 The Incident: ShopLite E-Commerce Disaster

**Scenario:**  
ShopLite, an e-commerce platform, prepared for a major weekend sale. During Friday's deployment, a developer accidentally used **staging database credentials** in the production environment. The result:

- ❌ Live product catalog overwritten with test data
- ❌ 2 hours of downtime during peak traffic
- ❌ Loss of customer trust and revenue
- ❌ Emergency rollback required

### 🔍 Root Cause Analysis

#### What Went Wrong?

1. **Manual Configuration**

   - Developers manually copied environment variables
   - No automated validation of which environment was targeted

2. **Shared Secret Files**

   - Single `.env` file used for multiple environments
   - Easy to mix staging/production credentials

3. **No Separation of Concerns**

   - Same database credentials accessible to all developers
   - No environment-specific secret isolation

4. **Lack of CI/CD Validation**
   - No automated checks to verify environment configuration
   - Manual deployments prone to human error

### ✅ How Our Setup Prevents This

#### 1. **Separate Environment Files**

```
❌ ShopLite's Approach:
.env  (single file for all environments - DANGEROUS)

✅ Our Approach:
.env.development  (isolated development config)
.env.staging      (isolated staging config)
.env.production   (isolated production config)
```

**Result:** Impossible to accidentally use staging credentials in production because they're in completely separate files.

#### 2. **GitHub Secrets Isolation**

```yaml
# Our GitHub Actions workflow
- name: Load Staging Environment Variables
  if: github.ref == 'refs/heads/staging'
  run: |
    echo "DATABASE_URL=${{ secrets.STAGING_DATABASE_URL }}" >> .env.production

- name: Load Production Environment Variables
  if: github.ref == 'refs/heads/main'
  run: |
    echo "DATABASE_URL=${{ secrets.PROD_DATABASE_URL }}" >> .env.production
```

**Protection Mechanisms:**

- ✅ Branch-based conditional logic (`if: github.ref == 'refs/heads/main'`)
- ✅ Secrets only injected for matching branch
- ✅ No way to use staging secrets on main branch

#### 3. **Automated Secret Management**

**ShopLite's Problem:**

```bash
# Developer manually sets variables (ERROR-PRONE)
export DATABASE_URL="postgres://prod_user:..."
npm run build
```

**Our Solution:**

```bash
# Automated injection via CI/CD
npm run build:production
# GitHub Actions automatically injects PROD_DATABASE_URL
```

**Result:** Zero manual intervention = zero human error.

#### 4. **Multiple Layers of Protection**

| Protection Layer                 | How It Prevents the Incident                                    |
| -------------------------------- | --------------------------------------------------------------- |
| **.gitignore rules**             | Environment files never committed, can't be accidentally shared |
| **Branch-based conditions**      | Staging secrets physically cannot be used on main branch        |
| **Separate secret namespaces**   | `STAGING_DATABASE_URL` ≠ `PROD_DATABASE_URL`                    |
| **Security checks in pipeline**  | Automated scanning detects exposed credentials                  |
| **Read-only production secrets** | Only CI/CD can access production secrets, not developers        |

#### 5. **Additional Safeguards**

**AWS Parameter Store / Azure Key Vault Enhancement:**

```javascript
// Instead of environment variables, fetch from secure vault
const getSecret = async (secretName) => {
  if (process.env.NEXT_PUBLIC_APP_ENV === "production") {
    // Only production has access to production vault
    return await fetchFromAzureKeyVault(secretName);
  }
};
```

**Benefits:**

- ✅ Secrets rotated without code changes
- ✅ Access audit logs (who accessed which secret when)
- ✅ Automatic secret expiration
- ✅ Role-based access control (RBAC)

### 📊 Comparison: Before vs After

| Aspect               | ❌ ShopLite's Approach        | ✅ Our Approach            |
| -------------------- | ----------------------------- | -------------------------- |
| **Secret Storage**   | Mixed in single `.env`        | Separate per environment   |
| **Deployment**       | Manual configuration          | Automated via CI/CD        |
| **Human Error Risk** | High (manual copying)         | Near zero (automated)      |
| **Audit Trail**      | None                          | Full CI/CD logs            |
| **Secret Rotation**  | Requires code push            | Update GitHub Secrets only |
| **Developer Access** | Direct access to prod secrets | No access (CI/CD only)     |
| **Rollback Time**    | Hours (manual process)        | Minutes (automated)        |

### 🎯 Key Takeaways

1. **Never Commit Secrets**: Use `.gitignore` + GitHub Secrets
2. **Automate Everything**: Manual deployments = human errors
3. **Isolate Environments**: Separate configs, databases, and secrets
4. **Use Branch Protection**: Enforce CI/CD for production deployments
5. **Implement Secret Vaults**: AWS/Azure key management for enterprise scale

### 💡 In Production

For real-world applications, we'd enhance this with:

- **AWS Secrets Manager** for automatic secret rotation
- **Database migration scripts** per environment
- **Blue-green deployments** to eliminate downtime
- **Automated rollback triggers** on error detection
- **Environment-specific monitoring** (Datadog, New Relic)

---

## 🎥 Video Walkthrough Guide

### What to Demonstrate (3-5 minutes)

#### 1. **Environment Files** (30 seconds)

- Show `.env.example` in VS Code
- Explain `.gitignore` rules
- Highlight separate dev/staging/prod files

#### 2. **GitHub Secrets** (45 seconds)

- Navigate to **Repo → Settings → Secrets and variables → Actions**
- Show secrets list (values hidden)
- Explain why they're never in code

#### 3. **Build Scripts** (30 seconds)

- Show `package.json` scripts
- Run `npm run build:staging`
- Show environment-specific output

#### 4. **GitHub Actions Workflow** (60 seconds)

- Open `.github/workflows/deploy.yml`
- Explain branch-based conditions
- Show security check steps

#### 5. **Case Study Explanation** (60 seconds)

- Describe ShopLite incident
- Point to README case study section
- Explain how our setup prevents it

#### 6. **Live Demo** (30 seconds)

```bash
# Show environment detection
npm run dev
# Log: "Running in development mode"
# API URL: http://localhost:4000
```

### Script Template

> "This School Management System demonstrates production-grade DevOps practices. We use separate environment files for dev, staging, and production—notice only `.env.example` is committed. Sensitive secrets like database URLs are stored in GitHub Secrets, not in code. Our CI/CD pipeline automatically loads the correct secrets based on which branch is deployed. This prevents disasters like the ShopLite incident, where staging credentials accidentally overwrote production data. With automated builds and security checks, we eliminate human error and ensure safe deployments."

---

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd sms
npm install
```

### 2. Create Local Environment File

```bash
cp .env.example .env.development
# Edit .env.development with your local values
```

### 3. Configure GitHub Secrets

**Repository → Settings → Secrets and variables → Actions → New repository secret**

Add all required secrets listed in [Secure Secrets Management](#secure-secrets-management).

### 4. Run Development Server

```bash
npm run dev
```

### 5. Test Builds

```bash
npm run build:development
npm run build:staging
npm run build:production
```

---

## 📝 Learn More

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
