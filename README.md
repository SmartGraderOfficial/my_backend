# Quiz Extension Backend

A secure and optimized Express.js backend for a quiz extension with MongoDB integration.

## Features

- 🔐 **Secure Authentication**: AccessKey-based authentication with account lockout protection
- 🚀 **High Performance**: Optimized MongoDB queries with compound indexes
- 🛡️ **Security First**: Rate limiting, input validation, and comprehensive error handling
- 📊 **Robust Architecture**: Modular structure with middleware, controllers, and services
- 🔍 **Advanced Search**: Exact question matching with multiple options
- 📈 **Monitoring**: Health checks and activity logging
- 🚦 **Rate Limiting**: Per-user and per-endpoint rate limiting

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, bcryptjs
- **Validation**: Joi
- **Logging**: Morgan

## Project Structure

```
server/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   └── questionController.js # Business logic
├── middleware/
│   ├── auth.middleware.js  # Authentication middleware
│   ├── errorHandler.js     # Error handling
│   └── validation.js       # Input validation
├── models/
│   ├── Question.js         # Question schema
│   └── User.js            # User schema
├── routes/
│   └── questionRoutes.js   # API routes
├── utils/
│   └── importData.js       # Data import utility
├── app.js                 # Express app configuration
├── server.js              # Server entry point
└── .env.example           # Environment variables template
```

## Quick Start

### 1. Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 2. Installation

```bash
# Clone and navigate to the project
cd server

# Install dependencies
npm install

# Install additional dependencies
npm install express-rate-limit helmet joi morgan nodemon
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations
# Important: Change MONGO_URI and JWT_SECRET
```

### 4. Database Setup

```bash
# Start MongoDB service (if running locally)
# Make sure MongoDB is running on your configured port

# Import sample data
node utils/importData.js
```

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# OR production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```http
GET /api/quiz/health
```

### Get Answer (Main Endpoint)
```http
POST /api/quiz/get-answer
Content-Type: application/json

{
  "AccessKey": "samplekey123",
  "question": "Your question text here",
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
      "questionType": "Multiple Choice Question",
      "difficulty": "Medium"
    },
    "requestedBy": "John Doe",
    "timestamp": "2025-01-31T12:00:00.000Z"
  }
}
```

### Search Questions
```http
GET /api/quiz/search?keyword=division&section=Quant&limit=10&page=1
Authorization: AccessKey in request body or header
```

### Get Statistics
```http
GET /api/quiz/stats
Authorization: AccessKey in request body or header
```

## Security Features

### Authentication
- AccessKey-based authentication
- Bcrypt hashing for access keys
- Account lockout after failed attempts
- Session management

### Rate Limiting
- Global rate limiting: 100 requests per 15 minutes
- Answer endpoint: 30 requests per 10 minutes
- Search endpoint: 20 requests per 15 minutes
- Stats endpoint: 10 requests per 15 minutes

### Input Validation
- Joi schema validation
- Request sanitization
- Type checking
- Length limits

### Error Handling
- Comprehensive error middleware
- Structured error responses
- Security-focused error messages
- Logging for debugging

## Database Schema

### User Collection
```javascript
{
  NameOfStu: String,     // Student name
  StuID: String,         // Unique student ID  
  AccessKey: String,     // Hashed access key
  isActive: Boolean,     // Account status
  lastLogin: Date,       // Last login timestamp
  loginAttempts: Number, // Failed login count
  lockUntil: Date       // Account lock expiry
}
```

### Question Collection
```javascript
{
  section: String,       // Question section
  questionType: String,  // Type of question
  directions: String,    // Instructions
  question: String,      // Question text (required)
  OptionA: String,       // Option A
  OptionB: String,       // Option B  
  OptionC: String,       // Option C
  OptionD: String,       // Option D
  CorrectAns: String,    // Correct answer (required)
  difficulty: String,    // Easy/Medium/Hard
  isActive: Boolean     // Question status
}
```

## Performance Optimizations

### Database Indexes
- Compound index on question + all options
- Individual indexes on section, questionType, difficulty
- Text search indexes for full-text search
- User authentication indexes

### Query Optimization
- Lean queries for better performance
- Aggregation pipelines for statistics
- Pagination for large result sets
- Connection pooling

## Error Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid access key)
- `404` - Not Found (question not found)
- `423` - Locked (account temporarily locked)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/production_db
JWT_SECRET=super_secure_random_string_minimum_32_characters
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Security Checklist
- [ ] Change default JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Enable MongoDB connection encryption
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name "quiz-backend"
pm2 startup
pm2 save
```

## Testing

### Sample AccessKeys
After running the import script, you can test with:
- `samplekey123` (John Doe)
- `testkey456` (Jane Smith)  
- `demokey789` (Demo User)

### Testing with curl
```bash
# Test health endpoint
curl http://localhost:5000/api/quiz/health

# Test get answer endpoint
curl -X POST http://localhost:5000/api/quiz/get-answer \
  -H "Content-Type: application/json" \
  -d '{
    "AccessKey": "samplekey123",
    "question": "After the division of a number successively by 3, 4, and 7, the remainders obtained are 2, 1 and 4 respectively. What will be the remainder if 84 divide the same number ?",
    "OptionA": "80",
    "OptionB": "76", 
    "OptionC": "41",
    "OptionD": "53"
  }'
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB service is running
   - Verify MONGO_URI in .env file
   - Check network connectivity

2. **Authentication Failed**
   - Verify AccessKey exists in database
   - Check if account is locked
   - Ensure AccessKey is correct

3. **Question Not Found**
   - Check exact text matching
   - Verify all options are provided
   - Ensure question exists in database

4. **Rate Limit Exceeded**
   - Wait for rate limit window to reset
   - Check if making too many requests
   - Verify rate limit configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
#   m y _ b a c k e n d  
 