import fetch from 'node-fetch';

// Test the actual API endpoint to see if directions is being saved
console.log('🧪 Testing actual API endpoint with directions field...\n');

const testRequest = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/questions/get-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': 'your-secret-access-key-here'
      },
      body: JSON.stringify({
        directions: "Test directions for API logging verification",
        question: "This is a test question that should not exist in database",
        options: {
          A: "Test Option A",
          B: "Test Option B", 
          C: "Test Option C",
          D: "Test Option D"
        }
      })
    });

    const result = await response.json();
    console.log('📊 API Response:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.log('✅ Question not found (as expected), should be logged with directions');
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('💡 Make sure the server is running on port 3000');
  }
};

testRequest();
