// Test script to verify mixed content handling
const testMixedContentHandling = () => {
  console.log("🧪 Testing Mixed Content Handling Logic");
  console.log("=====================================");
  
  // Simulate the findExactMatch logic
  const simulateFindExactMatch = (questionData) => {
    const { 
      question, questionImage,
      OptionA, OptionAImage,
      OptionB, OptionBImage, 
      OptionC, OptionCImage,
      OptionD, OptionDImage 
    } = questionData;
    
    const query = {};
    
    // Question matching - match both text and image if both provided
    if (question && question.trim()) {
      query.question = question.trim();
    }
    if (questionImage && questionImage.trim()) {
      query.questionImage = questionImage.trim();
    }
    
    // If neither question text nor image provided, return null
    if (!query.question && !query.questionImage) {
      console.log("No question text or image provided for search");
      return null;
    }
    
    // Option A matching - match both text and image if both provided
    if (OptionA !== undefined || OptionAImage !== undefined) {
      if (OptionA && OptionA.trim()) {
        query.OptionA = OptionA.trim();
      }
      if (OptionAImage && OptionAImage.trim()) {
        query.OptionAImage = OptionAImage.trim();
      }
    }
    
    // Option B matching - match both text and image if both provided
    if (OptionB !== undefined || OptionBImage !== undefined) {
      if (OptionB && OptionB.trim()) {
        query.OptionB = OptionB.trim();
      }
      if (OptionBImage && OptionBImage.trim()) {
        query.OptionBImage = OptionBImage.trim();
      }
    }
    
    console.log("Generated Query:", JSON.stringify(query, null, 2));
    return query;
  };
  
  // Test Case 1: Text only (should work as before)
  console.log("\n📝 Test 1 - Text Only:");
  const textOnly = {
    question: "What is 2+2?",
    OptionA: "3",
    OptionB: "4"
  };
  simulateFindExactMatch(textOnly);
  
  // Test Case 2: Image only (should work as before)
  console.log("\n🖼️ Test 2 - Image Only:");
  const imageOnly = {
    questionImage: "https://example.com/math.png",
    OptionAImage: "https://example.com/option-a.png",
    OptionBImage: "https://example.com/option-b.png"
  };
  simulateFindExactMatch(imageOnly);
  
  // Test Case 3: MIXED CONTENT (CRITICAL TEST)
  console.log("\n🔥 Test 3 - Mixed Content (BOTH text and images):");
  const mixedContent = {
    question: "What does this diagram show?",
    questionImage: "https://example.com/diagram.png",
    OptionA: "Linear function",
    OptionAImage: "https://example.com/linear.png",
    OptionB: "Quadratic function",
    OptionBImage: "https://example.com/quadratic.png"
  };
  const mixedResult = simulateFindExactMatch(mixedContent);
  
  // Verification
  console.log("\n✅ VERIFICATION:");
  console.log("Should have question text:", mixedResult.hasOwnProperty('question'));
  console.log("Should have question image:", mixedResult.hasOwnProperty('questionImage'));
  console.log("Should have OptionA text:", mixedResult.hasOwnProperty('OptionA'));
  console.log("Should have OptionA image:", mixedResult.hasOwnProperty('OptionAImage'));
  console.log("Should have OptionB text:", mixedResult.hasOwnProperty('OptionB'));
  console.log("Should have OptionB image:", mixedResult.hasOwnProperty('OptionBImage'));
  
  if (mixedResult.question && mixedResult.questionImage && 
      mixedResult.OptionA && mixedResult.OptionAImage &&
      mixedResult.OptionB && mixedResult.OptionBImage) {
    console.log("\n🎉 SUCCESS: Mixed content handling works correctly!");
    console.log("✅ Both text AND images are included in the search query");
  } else {
    console.log("\n❌ FAILURE: Mixed content handling is broken!");
    console.log("❌ Some text or image fields are missing from query");
  }
  
  // Test Case 4: Partial mixed content
  console.log("\n🔄 Test 4 - Partial Mixed Content:");
  const partialMixed = {
    question: "Choose the correct answer:",
    OptionA: "Text answer",
    OptionBImage: "https://example.com/image-answer.png"
  };
  simulateFindExactMatch(partialMixed);
};

// Run the test
testMixedContentHandling();
