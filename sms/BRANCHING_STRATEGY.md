# Branch Protection & PR Workflow

## Branch Naming Convention

### Feature Branches

```
feature/feature-name
feature/add-user-authentication
feature/implement-task-management
```

### Bug Fix Branches

```
fix/bug-description
fix/login-redirect-issue
fix/validation-error
```

### Chore/Documentation Branches

```
chore/update-dependencies
docs/api-documentation
```

## Branch Protection Rules

### Main Branch

- Require pull request reviews before merging (minimum 2 approvals)
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require code review from code owners
- Restrict who can push to matching branches

### Develop Branch

- Require pull request reviews before merging (minimum 1 approval)
- Require status checks to pass before merging
- Require branches to be up to date before merging

## Pull Request Workflow

1. **Create Feature Branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes & Commit**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to Remote**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**
   - Use the PR template provided
   - Add descriptive title and description
   - Link related issues
   - Request reviewers

5. **Code Review**
   - Address review comments
   - Update code as needed
   - Re-request review after changes

6. **Merge**
   - Ensure all checks pass
   - Squash and merge for cleaner history

## Commit Message Convention

Use conventional commits:

```
type(scope): subject

body

footer
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, dependencies, etc.

### Examples

```
feat(auth): add JWT token refresh endpoint
fix(task): prevent duplicate task creation
docs: update API documentation
```
