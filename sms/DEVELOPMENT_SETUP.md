# Development Setup Guide

## Prerequisites

- Node.js 20+ (with npm)
- Docker & Docker Compose
- Git

## Local Development Setup

### 1. Clone & Install Dependencies

```bash
cd sms
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/sms_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
```

### 3. Database Setup

**Option A: Using Docker Compose (Recommended)**

```bash
# Navigate to project root
cd ..

# Start all services
docker-compose up -d

# Run migrations
cd sms
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

**Option B: Local PostgreSQL**

```bash
# Make sure PostgreSQL is running
createdb sms_db

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted

## Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name migration_name

# Seed database
npx prisma db seed

# View database GUI
npx prisma studio
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose up -d --build
```

## Git Setup

### Configure Pre-commit Hooks

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

This will automatically:

- Run ESLint on staged files
- Format code with Prettier
- Prevent commits with linting errors

## Project Structure

```
sms/
├── src/
│   ├── app/              # Next.js app router & layouts
│   │   └── api/         # API routes
│   ├── components/      # React components
│   ├── lib/            # Utility libraries
│   │   ├── api-response.ts
│   │   ├── db.ts
│   │   ├── jwt.ts
│   │   └── validation.ts
│   ├── middleware/     # Express-like middleware
│   ├── types/          # TypeScript types & schemas
│   └── utils/          # Utility functions
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts        # Seed script
├── public/            # Static assets
├── .env.local         # Environment variables (local)
├── .env.example       # Environment template
├── tsconfig.json      # TypeScript config
├── next.config.ts     # Next.js config
├── eslint.config.mjs  # ESLint config
└── package.json       # Dependencies
```

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port
npm run dev -- -p 3001
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Rebuild Prisma Client
npx prisma generate
```

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npx prisma generate
```

## IDE Setup

### VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- Prisma
- Thunder Client or REST Client for API testing
- PostgreSQL (by Chris Kolkman)

### VS Code Settings

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
