import Question from '../models/Question.js';
import { 
  logUnansweredQuestion, 
  getUnansweredStats, 
  getAllUnansweredQuestions, 
  clearUnansweredQuestions,
  getRecentUnansweredQuestions,
  getMostSearchedQuestions
} from '../utils/unansweredQuestions.js';


// Health check endpoint
export const healthCheck = (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Question API is running',
    timestamp: new Date().toISOString()
  });
};

// Main function to get answer by question and options
export const getAnswerByQuestion = async (req, res) => {
  try {
    const { 
      directions, 
      question, 
      questionText, 
      questionImage, 
      options, 
      passage,
      statements,
      conclusions 
    } = req.body;
    
    const startTime = req.startTime || Date.now();
    
    console.log('🔍 Search request received:', {
      directions: directions ? `"${directions.substring(0, 50)}..."` : 'none',
      question: question ? `"${question.substring(0, 50)}..."` : 'none',
      questionText: questionText ? `"${questionText.substring(0, 50)}..."` : 'none',
      questionImage: questionImage ? 'provided' : 'none',
      passage: passage ? 'provided' : 'none',
      optionsCount: options ? (Array.isArray(options) ? options.length : Object.keys(options).length) : 0
    });

    // Validate that we have some question content
    const hasContent = questionText || question || questionImage || passage || statements;
    if (!hasContent) {
      return res.status(400).json({
        success: false,
        error: 'At least one content field (questionText, question, questionImage, passage, or statements) is required'
      });
    }

    // Handle both array and object format for options
    let processedOptions = options;
    if (Array.isArray(options)) {
      // Convert array format to object format for backward compatibility
      processedOptions = {};
      options.forEach((opt, index) => {
        const key = String.fromCharCode(65 + index); // A, B, C, D, etc.
        processedOptions[key] = opt.text || opt;
      });
    }

    // Validate options if provided
    if (processedOptions && typeof processedOptions === 'object' && Object.keys(processedOptions).length === 0) {
      processedOptions = null; // Allow questions without options
    }

    // Prepare search data with flexible fields
    const searchData = {
      directions,
      question: questionText || question,
      questionImage,
      passage,
      statements,
      conclusions,
      options: processedOptions
    };

    // Try exact match first
    let matchedQuestion = await Question.findExactMatch(searchData);
    let matchType = 'exact';
    
    // If no exact match, try flexible search
    if (!matchedQuestion) {
      matchedQuestion = await Question.findFlexibleMatch(searchData);
      matchType = 'flexible';
    }

    const searchTime = Date.now() - startTime;

    if (matchedQuestion) {
      console.log(`✅ ${matchType.charAt(0).toUpperCase() + matchType.slice(1)} match found for question in ${searchTime}ms`);
      
      return res.status(200).json({
        success: true,
        matchType: matchType,
        searchTime: `${searchTime}ms`,
        question: {
          id: matchedQuestion._id,
          pattern: matchedQuestion.pattern,
          section: matchedQuestion.section,
          directions: matchedQuestion.directions,
          questionText: matchedQuestion.questionText || matchedQuestion.question,
          questionImage: matchedQuestion.questionImage,
          passage: matchedQuestion.passage,
          statements: matchedQuestion.statements,
          conclusions: matchedQuestion.conclusions,
          options: matchedQuestion.options || {
            A: matchedQuestion.OptionA,
            B: matchedQuestion.OptionB,
            C: matchedQuestion.OptionC,
            D: matchedQuestion.OptionD
          },
          correctAnswers: matchedQuestion.correctAnswers,
          correctAnswer: matchedQuestion.CorrectAns, // Legacy support
          explanation: matchedQuestion.explanation,
          subject: matchedQuestion.subject,
          difficulty: matchedQuestion.difficulty
        }
      });
    } else {
      console.log(`❌ No match found for question in ${searchTime}ms - logging as unanswered`);
      
      // Log this as an unanswered question for database improvement
      const logResult = logUnansweredQuestion(
        { 
          directions, 
          question: questionText || question, 
          questionImage, 
          passage,
          options: Array.isArray(options) ? 
            options.reduce((acc, opt, i) => {
              acc[String.fromCharCode(65 + i)] = opt.text || opt;
              return acc;
            }, {}) : 
            options 
        },
        req.user?.id,
        req.get('User-Agent')
      );
      
      // Suggest similar questions if available
      const suggestions = await Question.findSimilarQuestions(
        questionText || question, 
        questionImage, 
        directions
      );
      
      
      return res.status(404).json({
        success: false,
        message: 'Question not found in database',
        searchTime: `${searchTime}ms`,
        suggestions: suggestions.map(q => ({
          id: q._id,
          directions: q.directions,
          questionText: q.questionText || q.question,
          questionImage: q.questionImage,
          options: q.options || {
            A: q.OptionA,
            B: q.OptionB,
            C: q.OptionC,
            D: q.OptionD
          },
          similarity: q.similarity || 'low'
        })),
        logged: logResult.success,
        totalUnanswered: logResult.totalUnanswered
      });
    }
    
  } catch (error) {
    console.error('Error in getAnswerByQuestion:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while searching for question',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
};

// Search questions (for admin/debugging purposes)
export const searchQuestions = async (req, res) => {
  try {
    const { q, limit = 10, skip = 0 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required'
      });
    }

    const questions = await Question.find({
      $or: [
        { question: { $regex: q, $options: 'i' } },
        { directions: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .select('directions question questionImage subject difficulty correctAnswer')
    .lean();

    const totalCount = await Question.countDocuments({
      $or: [
        { question: { $regex: q, $options: 'i' } },
        { directions: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } }
      ]
    });

    res.status(200).json({
      success: true,
      results: questions,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + questions.length) < totalCount
      }
    });
    
  } catch (error) {
    console.error('Error in searchQuestions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while searching questions'
    });
  }
};

// Get question statistics
export const getQuestionStats = async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const subjectStats = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const difficultyStats = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Count questions with directions
    const questionsWithDirections = await Question.countDocuments({
      directions: { $exists: true, $ne: '', $ne: null }
    });

    // Count questions with images
    const questionsWithImages = await Question.countDocuments({
      questionImage: { $exists: true, $ne: '', $ne: null }
    });

    const optionsWithImages = await Question.countDocuments({
      $or: [
        { 'options.AImage': { $exists: true, $ne: '', $ne: null } },
        { 'options.BImage': { $exists: true, $ne: '', $ne: null } },
        { 'options.CImage': { $exists: true, $ne: '', $ne: null } },
        { 'options.DImage': { $exists: true, $ne: '', $ne: null } }
      ]
    });

    res.status(200).json({
      success: true,
      stats: {
        totalQuestions,
        questionsWithDirections,
        questionsWithImages,
        questionsWithImageOptions: optionsWithImages,
        bySubject: subjectStats,
        byDifficulty: difficultyStats
      }
    });
    
  } catch (error) {
    console.error('Error in getQuestionStats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while getting question statistics'
    });
  }
};

// 📝 UNANSWERED QUESTIONS MANAGEMENT ENDPOINTS

// Get unanswered questions statistics
export const getUnansweredQuestionStats = async (req, res) => {
  try {
    const stats = getUnansweredStats();
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        error: 'Unable to retrieve unanswered questions statistics'
      });
    }
    
    res.status(200).json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('Error in getUnansweredQuestionStats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while getting unanswered questions statistics'
    });
  }
};

// Get all unanswered questions (admin endpoint)
export const getAllUnanswered = async (req, res) => {
  try {
    const questions = getAllUnansweredQuestions();
    
    res.status(200).json({
      success: true,
      totalCount: questions.length,
      questions: questions
    });
    
  } catch (error) {
    console.error('Error in getAllUnanswered:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving unanswered questions'
    });
  }
};

// Clear all unanswered questions (admin endpoint)
export const clearAllUnanswered = async (req, res) => {
  try {
    const result = clearUnansweredQuestions();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'All unanswered questions have been cleared'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to clear unanswered questions'
      });
    }
    
  } catch (error) {
    console.error('Error in clearAllUnanswered:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while clearing unanswered questions'
    });
  }
};

// Create a new question with flexible format
export const createQuestion = async (req, res) => {
  try {
    const questionData = req.body;
    
    console.log('📝 Creating new question:', JSON.stringify(questionData, null, 2));
    
    // Create question with all fields (nulls are allowed)
    const newQuestion = new Question({
      pattern: questionData.pattern || 'STANDARD_MCQ',
      passageId: questionData.passageId,
      section: questionData.section,
      questionNumber: questionData.questionNumber,
      directions: questionData.directions,
      passage: questionData.passage,
      questionText: questionData.questionText,
      statements: questionData.statements,
      conclusions: questionData.conclusions,
      options: questionData.options || [],
      correctAnswers: questionData.CorrectAns || [],
      
      // Handle legacy mapping for backward compatibility
      question: questionData.questionText || questionData.question,
      description: questionData.directions || questionData.description
    });
    
    const savedQuestion = await newQuestion.save();
    
    console.log('✅ Question created successfully with ID:', savedQuestion._id);
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: {
        id: savedQuestion._id,
        pattern: savedQuestion.pattern,
        section: savedQuestion.section,
        questionNumber: savedQuestion.questionNumber,
        directions: savedQuestion.directions,
        questionText: savedQuestion.questionText,
        options: savedQuestion.options,
        correctAnswers: savedQuestion.correctAnswers,
        createdAt: savedQuestion.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error in createQuestion:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create question',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update a question's correct answer
export const updateQuestionAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { CorrectAns } = req.body;
    
    console.log(`🔄 Updating answer for question ID: ${questionId}`);
    
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }
    
    // Update correct answers
    question.correctAnswers = CorrectAns || [];
    
    const updatedQuestion = await question.save();
    
    console.log('✅ Question answer updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Question answer updated successfully',
      question: {
        id: updatedQuestion._id,
        correctAnswers: updatedQuestion.correctAnswers,
        updatedAt: updatedQuestion.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error in updateQuestionAnswer:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update question answer'
    });
  }
};

// Get recent unanswered questions (last N questions)
export const getRecentUnanswered = async (req, res) => {
  try {
    const { limit = 25 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 25, 1), 100); // Between 1-100
    
    const questions = getRecentUnansweredQuestions(parsedLimit);
    
    res.status(200).json({
      success: true,
      limit: parsedLimit,
      totalReturned: questions.length,
      questions: questions
    });
    
  } catch (error) {
    console.error('Error in getRecentUnanswered:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving recent unanswered questions'
    });
  }
};

// Get most searched unanswered questions
export const getMostSearchedUnanswered = async (req, res) => {
  try {
    const { limit = 25 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 25, 1), 100); // Between 1-100
    
    const questions = getMostSearchedQuestions(parsedLimit);
    
    res.status(200).json({
      success: true,
      limit: parsedLimit,
      totalReturned: questions.length,
      questions: questions
    });
    
  } catch (error) {
    console.error('Error in getMostSearchedUnanswered:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while retrieving most searched questions'
    });
  }
};
