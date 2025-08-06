import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store unanswered questions
const UNANSWERED_QUESTIONS_FILE = path.join(__dirname, '../data/unanswered_questions.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(UNANSWERED_QUESTIONS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load existing unanswered questions
const loadUnansweredQuestions = () => {
  try {
    if (fs.existsSync(UNANSWERED_QUESTIONS_FILE)) {
      const data = fs.readFileSync(UNANSWERED_QUESTIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading unanswered questions:', error);
    return [];
  }
};

// Save unanswered questions to file
const saveUnansweredQuestions = (questions) => {
  try {
    console.log('🔍 DEBUG: Saving to file:', UNANSWERED_QUESTIONS_FILE);
    console.log('🔍 DEBUG: Number of questions to save:', questions.length);
    ensureDataDirectory();
    fs.writeFileSync(UNANSWERED_QUESTIONS_FILE, JSON.stringify(questions, null, 2), 'utf8');
    console.log('✅ DEBUG: File saved successfully');
  } catch (error) {
    console.error('❌ DEBUG: Error saving unanswered questions:', error);
  }
};

// Add a new unanswered question
export const logUnansweredQuestion = (questionData, userId = null, userAgent = null) => {
  try {
    console.log('🔍 DEBUG: logUnansweredQuestion called with:', {
      questionData,
      userId,
      userAgent
    });
    
    const existingQuestions = loadUnansweredQuestions();
    
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      directions: questionData.directions,
      question: questionData.question,
      questionImage: questionData.questionImage,
      options: questionData.options,
      searchedBy: {
        userId: userId,
        userAgent: userAgent
      },
      searchCount: 1,
      lastSearched: new Date().toISOString()
    };

    console.log('🔍 DEBUG: Created newEntry:', JSON.stringify(newEntry, null, 2));

    // Check if this exact question already exists (including directions and questionImage)
    const existingIndex = existingQuestions.findIndex(q => 
      (q.directions || '') === (questionData.directions || '') &&
      (q.question || '') === (questionData.question || '') &&
      (q.questionImage || '') === (questionData.questionImage || '') &&
      JSON.stringify(q.options) === JSON.stringify(questionData.options)
    );

    console.log('🔍 DEBUG: Existing question search result:', existingIndex);

    if (existingIndex !== -1) {
      // Update existing entry and ensure directions field is preserved/added
      existingQuestions[existingIndex].searchCount += 1;
      existingQuestions[existingIndex].lastSearched = new Date().toISOString();
      
      // Preserve or add directions field
      if (questionData.directions && questionData.directions.trim()) {
        existingQuestions[existingIndex].directions = questionData.directions;
      }
      
      // Preserve or add questionImage field  
      if (questionData.questionImage && questionData.questionImage.trim()) {
        existingQuestions[existingIndex].questionImage = questionData.questionImage;
      }
      
      // Add user info if not already present
      if (userId && !existingQuestions[existingIndex].searchedBy.userId) {
        existingQuestions[existingIndex].searchedBy.userId = userId;
      }
      
      console.log(`📝 Updated unanswered question count: ${existingQuestions[existingIndex].searchCount}`);
      console.log(`🔍 DEBUG: Updated entry now has directions: ${!!existingQuestions[existingIndex].directions}`);
    } else {
      // Add new entry
      existingQuestions.push(newEntry);
      console.log(`📝 Logged new unanswered question: "${questionData.question.substring(0, 50)}..."`);
    }

    // Sort by search count (most searched first) and then by timestamp
    existingQuestions.sort((a, b) => {
      if (a.searchCount !== b.searchCount) {
        return b.searchCount - a.searchCount;
      }
      return new Date(b.lastSearched) - new Date(a.lastSearched);
    });

    saveUnansweredQuestions(existingQuestions);
    
    return {
      success: true,
      totalUnanswered: existingQuestions.length,
      currentEntry: existingIndex !== -1 ? existingQuestions[existingIndex] : newEntry
    };
    
  } catch (error) {
    console.error('Error logging unanswered question:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get statistics about unanswered questions
export const getUnansweredStats = () => {
  try {
    const questions = loadUnansweredQuestions();
    
    const stats = {
      totalUnanswered: questions.length,
      mostSearched: questions.slice(0, 5), // Top 5 most searched
      recentlyAdded: questions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5), // 5 most recent
      totalSearches: questions.reduce((sum, q) => sum + q.searchCount, 0)
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting unanswered stats:', error);
    return null;
  }
};

// Export all unanswered questions (for admin use)
export const getAllUnansweredQuestions = () => {
  return loadUnansweredQuestions();
};

// Get recent unanswered questions (last N questions)
export const getRecentUnansweredQuestions = (limit = 25) => {
  try {
    const questions = loadUnansweredQuestions();
    
    // Sort by lastSearched timestamp (most recent first) and return limited results
    return questions
      .sort((a, b) => new Date(b.lastSearched) - new Date(a.lastSearched))
      .slice(0, limit)
      .map(q => ({
        id: q.id,
        timestamp: q.timestamp,
        lastSearched: q.lastSearched,
        searchCount: q.searchCount,
        directions: q.directions || q.description, // Support both field names
        question: q.question,
        questionImage: q.questionImage,
        options: q.options,
        searchedBy: q.searchedBy
      }));
  } catch (error) {
    console.error('Error getting recent unanswered questions:', error);
    return [];
  }
};

// Get most searched unanswered questions
export const getMostSearchedQuestions = (limit = 25) => {
  try {
    const questions = loadUnansweredQuestions();
    
    // Sort by search count (highest first) and return limited results
    return questions
      .sort((a, b) => {
        if (a.searchCount !== b.searchCount) {
          return b.searchCount - a.searchCount;
        }
        return new Date(b.lastSearched) - new Date(a.lastSearched);
      })
      .slice(0, limit)
      .map(q => ({
        id: q.id,
        timestamp: q.timestamp,
        lastSearched: q.lastSearched,
        searchCount: q.searchCount,
        directions: q.directions || q.description, // Support both field names
        question: q.question,
        questionImage: q.questionImage,
        options: q.options,
        searchedBy: q.searchedBy
      }));
  } catch (error) {
    console.error('Error getting most searched questions:', error);
    return [];
  }
};

// Clear all unanswered questions (for admin use)
export const clearUnansweredQuestions = () => {
  try {
    ensureDataDirectory();
    saveUnansweredQuestions([]);
    console.log('🗑️ Cleared all unanswered questions');
    return { success: true };
  } catch (error) {
    console.error('Error clearing unanswered questions:', error);
    return { success: false, error: error.message };
  }
};
