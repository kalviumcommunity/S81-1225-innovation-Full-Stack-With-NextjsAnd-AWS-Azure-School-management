# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints (except signup/login) require a Bearer token:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": {
    "field": ["Error message"]
  }
}
```

## Status Codes

- `200`: OK
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `500`: Internal Server Error

---

## Authentication Endpoints

### POST /auth/signup

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT"
    },
    "token": "jwt-token"
  }
}
```

### POST /auth/login

Authenticate user and get token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STUDENT"
    },
    "token": "jwt-token"
  }
}
```

### POST /auth/logout

Logout user and invalidate token.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful",
  "data": null
}
```

---

## Projects Endpoints

### GET /projects

Get all projects for current user.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Projects fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Web Development",
      "description": "Learn Next.js",
      "status": "ACTIVE",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": null,
      "createdBy": "uuid",
      "_count": {
        "tasks": 5
      }
    }
  ]
}
```

### POST /projects

Create a new project.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "Web Development",
  "description": "Learn Next.js",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-04-15T00:00:00Z"
}
```

### GET /projects/:id

Get project details.

**Headers:**

```
Authorization: Bearer <token>
```

---

## Tasks Endpoints

### GET /tasks

Get all tasks (optionally filtered by project).

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `projectId` (optional): Filter by project ID

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Tasks fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Setup Environment",
      "description": "Install Node.js",
      "status": "TODO",
      "priority": 1,
      "dueDate": "2024-01-22T00:00:00Z",
      "projectId": "uuid",
      "assignedTo": "uuid",
      "assignee": {
        "id": "uuid",
        "email": "student@example.com",
        "firstName": "Alice",
        "lastName": "Smith"
      }
    }
  ]
}
```

### POST /tasks

Create a new task.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "title": "Setup Environment",
  "description": "Install Node.js",
  "priority": 1,
  "dueDate": "2024-01-22T00:00:00Z",
  "projectId": "uuid",
  "assignedTo": "uuid"
}
```

### PATCH /tasks/:id

Update task status.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "status": "IN_PROGRESS"
}
```

**Status Values:**

- `TODO`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

---

## Error Examples

### Validation Error

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Unauthorized

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### Not Found

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found"
}
```
