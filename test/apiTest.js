import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test configuration
const testConfig = {
  testUser: {
    NameOfStu: 'Test User',
    StuID: 'TEST001',
    AccessKey: 'testkey123456'
  },
  sampleQuestion: {
    AccessKey: 'samplekey123', // From imported data
    question: 'After the division of a number successively by 3, 4, and 7, the remainders obtained are 2, 1 and 4 respectively. What will be the remainder if 84 divide the same number ?',
    OptionA: '80',
    OptionB: '76',
    OptionC: '41',
    OptionD: '53'
  }
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await apiCall('/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log('📊 Status:', result.data.status);
    console.log('🕒 Environment:', result.data.environment);
  } else {
    console.log('❌ Health check failed:', result.data);
  }
  
  return result.success;
}

async function testQuizHealthCheck() {
  console.log('\n🧩 Testing Quiz Service Health Check...');
  const result = await apiCall('/api/quiz/health');
  
  if (result.success) {
    console.log('✅ Quiz health check passed');
    console.log('📊 Total questions:', result.data.data?.totalActiveQuestions || 'N/A');
  } else {
    console.log('❌ Quiz health check failed:', result.data);
  }
  
  return result.success;
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');
  const result = await apiCall('/api/auth/register', 'POST', testConfig.testUser);
  
  if (result.success) {
    console.log('✅ User registration successful');
    console.log('👨‍🎓 Student:', result.data.data.NameOfStu);
    console.log('🆔 Student ID:', result.data.data.StuID);
  } else {
    console.log('❌ User registration failed:', result.data);
    // Don't fail test if user already exists
    if (result.data.message && result.data.message.includes('already exists')) {
      console.log('ℹ️  User already exists, continuing with tests...');
      return true;
    }
  }
  
  return result.success || (result.data.message && result.data.message.includes('already exists'));
}

async function testAccessKeyVerification() {
  console.log('\n🔐 Testing Access Key Verification...');
  const result = await apiCall('/api/auth/verify', 'POST', {
    AccessKey: testConfig.testUser.AccessKey
  });
  
  if (result.success) {
    console.log('✅ Access key verification successful');
    console.log('👨‍🎓 Verified user:', result.data.data.NameOfStu);
  } else {
    console.log('❌ Access key verification failed:', result.data);
  }
  
  return result.success;
}

async function testGetAnswer() {
  console.log('\n🎯 Testing Get Answer (Main Functionality)...');
  const result = await apiCall('/api/quiz/get-answer', 'POST', testConfig.sampleQuestion);
  
  if (result.success) {
    console.log('✅ Get answer successful');
    console.log('🔑 Correct option:', result.data.data.correctOptionKey);
    console.log('💡 Correct value:', result.data.data.correctOptionValue);
    console.log('📚 Section:', result.data.data.questionDetails.section);
    console.log('👤 Requested by:', result.data.data.requestedBy);
  } else {
    console.log('❌ Get answer failed:', result.data);
  }
  
  return result.success;
}

async function testSearchQuestions() {
  console.log('\n🔍 Testing Question Search...');
  const result = await apiCall('/api/quiz/search?keyword=division&limit=2', 'GET', {
    AccessKey: testConfig.sampleQuestion.AccessKey
  });
  
  if (result.success) {
    console.log('✅ Question search successful');
    console.log('📊 Found questions:', result.data.data.questions.length);
    console.log('📈 Total questions:', result.data.data.pagination.totalQuestions);
  } else {
    console.log('❌ Question search failed:', result.data);
  }
  
  return result.success;
}

async function testGetStats() {
  console.log('\n📊 Testing Statistics...');
  const questionStats = await apiCall('/api/quiz/stats', 'GET', {
    AccessKey: testConfig.sampleQuestion.AccessKey
  });
  
  const userStats = await apiCall('/api/auth/stats', 'GET', {
    AccessKey: testConfig.testUser.AccessKey
  });
  
  let success = true;
  
  if (questionStats.success) {
    console.log('✅ Question stats retrieved');
    console.log('📚 Total questions:', questionStats.data.data.totalQuestions);
  } else {
    console.log('❌ Question stats failed:', questionStats.data);
    success = false;
  }
  
  if (userStats.success) {
    console.log('✅ User stats retrieved');
    console.log('👥 Total users:', userStats.data.data.totalUsers);
    console.log('✅ Active users:', userStats.data.data.activeUsers);
  } else {
    console.log('❌ User stats failed:', userStats.data);
    success = false;
  }
  
  return success;
}

async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling...');
  let errorTests = 0;
  let passedTests = 0;
  
  // Test invalid access key
  errorTests++;
  const invalidKeyResult = await apiCall('/api/quiz/get-answer', 'POST', {
    ...testConfig.sampleQuestion,
    AccessKey: 'invalid_key_123'
  });
  if (invalidKeyResult.status === 401) {
    console.log('✅ Invalid access key properly rejected');
    passedTests++;
  } else {
    console.log('❌ Invalid access key test failed');
  }
  
  // Test missing required fields
  errorTests++;
  const missingFieldsResult = await apiCall('/api/quiz/get-answer', 'POST', {
    AccessKey: testConfig.sampleQuestion.AccessKey
    // Missing question and options
  });
  if (missingFieldsResult.status === 400) {
    console.log('✅ Missing fields properly rejected');
    passedTests++;
  } else {
    console.log('❌ Missing fields test failed');
  }
  
  // Test question not found
  errorTests++;
  const notFoundResult = await apiCall('/api/quiz/get-answer', 'POST', {
    AccessKey: testConfig.sampleQuestion.AccessKey,
    question: 'This question definitely does not exist in the database',
    OptionA: 'A',
    OptionB: 'B',
    OptionC: 'C',
    OptionD: 'D'
  });
  if (notFoundResult.status === 404) {
    console.log('✅ Question not found properly handled');
    passedTests++;
  } else {
    console.log('❌ Question not found test failed');
  }
  
  console.log(`📊 Error handling tests: ${passedTests}/${errorTests} passed`);
  return passedTests === errorTests;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Quiz Health Check', fn: testQuizHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'Access Key Verification', fn: testAccessKeyVerification },
    { name: 'Get Answer', fn: testGetAnswer },
    { name: 'Search Questions', fn: testSearchQuestions },
    { name: 'Statistics', fn: testGetStats },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      }
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log(`❌ Test ${test.name} threw an error:`, error.message);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 Test Results Summary');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📊 Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.');
  }
  
  return passed === total;
}

// Instructions for running tests
console.log('📋 Quiz Extension Backend API Test Suite');
console.log('=' .repeat(50));
console.log('Prerequisites:');
console.log('1. Start MongoDB service');
console.log('2. Run: npm start (in server directory)');
console.log('3. Import sample data: node utils/importData.js');
console.log('4. Run this test: node test/apiTest.js');
console.log('=' .repeat(50));

// Check if server is running before starting tests
apiCall('/health').then(result => {
  if (result.success) {
    runAllTests();
  } else {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('Run: npm start');
  }
}).catch(error => {
  console.log('❌ Could not connect to server:', error.message);
  console.log('Please make sure the server is running on http://localhost:5000');
});

export { runAllTests };
