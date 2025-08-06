# Recent Questions API Documentation

## Overview
Your Quiz Extension Backend now supports retrieving the last 25 (or any number) of searched questions. This feature helps you track recent search activity and identify popular questions.

## New Functions Available

### 1. `getRecentUnansweredQuestions(limit)`
```javascript
import { getRecentUnansweredQuestions } from './utils/unansweredQuestions.js';

// Get last 25 questions
const recent25 = getRecentUnansweredQuestions(25);

// Get last 10 questions  
const recent10 = getRecentUnansweredQuestions(10);

// Get last 5 questions
const recent5 = getRecentUnansweredQuestions(5);
```

### 2. `getMostSearchedQuestions(limit)`
```javascript
import { getMostSearchedQuestions } from './utils/unansweredQuestions.js';

// Get top 25 most searched questions
const topQuestions = getMostSearchedQuestions(25);
```

## New API Endpoints

### Get Recent Questions
```
GET /api/quiz/unanswered/recent?limit=25
```

**Headers:**
```
AccessKey: your-access-key-here
Content-Type: application/json
```

**Query Parameters:**
- `limit` (optional): Number of questions to retrieve (1-100, default: 25)

**Response:**
```json
{
  "success": true,
  "limit": 25,
  "totalReturned": 25,
  "questions": [
    {
      "id": "1753995324679",
      "timestamp": "2025-07-31T20:55:24.571Z",
      "lastSearched": "2025-07-31T20:55:24.571Z",
      "searchCount": 1,
      "directions": "Test directions",
      "question": "What is the capital of France?",
      "questionImage": "",
      "options": {
        "A": "London",
        "B": "Berlin", 
        "C": "Paris",
        "D": "Madrid"
      },
      "searchedBy": {
        "userId": "test-user-1",
        "userAgent": "Recent Test Agent"
      }
    }
  ]
}
```

### Get Most Searched Questions
```
GET /api/quiz/unanswered/most-searched?limit=25
```

Same format as recent questions, but sorted by search count (highest first).

## Usage Examples

### JavaScript/Node.js
```javascript
// In your server code
import { getRecentUnansweredQuestions } from './utils/unansweredQuestions.js';

// Get last 25 questions
const recentQuestions = getRecentUnansweredQuestions(25);

console.log(`Found ${recentQuestions.length} recent questions`);
recentQuestions.forEach(q => {
  console.log(`${q.question} - Searched ${q.searchCount} times`);
});
```

### API Calls (JavaScript Fetch)
```javascript
// Get recent questions via API
async function getRecentQuestions(limit = 25) {
  const response = await fetch(`http://localhost:3000/api/quiz/unanswered/recent?limit=${limit}`, {
    method: 'GET',
    headers: {
      'AccessKey': 'your-access-key-here',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.questions;
}

// Usage
const last25 = await getRecentQuestions(25);
console.log('Recent questions:', last25);
```

### Curl Commands
```bash
# Get last 25 recent questions
curl -X GET "http://localhost:3000/api/quiz/unanswered/recent?limit=25" \
  -H "AccessKey: your-access-key-here" \
  -H "Content-Type: application/json"

# Get last 10 recent questions  
curl -X GET "http://localhost:3000/api/quiz/unanswered/recent?limit=10" \
  -H "AccessKey: your-access-key-here" \
  -H "Content-Type: application/json"

# Get top 25 most searched questions
curl -X GET "http://localhost:3000/api/quiz/unanswered/most-searched?limit=25" \
  -H "AccessKey: your-access-key-here" \
  -H "Content-Type: application/json"
```

## Data Structure

Each question object contains:
- `id`: Unique identifier for the question
- `timestamp`: When the question was first logged
- `lastSearched`: When the question was last searched
- `searchCount`: How many times this question has been searched
- `directions`: Instructions or context for the question
- `question`: The question text
- `questionImage`: URL to question image (if any)
- `options`: Object containing answer options (A, B, C, D, etc.)
- `searchedBy`: Information about who searched for this question

## Test Files

1. **`test-last-25-questions.js`** - Simple test showing last 25 questions
2. **`test-recent-questions.js`** - Comprehensive test with all functionality
3. **`postman-recent-questions.json`** - Postman collection for API testing

## Running Tests

```bash
# Simple test for last 25 questions
node test-last-25-questions.js

# Comprehensive test with all features
node test-recent-questions.js
```

## Notes

- Questions are automatically logged when no match is found during search
- Questions are sorted by `lastSearched` timestamp (most recent first) for recent queries
- Questions are sorted by `searchCount` (highest first) for most searched queries
- The `limit` parameter is capped between 1 and 100 for performance
- Both old questions (with `description` field) and new questions (with `directions` field) are supported

## File Location

All unanswered questions are stored in:
```
server/data/unanswered_questions.json
```

You can examine this file directly to see all logged questions.
