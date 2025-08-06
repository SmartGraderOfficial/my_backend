# Quick Start Guide

This is a production-ready Express.js backend for a quiz extension with MongoDB.

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- Data file: `data.json` in Downloads folder

### Setup Commands

```bash
# 1. Navigate to server directory
cd server

# 2. Run automated setup
npm run setup

# 3. Start the server
npm start

# 4. Test the API (in another terminal)
npm test
```cd 

## 📡 API Endpoints

### Main Endpoint - Get Answer
```http
POST /api/quiz/get-answer
Content-Type: application/json

{
  "AccessKey": "samplekey123",
  "question": "Your question text",
  "OptionA": "Option A text",
  "OptionB": "Option B text",
  "OptionC": "Option C text", 
  "OptionD": "Option D text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "correctOptionKey": "OptionD",
    "correctOptionValue": "53",
    "questionDetails": {
      "section": "Quant",
      "questionType": "Multiple Choice Question"
    }
  }
}
```

### Authentication Endpoints
```http
POST /api/auth/register     # Register new user
POST /api/auth/verify       # Verify access key
GET  /api/auth/profile      # Get user profile
```

### Utility Endpoints
```http
GET  /health                # Server health check
GET  /api/quiz/health       # Quiz service health
GET  /api/quiz/search       # Search questions
GET  /api/quiz/stats        # Question statistics
```

## 🔑 Sample Access Keys

After running the setup, use these test access keys:
- `samplekey123` (John Doe)
- `testkey456` (Jane Smith)
- `demokey789` (Demo User)

## 🧪 Testing

```bash
# Test all endpoints
npm test

# Start development server
npm run dev

# Import data manually
npm run import
```

## 🔒 Security Features

- ✅ Access key authentication with bcrypt hashing
- ✅ Rate limiting (per IP and per user)
- ✅ Account lockout after failed attempts
- ✅ Input validation with Joi
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Error handling and logging

## 📊 Performance Features

- ✅ MongoDB compound indexes for fast search
- ✅ Connection pooling
- ✅ Optimized queries with lean()
- ✅ Pagination for large datasets
- ✅ Request/response compression

## 🚨 Troubleshooting

### Server won't start
- Check MongoDB is running
- Verify `.env` file exists and is configured
- Run `npm install` to ensure dependencies

### Authentication fails
- Verify access key exists in database
- Check if account is locked (wait 30 minutes)
- Ensure exact access key match

### Question not found
- Check exact text matching (case-sensitive)
- Verify all options are provided
- Run data import: `npm run import`

### Rate limit exceeded
- Wait for rate limit window to reset (15 minutes)
- Check if making too many requests

## 📁 Project Structure

```
server/
├── config/db.js           # Database configuration
├── controllers/           # Business logic
├── middleware/            # Authentication, validation, errors
├── models/               # MongoDB schemas
├── routes/               # API endpoints
├── utils/                # Utilities (data import)
├── test/                 # API tests
├── app.js                # Express app setup
├── server.js             # Server entry point
└── README.md             # Detailed documentation
```

## 🌐 Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas for database
3. Configure proper CORS origins
4. Use HTTPS
5. Set strong JWT_SECRET
6. Enable MongoDB authentication
7. Use PM2 for process management

## 📞 Support

- Check `README.md` for detailed documentation
- Run `npm test` to verify setup
- Check server logs for errors
- Ensure all prerequisites are met

---

**Need help?** Check the detailed README.md file for comprehensive documentation.
