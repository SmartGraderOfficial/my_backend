import { logUnansweredQuestion } from './utils/unansweredQuestions.js';

console.log('🧪 Testing DIRECTIONS field logging (corrected from description)...\n');

// Test case with directions field
const testQuestion = {
  directions: "DIRECTIONS TEST: Read the following passage carefully and answer the question",
  question: "What is the main theme of the passage?",
  questionImage: "",
  options: {
    A: "Love",
    B: "War", 
    C: "Peace",
    D: "Technology"
  }
};

console.log('📝 Test data with DIRECTIONS field:', JSON.stringify(testQuestion, null, 2));

// Log the question
const result = logUnansweredQuestion(testQuestion, 'directions-test-user', 'Directions Test Agent');

console.log('✅ Logging result:', result);
console.log('📁 Check the unanswered_questions.json file for the new entry with DIRECTIONS field');
