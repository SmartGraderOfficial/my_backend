// Simple test to verify description field logging without external dependencies
import { logUnansweredQuestion } from './utils/unansweredQuestions.js';

console.log('🧪 Testing description field logging directly...\n');

// Test data with description
const testData = {
  description: "DIRECT TEST: Chemistry molecular bonding question",
  question: "What is the chemical formula for water?",
  questionImage: "",
  options: {
    A: "H2O",
    B: "CO2", 
    C: "O2",
    D: "H2SO4"
  }
};

console.log('📝 Input data:', JSON.stringify(testData, null, 2));

// Log the question
const result = logUnansweredQuestion(testData, 'direct-test-user', 'Direct Test Agent');

console.log('✅ Logging result:', result);
console.log('📁 Check the unanswered_questions.json file for the new entry with description field');

// Now let's check if it was actually saved
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'data/unanswered_questions.json');

setTimeout(() => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(data);
    const lastQuestion = questions[questions.length - 1];
    
    console.log('\n🔍 Last entry in file:');
    console.log(JSON.stringify(lastQuestion, null, 2));
    
    if (lastQuestion.description) {
      console.log('✅ SUCCESS: Description field is being saved!');
    } else {
      console.log('❌ PROBLEM: Description field is missing!');
    }
  } catch (error) {
    console.error('❌ Error reading file:', error.message);
  }
}, 100);
