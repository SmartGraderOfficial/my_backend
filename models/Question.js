import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  // New flexible schema matching the required format
  pattern: {
    type: String,
    trim: true,
    default: 'STANDARD_MCQ'
  },
  passageId: {
    type: String,
    trim: true,
    default: null
  },
  section: {
    type: String,
    trim: true,
    index: true
  },
  questionNumber: {
    type: Number,
    default: null
  },
  directions: {
    type: String,
    trim: true,
    index: true
  },
  passage: {
    type: String,
    trim: true,
    default: null
  },
  questionText: {
    type: String,
    trim: true,
    index: true
  },
  statements: {
    type: String,
    trim: true,
    default: null
  },
  conclusions: {
    type: String,
    trim: true,
    default: null
  },
  
  // Legacy fields for backward compatibility
  questionType: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1500, 'Description cannot exceed 1500 characters'],
    index: true
  },
  question: {
    type: String,
    trim: true,
    index: true
  },
  questionImage: {
    type: String,
    trim: true
  },
  OptionA: {
    type: String,
    trim: true
  },
  OptionAImage: {
    type: String,
    trim: true
  },
  OptionB: {
    type: String,
    trim: true
  },
  OptionBImage: {
    type: String,
    trim: true
  },
  OptionC: {
    type: String,
    trim: true
  },
  OptionCImage: {
    type: String,
    trim: true
  },
  OptionD: {
    type: String,
    trim: true
  },
  OptionDImage: {
    type: String,
    trim: true
  },
  
  // New flexible options structure
  options: [{
    text: {
      type: String,
      trim: true
    },
    images: {
      type: String,
      default: null
    }
  }],
  
  // Legacy correct answer (keeping for backward compatibility)
  CorrectAns: {
    type: String,
    trim: true,
  },
  
  // New flexible correct answer structure (can be empty initially)
  correctAnswers: [{
    text: {
      type: String,
      trim: true
    },
    images: {
      type: String,
      default: null
    }
  }],
  ansImage: {
    type: String,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  }
}, {
  timestamps: true,
  collection: 'questions'
});

// Compound index for optimized search on question and all options (both text and images)
questionSchema.index({ 
  directions: 1,
  question: 1, 
  questionText: 1,
  questionImage: 1,
  passage: 1,
  OptionA: 1, 
  OptionAImage: 1,
  OptionB: 1, 
  OptionBImage: 1,
  OptionC: 1, 
  OptionCImage: 1,
  OptionD: 1,
  OptionDImage: 1
});

// Additional indexes for performance
questionSchema.index({ section: 1, isActive: 1 });
questionSchema.index({ questionType: 1, isActive: 1 });
questionSchema.index({ difficulty: 1, isActive: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ pattern: 1, section: 1 });
questionSchema.index({ questionNumber: 1, section: 1 });

// Text index for full-text search capabilities (text fields only)
questionSchema.index({
  directions: 'text',
  question: 'text',
  questionText: 'text',
  passage: 'text',
  statements: 'text',
  conclusions: 'text',
  OptionA: 'text',
  OptionB: 'text',
  OptionC: 'text',
  OptionD: 'text',
  CorrectAns: 'text'
});

// Static method to find question by exact match (supports both text and images)
questionSchema.statics.findExactMatch = async function(questionData) {
  const { 
    directions,
    question, questionImage,
    OptionA, OptionAImage,
    OptionB, OptionBImage, 
    OptionC, OptionCImage,
    OptionD, OptionDImage 
  } = questionData;
  
  const query = {};
  
  // Directions matching
  if (directions && directions.trim()) {
    query.directions = directions.trim();
  }
  
  // Question matching - match both text and image if both provided
  if (question && question.trim()) {
    query.question = question.trim();
  }
  if (questionImage && questionImage.trim()) {
    query.questionImage = questionImage.trim();
  }
  
  // If neither directions, question text nor image provided, return null
  if (!query.directions && !query.question && !query.questionImage) {
    console.log("No directions, question text or image provided for search");
    return null;
  }
  
  // Option A matching - match both text and image if both provided
  if (OptionA !== undefined || OptionAImage !== undefined) {
    if (OptionA && OptionA.trim()) {
      query.OptionA = OptionA.trim();
    }
    if (OptionAImage && OptionAImage.trim()) {
      query.OptionAImage = OptionAImage.trim();
    }
  }
  
  // Option B matching - match both text and image if both provided
  if (OptionB !== undefined || OptionBImage !== undefined) {
    if (OptionB && OptionB.trim()) {
      query.OptionB = OptionB.trim();
    }
    if (OptionBImage && OptionBImage.trim()) {
      query.OptionBImage = OptionBImage.trim();
    }
  }
  
  // Option C matching - match both text and image if both provided
  if (OptionC !== undefined || OptionCImage !== undefined) {
    if (OptionC && OptionC.trim()) {
      query.OptionC = OptionC.trim();
    }
    if (OptionCImage && OptionCImage.trim()) {
      query.OptionCImage = OptionCImage.trim();
    }
  }
  
  // Option D matching - match both text and image if both provided
  if (OptionD !== undefined || OptionDImage !== undefined) {
    if (OptionD && OptionD.trim()) {
      query.OptionD = OptionD.trim();
    }
    if (OptionDImage && OptionDImage.trim()) {
      query.OptionDImage = OptionDImage.trim();
    }
  }
  
  console.log("Enhanced query with comprehensive text+image support: ", query);
  
  return await this.findOne(query);
};

// Method to get correct option key (supports both text and images)
questionSchema.methods.getCorrectOptionKey = function() {
  const options = ['OptionA', 'OptionB', 'OptionC', 'OptionD'];
  
  // First check if CorrectAns matches any text option
  if (this.CorrectAns && this.CorrectAns.trim()) {
    for (const optionKey of options) {
      if (this[optionKey] && this[optionKey].trim() === this.CorrectAns.trim()) {
        return optionKey;
      }
    }
  }
  
  // If ansImage exists, check if it matches any option image
  if (this.ansImage && this.ansImage.trim()) {
    for (const optionKey of options) {
      const imageKey = `${optionKey}Image`;
      if (this[imageKey] && this[imageKey].trim() === this.ansImage.trim()) {
        return optionKey;
      }
    }
  }
  
  return null;
};

// Method to validate that correct answer matches one of the options
questionSchema.methods.validateCorrectAnswer = function() {
  // Handle new flexible structure - allow questions without correct answers initially
  if (this.correctAnswers && this.correctAnswers.length > 0) {
    // For new structure with correctAnswers array
    if (this.options && this.options.length > 0) {
      // Check if any correctAnswer matches any option
      return this.correctAnswers.some(correctAns => 
        this.options.some(option => 
          (option.text && correctAns.text && option.text.trim() === correctAns.text.trim()) ||
          (option.images && correctAns.images && option.images.trim() === correctAns.images.trim())
        )
      );
    }
  }
  
  // Handle legacy structure
  if (this.CorrectAns && this.CorrectAns.trim()) {
    const correctKey = this.getCorrectOptionKey();
    return correctKey !== null;
  }
  
  // Allow questions without correct answers (can be updated later)
  return true;
};

// Static method for flexible search (handles mixed text+image content)
questionSchema.statics.findFlexibleMatch = async function(searchData) {
  // First try exact match (handles both text and images together)
  let result = await this.findExactMatch(searchData);
  if (result) return result;
  
  const { directions, question, questionImage } = searchData;
  
  // Strategy 1: Try text-only search if directions or question text is available
  if (directions && directions.trim()) {
    result = await this.findOne({
      $text: { $search: directions.trim() }
    });
    if (result) return result;
    
    // Try partial text match on directions field
    result = await this.findOne({
      directions: { $regex: new RegExp(directions.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
    });
    if (result) return result;
  }
  
  if (question && question.trim()) {
    result = await this.findOne({
      $text: { $search: question.trim() }
    });
    if (result) return result;
    
    // Try partial text match on question field
    result = await this.findOne({
      question: { $regex: new RegExp(question.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
    });
    if (result) return result;
  }
  
  // Strategy 2: Try image-only search if question image is available
  if (questionImage && questionImage.trim()) {
    result = await this.findOne({
      questionImage: questionImage.trim()
    });
    if (result) return result;
  }
  
  // Strategy 3: Try mixed approach - match any field that contains the text
  const searchTerms = [];
  if (directions && directions.trim()) searchTerms.push(directions.trim());
  if (question && question.trim()) searchTerms.push(question.trim());
  
  for (const searchTerm of searchTerms) {
    result = await this.findOne({
      $or: [
        { directions: { $regex: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        { question: { $regex: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        { OptionA: { $regex: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        { OptionB: { $regex: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        { OptionC: { $regex: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        { OptionD: { $regex: new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
      ]
    });
    if (result) return result;
  }
  
  return null;
};

// Find similar questions for suggestions
questionSchema.statics.findSimilarQuestions = async function(question, questionImage, directions, limit = 5) {
  try {
    const searchQueries = [];
    
    // Build search queries based on available data
    if (question && question.trim()) {
      // Extract key words from the question (remove common words)
      const keywords = question
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 3 && 
          !['what', 'which', 'where', 'when', 'how', 'why', 'the', 'and', 'for', 'are', 'with', 'this', 'that', 'from', 'they', 'have', 'been', 'their', 'would', 'there', 'could', 'should'].includes(word)
        )
        .slice(0, 5); // Take top 5 keywords
      
      if (keywords.length > 0) {
        searchQueries.push({
          $or: keywords.map(keyword => ({
            question: { $regex: new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
          }))
        });
      }
    }
    
    if (directions && directions.trim()) {
      const directionKeywords = directions
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3);
      
      if (directionKeywords.length > 0) {
        searchQueries.push({
          $or: directionKeywords.map(keyword => ({
            directions: { $regex: new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
          }))
        });
      }
    }
    
    if (questionImage && questionImage.trim()) {
      searchQueries.push({
        questionImage: { $exists: true, $ne: '', $ne: null }
      });
    }
    
    // If no search queries built, return empty array
    if (searchQueries.length === 0) {
      return [];
    }
    
    // Execute search with aggregation to add similarity score
    const results = await this.aggregate([
      {
        $match: {
          $or: searchQueries
        }
      },
      {
        $addFields: {
          similarity: 'medium' // Basic similarity indicator
        }
      },
      {
        $limit: limit
      }
    ]);
    
    return results;
    
  } catch (error) {
    console.error('Error in findSimilarQuestions:', error);
    return [];
  }
};

// Pre-save validation
questionSchema.pre('save', function(next) {
  // Handle new flexible structure - allow more nullable fields
  const hasQuestionContent = 
    this.questionText?.trim() || 
    this.question?.trim() || 
    this.questionImage?.trim() ||
    this.passage?.trim() ||
    this.statements?.trim();
    
  if (!hasQuestionContent) {
    return next(new Error('At least one question content field (questionText, question, questionImage, passage, or statements) must be provided'));
  }
  
  // For legacy structure, ensure correct answer is provided if it exists
  if (this.CorrectAns?.trim() && !this.ansImage?.trim()) {
    // Only validate if we have legacy options
    const hasLegacyOptions = this.OptionA?.trim() || this.OptionB?.trim() || this.OptionC?.trim() || this.OptionD?.trim();
    if (hasLegacyOptions && !this.validateCorrectAnswer()) {
      return next(new Error('Correct answer must match one of the provided options (either text or image)'));
    }
  }
  
  // For new structure, validation is optional (can be updated later)
  if (this.correctAnswers && this.correctAnswers.length > 0 && this.options && this.options.length > 0) {
    if (!this.validateCorrectAnswer()) {
      return next(new Error('Correct answers must match the provided options'));
    }
  }
  
  next();
});

export default mongoose.model('Question', questionSchema);
