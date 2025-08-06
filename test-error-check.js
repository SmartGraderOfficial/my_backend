import { logUnansweredQuestion } from './utils/unansweredQuestions.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 DEBUG: Testing file operations and error checking...\n');

// Test file path
const testFilePath = path.join(__dirname, 'data/unanswered_questions.json');
console.log('📁 File path:', testFilePath);

// Check if file exists and is readable
try {
  const stats = fs.statSync(testFilePath);
  console.log('📊 File stats:');
  console.log('  - Size:', stats.size, 'bytes');
  console.log('  - Modified:', stats.mtime);
  console.log('  - Readable:', fs.constants.R_OK);
  console.log('  - Writable:', fs.constants.W_OK);
  
  // Test file permissions
  fs.accessSync(testFilePath, fs.constants.R_OK | fs.constants.W_OK);
  console.log('✅ File is readable and writable');
  
} catch (error) {
  console.error('❌ File access error:', error.message);
}

// Test loading current content
try {
  const currentContent = fs.readFileSync(testFilePath, 'utf8');
  const questions = JSON.parse(currentContent);
  console.log('📋 Current questions count:', questions.length);
  
  if (questions.length > 0) {
    console.log('🔍 Last question structure:');
    const lastQuestion = questions[questions.length - 1];
    console.log('  - Has directions:', !!lastQuestion.directions);
    console.log('  - Has question:', !!lastQuestion.question);
    console.log('  - Has options:', !!lastQuestion.options);
    console.log('  - Search count:', lastQuestion.searchCount);
  }
  
} catch (error) {
  console.error('❌ Content reading error:', error.message);
}

// Test the logging function with error checking
const testData = {
  directions: "ERROR CHECK: Testing file operations and persistence",
  question: "Is this test working correctly?",
  questionImage: "",
  options: {
    A: "Yes, perfectly",
    B: "No, there are issues",
    C: "Partially working",
    D: "Need more testing"
  }
};

console.log('\n🧪 Testing logUnansweredQuestion function...');
try {
  const result = logUnansweredQuestion(testData, 'error-check-user', 'Error Check Agent');
  console.log('✅ Function result:', result);
  
  // Verify the entry was actually written
  setTimeout(() => {
    try {
      const updatedContent = fs.readFileSync(testFilePath, 'utf8');
      const updatedQuestions = JSON.parse(updatedContent);
      
      // Look for our test entry
      const testEntry = updatedQuestions.find(q => 
        q.searchedBy?.userId === 'error-check-user' && 
        q.directions?.includes('ERROR CHECK')
      );
      
      if (testEntry) {
        console.log('✅ SUCCESS: Test entry found in file!');
        console.log('🎯 Entry details:');
        console.log('  - ID:', testEntry.id);
        console.log('  - Directions:', testEntry.directions);
        console.log('  - Question:', testEntry.question);
        console.log('  - Search count:', testEntry.searchCount);
      } else {
        console.log('❌ PROBLEM: Test entry NOT found in file!');
        console.log('📊 Total questions in file:', updatedQuestions.length);
        
        // Show last few entries for debugging
        console.log('🔍 Last 3 entries:');
        updatedQuestions.slice(-3).forEach((q, i) => {
          console.log(`  ${i + 1}. User: ${q.searchedBy?.userId}, Directions: ${q.directions?.substring(0, 50)}...`);
        });
      }
      
    } catch (verifyError) {
      console.error('❌ Verification error:', verifyError.message);
    }
  }, 100);
  
} catch (error) {
  console.error('❌ Logging function error:', error.message);
  console.error('📜 Stack trace:', error.stack);
}
