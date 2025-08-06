import express from 'express';
import { 
  getAnswerByQuestion, 
  searchQuestions, 
  getQuestionStats, 
  healthCheck,
  getUnansweredQuestionStats,
  getAllUnanswered,
  clearAllUnanswered,
  getRecentUnanswered,
  getMostSearchedUnanswered,
  createQuestion,
  updateQuestionAnswer
} from '../controllers/questionController.js';
import { authenticateUser, logActivity } from '../middleware/auth.middleware.js';
import { validateQuestionSearch, validateCreateQuestion, validateUpdateAnswer } from '../middleware/validation.js';

const router = express.Router();

// Timing middleware to track search performance
const addTimestamp = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

// Health check endpoint (no authentication required)
router.get('/health', healthCheck);

// Main endpoint: Get answer by question and options
router.post('/get-answer',
  addTimestamp,
  validateQuestionSearch,
  authenticateUser,
  logActivity('GET_ANSWER'),
  getAnswerByQuestion
);

// Create new question endpoint
router.post('/create',
  validateCreateQuestion,
  authenticateUser,
  logActivity('CREATE_QUESTION'),
  createQuestion
);

// Update question answer endpoint
router.put('/:questionId/answer',
  validateUpdateAnswer,
  authenticateUser,
  logActivity('UPDATE_ANSWER'),
  updateQuestionAnswer
);

// Search questions endpoint (for debugging/admin use)
router.get('/search',
  authenticateUser,
  logActivity('SEARCH_QUESTIONS'),
  searchQuestions
);

// Get question statistics
router.get('/stats',
  authenticateUser,
  logActivity('GET_STATS'),
  getQuestionStats
);

// 📝 UNANSWERED QUESTIONS ENDPOINTS
// Comment out these routes if you want to disable unanswered questions management

// Get unanswered questions statistics
router.get('/unanswered/stats',
  authenticateUser,
  logActivity('GET_UNANSWERED_STATS'),
  getUnansweredQuestionStats
);

// Get all unanswered questions (admin endpoint)
router.get('/unanswered',
  authenticateUser,
  logActivity('GET_ALL_UNANSWERED'),
  getAllUnanswered
);

// Get recent unanswered questions (last N searched)
router.get('/unanswered/recent',
  authenticateUser,
  logActivity('GET_RECENT_UNANSWERED'),
  getRecentUnanswered
);

// Get most searched unanswered questions
router.get('/unanswered/most-searched',
  authenticateUser,
  logActivity('GET_MOST_SEARCHED_UNANSWERED'),
  getMostSearchedUnanswered
);

// Clear all unanswered questions (admin endpoint)
router.delete('/unanswered/clear',
  authenticateUser,
  logActivity('CLEAR_UNANSWERED'),
  clearAllUnanswered
);

// END OF UNANSWERED QUESTIONS ROUTES

export default router;
