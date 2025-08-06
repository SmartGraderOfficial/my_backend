# Quiz Extension API Documentation

## Overview
This is a secure Express.js backend API for a quiz extension with MongoDB integration and AccessKey-based authentication.

**Base URL:** `http://localhost:5000`
**API Version:** v1.0.0

## Authentication
The API uses AccessKey-based authentication. Include the AccessKey in the Authorization header for protected endpoints:

```
Authorization: AccessKey YOUR_ACCESS_KEY_HERE
```

## Rate Limiting
- Authentication endpoints: 10 requests per 15 minutes
- Registration: 5 requests per hour
- Quiz endpoints: 30 requests per 10 minutes
- General endpoints: 100 requests per 15 minutes

---

## Endpoints

### Health Check

#### GET /health
Check server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-31T10:30:00.000Z",
  "environment": "development"
}
```

#### GET /api/quiz/health
Check quiz service and database connectivity.

**Response:**
```json
{
  "success": true,
  "message": "Quiz service is healthy",
  "database": "Connected",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

---

### Authentication Endpoints

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "NameOfStu": "John Doe",
  "StuID": "STU001",
  "AccessKey": "MySecureKey123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "NameOfStu": "John Doe",
    "StuID": "STU001",
    "isActive": true,
    "createdAt": "2025-07-31T10:30:00.000Z"
  }
}
```

**Validation Rules:**
- `NameOfStu`: Required, 2-100 characters
- `StuID`: Required, 3-50 characters, unique
- `AccessKey`: Required, 8-128 characters, unique

#### POST /api/auth/verify
Verify access key (login functionality).

**Request Body:**
```json
{
  "AccessKey": "MySecureKey123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Access key verified successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "NameOfStu": "John Doe",
    "StuID": "STU001",
    "lastLogin": "2025-07-31T10:30:00.000Z",
    "isActive": true
  }
}
```

#### GET /api/auth/profile
Get authenticated user's profile.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "NameOfStu": "John Doe",
    "StuID": "STU001",
    "isActive": true,
    "lastLogin": "2025-07-31T10:30:00.000Z"
  }
}
```

#### PUT /api/auth/profile
Update user profile.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Request Body:**
```json
{
  "NameOfStu": "John Doe Updated"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "NameOfStu": "John Doe Updated",
    "StuID": "STU001",
    "isActive": true,
    "updatedAt": "2025-07-31T10:30:00.000Z"
  }
}
```

#### PATCH /api/auth/deactivate
Deactivate user account.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deactivated successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "isActive": false,
    "deactivatedAt": "2025-07-31T10:30:00.000Z"
  }
}
```

#### GET /api/auth/stats
Get user statistics (admin functionality).

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 15,
    "activeUsers": 12,
    "inactiveUsers": 3,
    "lockedUsers": 0
  },
  "requestedBy": "John Doe",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

---

### Quiz Endpoints

#### POST /api/quiz/get-answer
**Main endpoint:** Get the correct answer for a question with its options.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Request Body:**
```json
{
  "question": "What is the capital of France?",
  "options": {
    "A": "London",
    "B": "Berlin", 
    "C": "Paris",
    "D": "Madrid"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Answer found successfully",
  "data": {
    "questionId": "64f8a1b2c3d4e5f6g7h8i9j0",
    "question": "What is the capital of France?",
    "correctAnswer": "Paris",
    "correctIndex": 2,
    "matchScore": 1.0,
    "searchTime": "45ms"
  }
}
```

**Response (404) - No Match:**
```json
{
  "success": false,
  "message": "No matching question found",
  "data": {
    "searchedQuestion": "What is the capital of France?",
    "searchedOptions": {
      "A": "London",
      "B": "Berlin", 
      "C": "Paris",
      "D": "Madrid"
    },
    "suggestions": [
      {
        "question": "What is the capital city of France?",
        "options": {
          "A": "London",
          "B": "Berlin",
          "C": "Paris", 
          "D": "Madrid"
        },
        "similarity": 0.85
      }
    ]
  }
}
```

**Validation Rules:**
- `question`: Required, 10-1000 characters
- `options`: Required object with keys A, B (required), C, D (optional)
- `options.A`: Required, 1-500 characters
- `options.B`: Required, 1-500 characters  
- `options.C`: Optional, 1-500 characters
- `options.D`: Optional, 1-500 characters

#### GET /api/quiz/search
Search for questions (debugging/admin use).

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Query Parameters:**
- `query`: Search term (required)
- `limit`: Results per page (optional, default: 10, max: 50)
- `page`: Page number (optional, default: 1)

**Example:**
```
GET /api/quiz/search?query=capital&limit=5&page=1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "64f8a1b2c3d4e5f6g7h8i9j0",
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "correctAnswer": "Paris"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalQuestions": 25,
      "limit": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "searchTerm": "capital",
  "searchTime": "23ms"
}
```

#### GET /api/quiz/stats
Get question database statistics.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalQuestions": 1250,
    "uniqueTopics": 35,
    "averageOptionsPerQuestion": 4.2,
    "lastUpdated": "2025-07-31T08:00:00.000Z"
  },
  "requestedBy": "John Doe",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

---

### Unanswered Questions Management

#### GET /api/quiz/unanswered/stats
Get statistics about questions that couldn't be found in the database.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Response (200):**
```json
{
  "success": true,
  "message": "Unanswered questions statistics retrieved successfully",
  "data": {
    "totalUnanswered": 15,
    "mostSearched": [
      {
        "id": "1704067200000",
        "question": "What is the capital of Germany?",
        "searchCount": 5,
        "lastSearched": "2025-07-31T12:15:30.000Z"
      }
    ],
    "recentlyAdded": [
      {
        "id": "1704067260000",
        "question": "Which programming language is known for its snake logo?",
        "timestamp": "2025-07-31T10:31:00.000Z"
      }
    ],
    "totalSearches": 25
  },
  "requestedBy": "John Doe",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### GET /api/quiz/unanswered
Get all unanswered questions with pagination.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Query Parameters:**
- `limit`: Results per page (optional, default: 50, max: 100)
- `page`: Page number (optional, default: 1)
- `sortBy`: Sort order - `searchCount`, `timestamp`, or `lastSearched` (optional, default: `searchCount`)

**Example:**
```
GET /api/quiz/unanswered?limit=20&page=1&sortBy=searchCount
```

**Response (200):**
```json
{
  "success": true,
  "message": "Unanswered questions retrieved successfully",
  "data": {
    "questions": [
      {
        "id": "1704067200000",
        "timestamp": "2025-07-31T10:30:00.000Z",
        "question": "What is the capital of Germany?",
        "options": {
          "A": "Berlin",
          "B": "Munich",
          "C": "Hamburg",
          "D": "Frankfurt"
        },
        "searchedBy": {
          "userId": "64f8a1b2c3d4e5f6g7h8i9j0",
          "userAgent": "Mozilla/5.0..."
        },
        "searchCount": 3,
        "lastSearched": "2025-07-31T12:15:30.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "total": 2,
      "count": 15,
      "totalUnanswered": 25
    }
  },
  "requestedBy": "John Doe",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

#### DELETE /api/quiz/unanswered/clear
Clear all unanswered questions from the JSON file.

**Headers:**
```
Authorization: AccessKey YOUR_ACCESS_KEY
```

**Response (200):**
```json
{
  "success": true,
  "message": "All unanswered questions cleared successfully",
  "clearedBy": "John Doe",
  "timestamp": "2025-07-31T10:30:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "AccessKey",
      "message": "AccessKey must be at least 8 characters long"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid access key"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Account is locked due to too many failed attempts"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Route not found",
  "path": "/api/unknown-endpoint"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## Security Features

### Rate Limiting
- Different limits for different endpoint types
- IP-based tracking
- Configurable time windows

### Authentication
- AccessKey-based authentication
- bcrypt password hashing
- Account lockout after failed attempts
- Activity logging

### Input Validation
- Joi schema validation
- SQL injection prevention
- XSS protection
- Request size limits

### Security Headers
- Helmet.js security headers
- CORS configuration
- Content-Type validation

---

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz_extension_db
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_TIME=3600000
```

---

## Usage Examples

### Complete User Flow

1. **Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "NameOfStu": "John Doe",
    "StuID": "STU001", 
    "AccessKey": "MySecureKey123"
  }'
```

2. **Verify Access Key:**
```bash
curl -X POST http://localhost:5000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "AccessKey": "MySecureKey123"
  }'
```

3. **Get Answer:**
```bash
curl -X POST http://localhost:5000/api/quiz/get-answer \
  -H "Content-Type: application/json" \
  -H "Authorization: AccessKey MySecureKey123" \
  -d '{
    "question": "What is the capital of France?",
    "options": {
      "A": "London",
      "B": "Berlin",
      "C": "Paris",
      "D": "Madrid"
    }
  }'
```

### Testing with Node.js

```javascript
const response = await fetch('http://localhost:5000/api/quiz/get-answer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'AccessKey MySecureKey123'
  },
  body: JSON.stringify({
    question: 'What is the capital of France?',
    options: {
      A: 'London',
      B: 'Berlin',
      C: 'Paris',
      D: 'Madrid'
    }
  })
});

const data = await response.json();
console.log('Correct Answer:', data.data.correctAnswer);
```

---

## Support

For issues and questions:
1. Check server logs for error details
2. Verify MongoDB connection
3. Confirm environment variables are set
4. Test with provided Postman collection

**Server Logs Location:** Console output when running `npm start` or `npm run dev`
