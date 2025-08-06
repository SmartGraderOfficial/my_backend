# 📝 Unanswered Questions Feature

## Overview
This feature automatically logs all questions that are not found in your database to a JSON file. This helps you track missing questions and improve your database coverage.

## How It Works

### 1. **Automatic Logging**
- When a question is searched via `/api/quiz/get-answer` but no match is found in the database
- The question and options are automatically saved to `/data/unanswered_questions.json`
- Each entry includes metadata like timestamp, user info, and search count

### 2. **Smart Deduplication**
- If the same question is searched multiple times, it increments the `searchCount` instead of creating duplicates
- Questions are sorted by search count (most searched first) to prioritize popular missing questions

### 3. **Rich Metadata**
- **User tracking**: Which user searched for the question
- **Search frequency**: How many times each question was searched
- **Timestamps**: When first added and last searched
- **User agent**: Browser/device information

## JSON File Structure

```json
[
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
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    "searchCount": 3,
    "lastSearched": "2025-07-31T12:15:30.000Z"
  }
]
```

## API Endpoints

### 📊 **GET /api/quiz/unanswered/stats**
Get statistics about unanswered questions.

**Response includes:**
- Total number of unanswered questions
- Top 5 most searched questions
- 5 most recently added questions
- Total search attempts across all questions

### 📋 **GET /api/quiz/unanswered**
Get all unanswered questions with pagination and sorting.

**Query Parameters:**
- `limit`: Results per page (max 100)
- `page`: Page number
- `sortBy`: Sort by `searchCount`, `timestamp`, or `lastSearched`

### 🗑️ **DELETE /api/quiz/unanswered/clear**
Clear all unanswered questions (admin function).

## File Location
- **File Path**: `/server/data/unanswered_questions.json`
- **Auto-created**: Directory and file are created automatically
- **Backup friendly**: Plain JSON format, easy to backup/restore

## Benefits

### 1. **Database Improvement**
- Identify popular questions missing from your database
- Prioritize which questions to add first based on search frequency
- Track user demand for specific topics

### 2. **Analytics**
- Understand what users are searching for
- Identify gaps in your question coverage
- Monitor search patterns over time

### 3. **Easy Integration**
- Import unanswered questions into your database
- Use as a basis for creating new quiz content
- Export for manual review and curation

## Usage Examples

### Check Unanswered Stats
```bash
curl -H "Authorization: AccessKey YOUR_KEY" \
  http://localhost:5000/api/quiz/unanswered/stats
```

### Get Most Searched Unanswered Questions
```bash
curl -H "Authorization: AccessKey YOUR_KEY" \
  "http://localhost:5000/api/quiz/unanswered?sortBy=searchCount&limit=10"
```

### Clear All Unanswered Questions
```bash
curl -X DELETE -H "Authorization: AccessKey YOUR_KEY" \
  http://localhost:5000/api/quiz/unanswered/clear
```

## How to Disable

If you want to disable this feature:

### 1. **Disable Logging** (in `questionController.js`)
Comment out lines 29-35:
```javascript
// 📝 LOG UNANSWERED QUESTION TO JSON FILE
// Comment out the next 7 lines if you want to disable logging unanswered questions
/*
const logResult = logUnansweredQuestion(
  { question, options },
  req.user?.id,
  req.get('User-Agent')
);
console.log(`📊 Unanswered question logged. Total unanswered: ${logResult.totalUnanswered}`);
*/
// END OF UNANSWERED QUESTION LOGGING
```

### 2. **Disable Management Endpoints** (in `questionController.js`)
Comment out functions:
- `getUnansweredQuestionStats`
- `getAllUnanswered` 
- `clearAllUnanswered`

### 3. **Disable Routes** (in `questionRoutes.js`)
Comment out the unanswered question routes section.

## File Management

### Backup
```bash
# Backup unanswered questions
cp data/unanswered_questions.json backup/unanswered_$(date +%Y%m%d).json
```

### Manual Review
The JSON file can be opened in any text editor or imported into Excel/Google Sheets for review.

### Import to Database
You can create a script to import popular unanswered questions back into your main database.

## Best Practices

1. **Regular Review**: Check unanswered questions weekly to identify trends
2. **Prioritize**: Focus on questions with high search counts first
3. **Backup**: Regularly backup the JSON file
4. **Clean Up**: Periodically clear old entries after processing them
5. **Monitor Size**: Keep an eye on file size if you have high traffic

## Security Notes

- User IDs are logged but no sensitive information is stored
- File is stored locally on the server
- Access to management endpoints requires authentication
- Consider log rotation for high-traffic environments

---

This feature turns every "question not found" into valuable data for improving your quiz database! 🎯
