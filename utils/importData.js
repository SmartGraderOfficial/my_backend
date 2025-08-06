import mongoose from 'mongoose';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { connectDb } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to import questions from JSON file
export const importQuestions = async (filePath) => {
  try {
    console.log('Starting question import...');
    
    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON file must contain an array of questions');
    }

    console.log(`Found ${jsonData.length} questions to import`);

    // Transform data to match our schema
    const transformedData = jsonData.map((item, index) => {
      // Handle different property name formats
      const question = item.question || item.Question || '';
      const optionA = item.OptionA || item['Option A'] || '';
      const optionB = item.OptionB || item['Option B'] || '';
      const optionC = item.OptionC || item['Option C'] || '';
      const optionD = item.OptionD || item['Option D'] || '';
      const correctAns = item.CorrectAns || item['Correct Ans'] || '';

      if (!question.trim()) {
        console.warn(`Skipping item ${index + 1}: No question text found`);
        return null;
      }

      return {
        section: item.section || 'General',
        questionType: item.questionType || 'Multiple Choice Question',
        directions: item.directions || '',
        question: question.trim(),
        OptionA: optionA.trim(),
        OptionB: optionB.trim(),
        OptionC: optionC.trim(),
        OptionD: optionD.trim(),
        CorrectAns: correctAns.trim(),
        isActive: true
      };
    }).filter(item => item !== null);

    console.log(`Transformed ${transformedData.length} valid questions`);

    // Clear existing questions (optional - comment out to append instead)
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert new questions in batches
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      try {
        await Question.insertMany(batch, { ordered: false });
        imported += batch.length;
        console.log(`Imported batch: ${imported}/${transformedData.length}`);
      } catch (error) {
        console.error(`Error importing batch starting at index ${i}:`, error.message);
        // Continue with next batch
      }
    }

    console.log(`✅ Successfully imported ${imported} questions`);
    return { success: true, imported, total: jsonData.length };

  } catch (error) {
    console.error('❌ Error importing questions:', error);
    return { success: false, error: error.message };
  }
};

// Function to create sample users
export const createSampleUsers = async () => {
  try {
    console.log('Creating sample users...');

    const sampleUsers = [
      {
        NameOfStu: 'John Doe',
        StuID: 'STU001',
        AccessKey: 'samplekey123'
      },
      {
        NameOfStu: 'Jane Smith',
        StuID: 'STU002',
        AccessKey: 'testkey456'
      },
      {
        NameOfStu: 'Demo User',
        StuID: 'DEMO001',
        AccessKey: 'demokey789'
      }
    ];

    // Clear existing users (optional)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert sample users
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} sample users`);

    return { success: true, users: createdUsers.length };

  } catch (error) {
    console.error('❌ Error creating sample users:', error);
    return { success: false, error: error.message };
  }
};

// Main import function
const runImport = async () => {
  try {
    await connectDb();
    
    // Import questions from the downloaded data.json file
    const dataPath = path.resolve(__dirname, '../../../../../../Downloads/data.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error('❌ Data file not found at:', dataPath);
      console.log('Please ensure the data.json file is in the Downloads folder');
      process.exit(1);
    }

    const questionResult = await importQuestions(dataPath);
    const userResult = await createSampleUsers();

    console.log('\n📊 Import Summary:');
    console.log(`Questions: ${questionResult.success ? '✅' : '❌'} ${questionResult.imported || 0} imported`);
    console.log(`Users: ${userResult.success ? '✅' : '❌'} ${userResult.users || 0} created`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runImport();
}
