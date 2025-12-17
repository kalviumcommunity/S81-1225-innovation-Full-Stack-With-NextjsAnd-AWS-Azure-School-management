# ⚡ Quick Reference Guide

Essential commands and checks for multi-environment deployment.

---

## 🚀 Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repo-url>
cd sms

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.development

# Edit with your local values
# nano .env.development  (Linux/Mac)
# notepad .env.development  (Windows)
```

### Daily Development

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
# Check environment display on homepage
```

---

## 🏗️ Building for Different Environments

```bash
# Development build
npm run build:development

# Staging build
npm run build:staging

# Production build
npm run build:production
```

---

## 🔍 Verification Checklist

### Before Committing

- [ ] Secrets not in code (search for "postgresql://", "jwt_secret")
- [ ] Only `.env.example` committed
- [ ] `.gitignore` includes `.env*` rule
- [ ] No hardcoded API URLs
- [ ] No console.log with sensitive data

### Before Deploying

- [ ] All GitHub Secrets configured
- [ ] Correct branch selected (dev/staging/main)
- [ ] GitHub Actions workflow passes
- [ ] Health check endpoint works
- [ ] Environment variables logged correctly

---

## 🔐 GitHub Secrets Quick Setup

**Navigate:** Repo → Settings → Secrets and variables → Actions

**Add these secrets:**

| Secret                 | Example            | How to Generate        |
| ---------------------- | ------------------ | ---------------------- |
| `DEV_DATABASE_URL`     | `postgresql://...` | Local PostgreSQL       |
| `STAGING_DATABASE_URL` | `postgresql://...` | Staging DB             |
| `PROD_DATABASE_URL`    | `postgresql://...` | Production DB          |
| `DEV_JWT_SECRET`       | `random_string`    | `openssl rand -hex 32` |
| `STAGING_JWT_SECRET`   | `random_string`    | `openssl rand -hex 32` |
| `PROD_JWT_SECRET`      | `random_string`    | `openssl rand -hex 32` |

---

## 🐛 Troubleshooting

### Environment variables not loading

**Check:**

```javascript
// In your code
console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
```

**Restart dev server after changing .env files**

### Build fails in GitHub Actions

1. Check Actions tab for error logs
2. Verify all required secrets are set
3. Check branch name matches workflow conditions
4. Ensure `package.json` scripts are correct

### Wrong environment in production

**Cause:** Wrong branch deployed or secrets misconfigured

**Fix:**

1. Verify branch: `git branch --show-current`
2. Check GitHub Actions logs
3. Confirm secret names match workflow file

---

## 📊 Environment Comparison

| Aspect            | Development      | Staging          | Production    |
| ----------------- | ---------------- | ---------------- | ------------- |
| **API URL**       | localhost:4000   | staging-api.com  | api.com       |
| **Database**      | Local PostgreSQL | Staging DB       | Production DB |
| **Debug Mode**    | ✅ Enabled       | ❌ Disabled      | ❌ Disabled   |
| **Error Logging** | Console          | Sentry (staging) | Sentry (prod) |
| **Deployed By**   | Developers       | CI/CD            | CI/CD         |

---

## 🎯 Common Commands

```bash
# Check current branch
git branch --show-current

# Switch to staging branch
git checkout staging

# View environment variables (dev server)
# They appear in terminal when you run npm run dev

# Test API health check
curl http://localhost:3000/api/health

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check for exposed secrets (manual)
grep -r "DATABASE_URL=postgresql://" . --exclude-dir=node_modules

# Verify .gitignore
git check-ignore .env.development
# Should output: .env.development (means it's ignored)
```

---

## 📚 Additional Resources

- **README.md** - Full documentation
- **GITHUB_SECRETS_SETUP.md** - Detailed secret configuration
- **VIDEO_SCRIPT.md** - Video walkthrough guide
- **.github/workflows/deploy.yml** - CI/CD pipeline
- **app/config.js** - Environment configuration utility

---

## 🆘 Need Help?

1. Check GitHub Actions logs for build errors
2. Verify all secrets are configured in GitHub
3. Review README case study for context
4. Test locally with `.env.development` first
5. Check API health endpoint: `/api/health`

---

**Last Updated:** December 17, 2025
