## 🔒 GitHub Secrets Configuration Guide

This document provides step-by-step instructions for setting up GitHub Secrets for your multi-environment deployment pipeline.

---

## Prerequisites

- Admin access to your GitHub repository
- Environment-specific credentials (API URLs, database credentials, etc.)

---

## Step 1: Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, expand **Secrets and variables**
4. Click on **Actions**
5. Click **New repository secret** button

---

## Step 2: Add Required Secrets

### Development Environment Secrets

| Secret Name        | Description                     | Example Value                                                 |
| ------------------ | ------------------------------- | ------------------------------------------------------------- |
| `DEV_API_URL`      | Development API endpoint        | `http://localhost:4000`                                       |
| `DEV_DATABASE_URL` | Development database connection | `postgresql://dev_user:dev_pass@localhost:5432/school_dev_db` |
| `DEV_JWT_SECRET`   | Development JWT signing key     | `dev_jwt_secret_key_change_in_production`                     |

### Staging Environment Secrets

| Secret Name            | Description                 | Example Value                                                          |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------- |
| `STAGING_API_URL`      | Staging API endpoint        | `https://staging-api.schoolmanagement.com`                             |
| `STAGING_DATABASE_URL` | Staging database connection | `postgresql://stage_user:stage_pass@staging-db:5432/school_staging_db` |
| `STAGING_JWT_SECRET`   | Staging JWT signing key     | `[Generate secure random string]`                                      |

### Production Environment Secrets

| Secret Name         | Description                    | Example Value                                                  |
| ------------------- | ------------------------------ | -------------------------------------------------------------- |
| `PROD_API_URL`      | Production API endpoint        | `https://api.schoolmanagement.com`                             |
| `PROD_DATABASE_URL` | Production database connection | `postgresql://prod_user:prod_pass@prod-db:5432/school_prod_db` |
| `PROD_JWT_SECRET`   | Production JWT signing key     | `[Generate secure random string]`                              |

---

## Step 3: Generate Secure Secrets

### For JWT Secrets

Use a cryptographically secure random generator:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### For Database URLs

Format: `postgresql://username:password@host:port/database`

**Important:**

- Use strong, unique passwords for each environment
- Never reuse staging credentials in production
- Use different database users with appropriate permissions

---

## Step 4: Verify Secret Setup

After adding all secrets, your Actions secrets page should show:

```
✅ DEV_API_URL
✅ DEV_DATABASE_URL
✅ DEV_JWT_SECRET
✅ STAGING_API_URL
✅ STAGING_DATABASE_URL
✅ STAGING_JWT_SECRET
✅ PROD_API_URL
✅ PROD_DATABASE_URL
✅ PROD_JWT_SECRET
```

---

## Step 5: Test the Pipeline

1. Make a commit to the `development` branch
2. Check GitHub Actions tab for workflow run
3. Verify build completes successfully
4. Check logs to confirm correct environment variables loaded

---

## Security Best Practices

### ✅ DO:

- Use strong, unique secrets for each environment
- Rotate secrets periodically (every 90 days recommended)
- Limit repository access to trusted team members
- Use branch protection rules for `main` and `staging`
- Enable required reviews for production deployments

### ❌ DON'T:

- Share secrets via email, Slack, or other channels
- Use the same secret across multiple environments
- Commit secrets to version control (even in private repos)
- Give unnecessary people access to production secrets
- Use weak or default passwords

---

## Troubleshooting

### Secret Not Available in Workflow

**Problem:** Workflow fails with "secret not found"

**Solution:**

1. Check secret name matches exactly (case-sensitive)
2. Verify you're using `${{ secrets.SECRET_NAME }}` syntax
3. Ensure workflow has `actions: read` permissions

### Wrong Environment Variables Loaded

**Problem:** Production using staging database

**Solution:**

1. Check branch name in conditional: `if: github.ref == 'refs/heads/main'`
2. Verify you pushed to correct branch
3. Check GitHub Actions logs for which condition triggered

### Secret Values Visible in Logs

**Problem:** Secrets appearing in workflow logs

**Solution:**

- GitHub automatically masks secret values
- If visible, you may have echoed them explicitly
- Remove any `echo` commands that output secrets
- Use `::add-mask::` to hide values

---

## Advanced: Using AWS Secrets Manager (Optional)

For enterprise deployments, consider AWS Secrets Manager:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Fetch secrets from AWS
  run: |
    aws secretsmanager get-secret-value --secret-id prod/database-url --query SecretString --output text
```

---

## Questions?

If you encounter issues:

1. Check GitHub Actions logs for error messages
2. Verify all secrets are properly configured
3. Test locally with `.env.development` first
4. Review the [main README](README.md) for setup instructions

---

**Last Updated:** December 17, 2025
