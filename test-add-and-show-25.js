import { 
  getRecentUnansweredQuestions, 
  logUnansweredQuestion,
  getUnansweredStats 
} from './utils/unansweredQuestions.js';

console.log('🧪 Testing Last 25 Questions + Adding New Data\n');

// First, show current statistics
console.log('📊 Current Statistics:');
const initialStats = getUnansweredStats();
if (initialStats) {
  console.log(`   Total Questions: ${initialStats.totalUnanswered}`);
  console.log(`   Total Searches: ${initialStats.totalSearches}`);
} else {
  console.log('   No existing data found');
}

// Add some new test questions to ensure we have data
console.log('\n🔄 Adding New Test Questions...');

const newTestQuestions = [
  {
    directions: "NEW TEST 1: Basic Mathematics",
    question: "What is 5 + 3?",
    questionImage: "",
    options: {
      A: "6",
      B: "7", 
      C: "8",
      D: "9"
    }
  },
  {
    directions: "NEW TEST 2: Geography Knowledge",
    question: "What is the largest continent?",
    questionImage: "",
    options: {
      A: "Africa",
      B: "Asia",
      C: "North America", 
      D: "Europe"
    }
  },
  {
    directions: "NEW TEST 3: Science Question",
    question: "What gas do plants absorb from the atmosphere?",
    questionImage: "",
    options: {
      A: "Oxygen",
      B: "Nitrogen",
      C: "Carbon Dioxide",
      D: "Hydrogen"
    }
  },
  {
    directions: "NEW TEST 4: Programming Concept",
    question: "What does HTML stand for?",
    questionImage: "",
    options: {
      A: "Hyper Text Markup Language",
      B: "High Tech Modern Language",
      C: "Home Tool Markup Language",
      D: "Hyperlink and Text Markup Language"
    }
  },
  {
    directions: "NEW TEST 5: History Question",
    question: "In which year did World War II end?",
    questionImage: "",
    options: {
      A: "1944",
      B: "1945",
      C: "1946", 
      D: "1947"
    }
  }
];

// Add each test question
newTestQuestions.forEach((testQuestion, index) => {
  const result = logUnansweredQuestion(
    testQuestion, 
    `new-test-user-${index + 1}`, 
    'New Test Agent'
  );
  
  console.log(`   ✅ Added Question ${index + 1}: ${result.success ? 'Success' : 'Failed'}`);
  
  // Small delay to ensure different timestamps
  const start = Date.now();
  while (Date.now() - start < 50) { /* Small delay */ }
});

// Show updated statistics
console.log('\n📊 Updated Statistics:');
const updatedStats = getUnansweredStats();
if (updatedStats) {
  console.log(`   Total Questions: ${updatedStats.totalUnanswered}`);
  console.log(`   Total Searches: ${updatedStats.totalSearches}`);
  console.log(`   Increase: +${updatedStats.totalUnanswered - (initialStats?.totalUnanswered || 0)} questions`);
}

// Now get the last 25 questions
console.log('\n📋 Last 25 Searched Questions:');
const last25Questions = getRecentUnansweredQuestions(25);

console.log(`\n✅ Found ${last25Questions.length} recent questions`);
console.log('=' .repeat(80));

// Display each question with details
last25Questions.forEach((question, index) => {
  console.log(`\n${index + 1}. Question ID: ${question.id}`);
  console.log(`   📅 Last Searched: ${new Date(question.lastSearched).toLocaleString()}`);
  console.log(`   🔢 Search Count: ${question.searchCount}`);
  
  // Show directions if available
  if (question.directions) {
    const directions = question.directions.length > 80 
      ? question.directions.substring(0, 80) + '...' 
      : question.directions;
    console.log(`   📝 Instructions: "${directions}"`);
  }
  
  // Show question text
  if (question.question) {
    const questionText = question.question.length > 100 
      ? question.question.substring(0, 100) + '...' 
      : question.question;
    console.log(`   ❓ Question: "${questionText}"`);
  }
  
  // Show if there's an image
  if (question.questionImage) {
    console.log(`   🖼️  Has Image: Yes`);
  }
  
  // Show options count
  const optionKeys = Object.keys(question.options);
  console.log(`   📊 Options: ${optionKeys.length} choices (${optionKeys.join(', ')})`);
  
  // Show user info
  console.log(`   👤 Searched by: ${question.searchedBy?.userId || 'Unknown User'}`);
  
  if (index < last25Questions.length - 1) {
    console.log('   ' + '-'.repeat(70));
  }
});

// File verification
console.log('\n🔍 File Verification:');
try {
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, 'data/unanswered_questions.json');
  
  const stats = fs.statSync(filePath);
  console.log(`   📄 File Size: ${stats.size} bytes`);
  console.log(`   📅 Last Modified: ${stats.mtime.toLocaleString()}`);
  console.log(`   📍 File Path: ${filePath}`);
  
  // Count lines in file
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  console.log(`   📏 File Lines: ${lines}`);
  
  // Try to parse as JSON
  try {
    const jsonData = JSON.parse(content);
    console.log(`   ✅ Valid JSON with ${jsonData.length} entries`);
  } catch (parseError) {
    console.log(`   ❌ JSON Parse Error: ${parseError.message}`);
  }
  
} catch (error) {
  console.log(`   ❌ File Error: ${error.message}`);
}

console.log('\n🎉 Test completed successfully!');
console.log('💾 Data has been written to: data/unanswered_questions.json');
console.log('🔄 Try refreshing VS Code or reopening the file to see the updated content.');
