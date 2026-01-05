# Database Schema Documentation

## Overview

This document describes the PostgreSQL schema for the School Management System (SMS).

## Tables

### Users

Stores user account information.

**Fields:**

- `id` (UUID): Primary key
- `email` (String, unique): User email address
- `password` (String): Hashed password
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `role` (Enum): User role (ADMIN, TEACHER, STUDENT, PARENT)
- `avatar` (String, optional): Avatar URL
- `isActive` (Boolean): Account status
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**

- `email` (unique)
- `role`

### Projects

Stores project/course information.

**Fields:**

- `id` (UUID): Primary key
- `title` (String): Project title
- `description` (String, optional): Project description
- `status` (Enum): Status (ACTIVE, ARCHIVED, COMPLETED)
- `startDate` (DateTime): Project start date
- `endDate` (DateTime, optional): Project end date
- `createdBy` (UUID): Creator user ID (foreign key)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**

- `createdBy`
- `status`

### Tasks

Stores task/assignment information.

**Fields:**

- `id` (UUID): Primary key
- `title` (String): Task title
- `description` (String, optional): Task description
- `status` (Enum): Status (TODO, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` (Int): Priority level (1-5)
- `dueDate` (DateTime, optional): Due date
- `projectId` (UUID): Related project (foreign key)
- `assignedTo` (UUID, optional): Assigned user (foreign key)
- `createdBy` (UUID): Creator user ID (foreign key)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**

- `projectId`
- `assignedTo`
- `createdBy`
- `status`

### Submissions

Stores student submissions for tasks.

**Fields:**

- `id` (UUID): Primary key
- `taskId` (UUID): Related task (foreign key)
- `studentId` (UUID): Student user (foreign key)
- `content` (String): Submission content
- `fileUrl` (String, optional): Attachment URL
- `grade` (Int, optional): Grade
- `feedback` (String, optional): Teacher feedback
- `createdAt` (DateTime): Submission timestamp
- `updatedAt` (DateTime): Last update timestamp

**Constraints:**

- Unique constraint on (taskId, studentId)

**Indexes:**

- `taskId`
- `studentId`

### Comments

Stores comments on tasks.

**Fields:**

- `id` (UUID): Primary key
- `content` (String): Comment text
- `taskId` (UUID): Related task (foreign key)
- `userId` (UUID): Comment author (foreign key)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Indexes:**

- `taskId`
- `userId`

### Sessions

Stores user session tokens.

**Fields:**

- `id` (UUID): Primary key
- `userId` (UUID): User (foreign key)
- `token` (String, unique): JWT token
- `expiresAt` (DateTime): Token expiration
- `createdAt` (DateTime): Creation timestamp

**Indexes:**

- `userId`
- `token`

## Relationships

```
User (1) ──→ (many) Project (createdBy)
User (1) ──→ (many) Task (createdBy, assignedTo)
User (1) ──→ (many) Submission (studentId)
User (1) ──→ (many) Comment (userId)
User (1) ──→ (many) Session (userId)

Project (1) ──→ (many) Task (projectId)

Task (1) ──→ (many) Submission (taskId)
Task (1) ──→ (many) Comment (taskId)
```

## Migrations

Migrations are stored in `prisma/migrations/` directory. Run migrations with:

```bash
npx prisma migrate deploy
```

## Seeding

Seed the database with initial data:

```bash
npx prisma db seed
```
