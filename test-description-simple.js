import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a test file specifically for description testing
const TEST_FILE = path.join(__dirname, 'data/test_unanswered_questions.json');

console.log('🧪 Creating a clean test for description field logging...\n');
console.log('📁 Test file:', TEST_FILE);

// Create empty test file
const testData = [];

// Test entry with description
const testEntry = {
  id: Date.now().toString(),
  timestamp: new Date().toISOString(),
  description: "TEST DESCRIPTION: This is a test description field",
  question: "Test question with description field?",
  questionImage: "",
  options: {
    A: "Option A",
    B: "Option B",
    C: "Option C", 
    D: "Option D"
  },
  searchedBy: {
    userId: "test-user",
    userAgent: "Test Agent"
  },
  searchCount: 1,
  lastSearched: new Date().toISOString()
};

testData.push(testEntry);

try {
  // Write the test file
  fs.writeFileSync(TEST_FILE, JSON.stringify(testData, null, 2), 'utf8');
  console.log('✅ Test file created successfully');
  
  // Read it back
  const readData = JSON.parse(fs.readFileSync(TEST_FILE, 'utf8'));
  console.log('\n🔍 Read back from file:');
  console.log(JSON.stringify(readData[0], null, 2));
  
  if (readData[0].description) {
    console.log('\n✅ SUCCESS: Description field is properly saved and read!');
    console.log('🎯 Description value:', readData[0].description);
  } else {
    console.log('\n❌ FAILED: Description field is missing!');
  }
  
  // Clean up
  fs.unlinkSync(TEST_FILE);
  console.log('\n🧹 Test file cleaned up');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
