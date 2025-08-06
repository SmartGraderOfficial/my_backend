import { logUnansweredQuestion } from './utils/unansweredQuestions.js';

// Test the unanswered question logging with description field
console.log('🧪 Testing unanswered question logging with description field...\n');

// Test case 1: Question with description only
const testQuestion1 = {
  description: "Chemistry question about molecular formulas and bonding",
  question: "",
  questionImage: "",
  options: {
    A: "Water",
    B: "Hydrogen",
    C: "Oxygen", 
    D: "Carbon dioxide"
  }
};

console.log('📝 Test 1: Logging question with description only');
const result1 = logUnansweredQuestion(testQuestion1, 'test-user-1', 'Test Browser');
console.log(`✅ Result: ${result1.totalUnanswered} total unanswered questions\n`);

// Test case 2: Question with description + question text
const testQuestion2 = {
  description: "Mathematics algebra problem involving quadratic equations",
  question: "Solve for x: x² + 5x + 6 = 0",
  questionImage: "",
  options: {
    A: "x = -2, -3",
    B: "x = 2, 3", 
    C: "x = -1, -6",
    D: "No solution"
  }
};

console.log('📝 Test 2: Logging question with description + question text');
const result2 = logUnansweredQuestion(testQuestion2, 'test-user-2', 'Test Browser');
console.log(`✅ Result: ${result2.totalUnanswered} total unanswered questions\n`);

// Test case 3: Question with description + question image
const testQuestion3 = {
  description: "Biology diagram showing cell structure and organelles",
  question: "What organelle is highlighted in red?",
  questionImage: "https://example.com/cell-diagram.png",
  options: {
    A: "Nucleus",
    AImage: "https://example.com/nucleus.png",
    B: "Mitochondria",
    BImage: "https://example.com/mitochondria.png",
    C: "Ribosome",
    D: "Endoplasmic Reticulum"
  }
};

console.log('📝 Test 3: Logging question with description + mixed content');
const result3 = logUnansweredQuestion(testQuestion3, 'test-user-3', 'Test Browser');
console.log(`✅ Result: ${result3.totalUnanswered} total unanswered questions\n`);

console.log('🎉 All tests completed! Check the unanswered_questions.json file to see the logged data with descriptions.');
console.log('📁 File location: server/data/unanswered_questions.json');
