// Test script to verify the GET request fix
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';
const ACCESS_KEY = 'MySecureKey123';

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Health check (should work)
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test 2: Quiz health check (should work)
    console.log('2. Testing quiz health check...');
    const quizHealthResponse = await fetch(`${BASE_URL}/api/quiz/health`);
    const quizHealthData = await quizHealthResponse.json();
    console.log('✅ Quiz health:', quizHealthData.success ? 'OK' : 'Failed');
    console.log('');

    // Test 3: Search endpoint with authentication (this was failing before)
    console.log('3. Testing search endpoint with authentication...');
    const searchResponse = await fetch(`${BASE_URL}/api/quiz/search?query=capital&limit=5&page=1`, {
      method: 'GET',
      headers: {
        'Authorization': `AccessKey ${ACCESS_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Search endpoint working:', searchData.success ? 'Success' : 'Failed');
    } else {
      const errorData = await searchResponse.json();
      console.log('❌ Search endpoint failed:', errorData.message);
    }
    console.log('');

    // Test 4: Get answer endpoint (POST request)
    console.log('4. Testing get-answer endpoint...');
    const answerResponse = await fetch(`${BASE_URL}/api/quiz/get-answer`, {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${ACCESS_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: 'What is the capital of France?',
        options: {
          A: 'London',
          B: 'Berlin',
          C: 'Paris',
          D: 'Madrid'
        }
      })
    });
    
    if (answerResponse.ok) {
      const answerData = await answerResponse.json();
      console.log('✅ Get answer endpoint working:', answerData.success ? 'Success' : 'Failed');
    } else {
      const errorData = await answerResponse.json();
      console.log('❌ Get answer endpoint failed:', errorData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testEndpoints();
