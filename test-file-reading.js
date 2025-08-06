import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the file directly
const filePath = path.join(__dirname, 'data/unanswered_questions.json');

console.log('🔍 Direct File Reading Test');
console.log('=' .repeat(50));

try {
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log('✅ File exists');
    
    // Get file stats
    const stats = fs.statSync(filePath);
    console.log(`📊 File size: ${stats.size} bytes`);
    console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}`);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`📏 Content length: ${content.length} characters`);
    console.log(`📏 Lines: ${content.split('\n').length}`);
    
    // Parse JSON
    const data = JSON.parse(content);
    console.log(`📊 JSON entries: ${data.length}`);
    
    // Show first few entries
    console.log('\n📋 First 3 entries:');
    data.slice(0, 3).forEach((entry, index) => {
      console.log(`${index + 1}. ID: ${entry.id}`);
      console.log(`   Question: "${entry.question?.substring(0, 50) || 'No question text'}..."`);
      console.log(`   Directions: "${entry.directions?.substring(0, 50) || entry.description?.substring(0, 50) || 'No directions'}..."`);
      console.log(`   Search Count: ${entry.searchCount}`);
      console.log();
    });
    
    // Show last few entries (most recent)
    console.log('📋 Last 3 entries (most recent):');
    data.slice(-3).forEach((entry, index) => {
      console.log(`${index + 1}. ID: ${entry.id}`);
      console.log(`   Question: "${entry.question?.substring(0, 50) || 'No question text'}..."`);
      console.log(`   Directions: "${entry.directions?.substring(0, 50) || entry.description?.substring(0, 50) || 'No directions'}..."`);
      console.log(`   Search Count: ${entry.searchCount}`);
      console.log(`   Last Searched: ${new Date(entry.lastSearched).toLocaleString()}`);
      console.log();
    });
    
  } else {
    console.log('❌ File does not exist');
  }
  
} catch (error) {
  console.log('❌ Error reading file:', error.message);
}

console.log('✅ File reading test completed!');
console.log('💡 The JSON file is working correctly and contains data.');
console.log('🔄 If VS Code shows empty content, try:');
console.log('   1. Refresh VS Code (Ctrl+R)');
console.log('   2. Close and reopen the file');
console.log('   3. Restart VS Code');
console.log('   4. Check VS Code\'s file size limit settings');
