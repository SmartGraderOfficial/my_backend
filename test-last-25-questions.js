import { 
  getRecentUnansweredQuestions, 
  getMostSearchedQuestions,
  getUnansweredStats 
} from './utils/unansweredQuestions.js';

console.log('🔍 Last 25 Questions Test\n');

// Get the last 25 questions
console.log('📋 Getting Last 25 Searched Questions...');
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
    console.log(`   📝 Instructions: "${question.directions}"`);
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
  
  console.log('   ' + '-'.repeat(70));
});

// Additional statistics
console.log('\n📊 SUMMARY STATISTICS');
console.log('='.repeat(50));

const stats = getUnansweredStats();
if (stats) {
  console.log(`📈 Total Unanswered Questions: ${stats.totalUnanswered}`);
  console.log(`🔍 Total Searches Performed: ${stats.totalSearches}`);
  console.log(`📅 Showing Most Recent: ${last25Questions.length} questions`);
}

// Show most searched questions for comparison
console.log('\n🔥 TOP 10 MOST SEARCHED QUESTIONS');
console.log('='.repeat(50));

const mostSearched = getMostSearchedQuestions(10);
mostSearched.forEach((question, index) => {
  const questionText = question.question 
    ? (question.question.length > 60 ? question.question.substring(0, 60) + '...' : question.question)
    : 'No question text';
    
  console.log(`${index + 1}. [${question.searchCount}x] ${questionText}`);
  console.log(`   📅 Last: ${new Date(question.lastSearched).toLocaleString()}`);
});

console.log('\n✅ Test completed! You now have access to the last 25 searched questions.');
console.log('💡 Use getRecentUnansweredQuestions(25) in your code to get recent questions.');
console.log('📁 Full data available in: data/unanswered_questions.json');
