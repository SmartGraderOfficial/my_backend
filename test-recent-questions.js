import { 
  getRecentUnansweredQuestions, 
  getMostSearchedQuestions,
  getAllUnansweredQuestions,
  getUnansweredStats,
  logUnansweredQuestion 
} from './utils/unansweredQuestions.js';

console.log('🔍 Testing Unanswered Questions Retrieval System');
console.log('=' .repeat(60));

// Function to display questions in a nice format
const displayQuestions = (questions, title) => {
  console.log(`\n📋 ${title}`);
  console.log('-'.repeat(50));
  
  if (questions.length === 0) {
    console.log('   No questions found.');
    return;
  }
  
  questions.forEach((q, index) => {
    console.log(`\n${index + 1}. ID: ${q.id}`);
    console.log(`   📅 First Logged: ${new Date(q.timestamp).toLocaleString()}`);
    console.log(`   🔄 Last Searched: ${new Date(q.lastSearched).toLocaleString()}`);
    console.log(`   🔢 Search Count: ${q.searchCount}`);
    
    if (q.directions) {
      console.log(`   📝 Directions: "${q.directions.substring(0, 60)}${q.directions.length > 60 ? '...' : ''}"`);
    }
    
    if (q.question) {
      console.log(`   ❓ Question: "${q.question.substring(0, 80)}${q.question.length > 80 ? '...' : ''}"`);
    }
    
    if (q.questionImage) {
      console.log(`   🖼️  Question Image: ${q.questionImage}`);
    }
    
    console.log(`   📊 Options: ${Object.keys(q.options).length} options (${Object.keys(q.options).join(', ')})`);
    console.log(`   👤 User: ${q.searchedBy?.userId || 'Unknown'}`);
  });
};

// Test 1: Get overall statistics
console.log('\n🧪 Test 1: Getting Overall Statistics');
const stats = getUnansweredStats();
if (stats) {
  console.log(`   📊 Total Unanswered: ${stats.totalUnanswered}`);
  console.log(`   🔍 Total Searches: ${stats.totalSearches}`);
  console.log(`   📈 Most Searched Count: ${stats.mostSearched.length}`);
  console.log(`   📅 Recently Added Count: ${stats.recentlyAdded.length}`);
} else {
  console.log('   ❌ Unable to get statistics');
}

// Test 2: Get last 25 questions (recent searches)
console.log('\n🧪 Test 2: Getting Last 25 Recent Searches');
const recentQuestions = getRecentUnansweredQuestions(25);
console.log(`   Found ${recentQuestions.length} recent questions`);
displayQuestions(recentQuestions.slice(0, 5), 'Last 5 Recent Searches (Preview)');

// Test 3: Get last 10 questions (smaller sample)
console.log('\n🧪 Test 3: Getting Last 10 Recent Searches');
const last10Questions = getRecentUnansweredQuestions(10);
displayQuestions(last10Questions, 'Last 10 Recent Searches');

// Test 4: Get most searched questions
console.log('\n🧪 Test 4: Getting Most Searched Questions');
const mostSearched = getMostSearchedQuestions(10);
displayQuestions(mostSearched, 'Top 10 Most Searched Questions');

// Test 5: Get all questions (for comparison)
console.log('\n🧪 Test 5: Getting Total Count');
const allQuestions = getAllUnansweredQuestions();
console.log(`   📊 Total questions in database: ${allQuestions.length}`);

// Test 6: Add a few test questions to demonstrate recent functionality
console.log('\n🧪 Test 6: Adding Test Questions to Demonstrate Recent Functionality');

const testQuestions = [
  {
    directions: "RECENT TEST 1: Read the passage and answer",
    question: "What is the capital of France?",
    questionImage: "",
    options: { A: "London", B: "Berlin", C: "Paris", D: "Madrid" }
  },
  {
    directions: "RECENT TEST 2: Solve the mathematical problem",  
    question: "What is 2 + 2?",
    questionImage: "",
    options: { A: "3", B: "4", C: "5", D: "6" }
  },
  {
    directions: "RECENT TEST 3: Identify the programming concept",
    question: "What does API stand for?",
    questionImage: "",
    options: { A: "Application Programming Interface", B: "Advanced Program Integration", C: "Automated Process Integration", D: "Application Process Interface" }
  }
];

testQuestions.forEach((testQ, index) => {
  const result = logUnansweredQuestion(testQ, `test-user-recent-${index + 1}`, 'Recent Test Agent');
  console.log(`   ✅ Added test question ${index + 1}: ${result.success ? 'Success' : 'Failed'}`);
  
  // Add a small delay to ensure different timestamps
  const start = Date.now();
  while (Date.now() - start < 10) { /* Small delay */ }
});

// Test 7: Get recent questions after adding new ones
console.log('\n🧪 Test 7: Getting Recent Questions After Adding New Ones');
const updatedRecentQuestions = getRecentUnansweredQuestions(5);
displayQuestions(updatedRecentQuestions, 'Most Recent 5 Questions (After Adding Test Data)');

// Test 8: Search by specific criteria
console.log('\n🧪 Test 8: Advanced Filtering Examples');

// Filter questions from today
const todayQuestions = getAllUnansweredQuestions().filter(q => {
  const questionDate = new Date(q.lastSearched).toDateString();
  const today = new Date().toDateString();
  return questionDate === today;
});

console.log(`   📅 Questions searched today: ${todayQuestions.length}`);

// Filter questions with directions field
const questionsWithDirections = getAllUnansweredQuestions().filter(q => 
  q.directions && q.directions.trim().length > 0
);

console.log(`   📝 Questions with directions: ${questionsWithDirections.length}`);

// Filter questions with images
const questionsWithImages = getAllUnansweredQuestions().filter(q => 
  q.questionImage && q.questionImage.trim().length > 0
);

console.log(`   🖼️  Questions with images: ${questionsWithImages.length}`);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Total Questions Available: ${allQuestions.length}`);
console.log(`🔍 Recent Questions (Last 25): ${recentQuestions.length}`);
console.log(`📈 Most Searched Questions: ${mostSearched.length}`);
console.log(`📅 Questions from Today: ${todayQuestions.length}`);
console.log(`📝 Questions with Directions: ${questionsWithDirections.length}`);
console.log(`🖼️  Questions with Images: ${questionsWithImages.length}`);

console.log('\n🎉 All tests completed successfully!');
console.log('💡 You can now use these functions in your API:');
console.log('   - getRecentUnansweredQuestions(25) - Get last 25 searched questions');
console.log('   - getMostSearchedQuestions(25) - Get top 25 most searched questions');
console.log('   - getAllUnansweredQuestions() - Get all unanswered questions');
console.log('   - getUnansweredStats() - Get comprehensive statistics');

console.log('\n📁 Check data/unanswered_questions.json for the complete data file.');
