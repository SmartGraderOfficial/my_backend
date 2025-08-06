#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

async function checkPrerequisites() {
  log('blue', '🔍 Checking prerequisites...');
  
  try {
    // Check Node.js version
    const { stdout: nodeVersion } = await execAsync('node --version');
    log('green', `✅ Node.js: ${nodeVersion.trim()}`);
    
    // Check if MongoDB is accessible
    try {
      const { stdout: mongoVersion } = await execAsync('mongo --version');
      log('green', '✅ MongoDB CLI available');
    } catch (error) {
      log('yellow', '⚠️  MongoDB CLI not found. Make sure MongoDB is installed and running.');
    }
    
    return true;
  } catch (error) {
    log('red', '❌ Prerequisites check failed:', error.message);
    return false;
  }
}

async function setupEnvironment() {
  log('blue', '⚙️  Setting up environment...');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('green', '✅ Created .env file from .env.example');
      log('yellow', '⚠️  Please review and update the .env file with your settings');
    } else {
      // Create a basic .env file
      const defaultEnv = `# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration  
MONGO_URI=mongodb://localhost:27017/quiz_extension_db

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_at_least_32_characters
JWT_EXPIRE=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
      fs.writeFileSync(envPath, defaultEnv);
      log('green', '✅ Created default .env file');
    }
  } else {
    log('green', '✅ .env file already exists');
  }
  
  return true;
}

async function installDependencies() {
  log('blue', '📦 Installing dependencies...');
  
  try {
    log('cyan', 'Running npm install...');
    const { stdout } = await execAsync('npm install');
    log('green', '✅ Dependencies installed successfully');
    return true;
  } catch (error) {
    log('red', '❌ Failed to install dependencies:', error.message);
    return false;
  }
}

async function importSampleData() {
  log('blue', '📊 Importing sample data...');
  
  const dataPath = path.resolve(__dirname, '../../../../../Downloads/data.json');
  
  if (!fs.existsSync(dataPath)) {
    log('yellow', '⚠️  data.json not found in Downloads folder');
    log('cyan', 'Please ensure the data.json file is available for import');
    return false;
  }
  
  try {
    log('cyan', 'Running data import script...');
    const { stdout } = await execAsync('node utils/importData.js');
    log('green', '✅ Sample data imported successfully');
    return true;
  } catch (error) {
    log('red', '❌ Failed to import sample data:', error.message);
    log('yellow', 'You can run the import manually later: node utils/importData.js');
    return false;
  }
}

async function testConnection() {
  log('blue', '🔗 Testing database connection...');
  
  try {
    // Try to connect to MongoDB
    const testScript = `
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Database connection successful');
  await mongoose.connection.close();
  process.exit(0);
} catch (error) {
  console.error('Database connection failed:', error.message);
  process.exit(1);
}`;
    
    fs.writeFileSync('temp_db_test.js', testScript);
    await execAsync('node temp_db_test.js');
    fs.unlinkSync('temp_db_test.js');
    
    log('green', '✅ Database connection successful');
    return true;
  } catch (error) {
    log('red', '❌ Database connection failed');
    log('yellow', 'Make sure MongoDB is running and the MONGO_URI in .env is correct');
    
    // Clean up temp file if it exists
    if (fs.existsSync('temp_db_test.js')) {
      fs.unlinkSync('temp_db_test.js');
    }
    
    return false;
  }
}

async function showNextSteps() {
  log('blue', '\n🎉 Setup completed! Next steps:');
  console.log('');
  log('cyan', '1. Review and update the .env file if needed');
  log('cyan', '2. Make sure MongoDB is running');
  log('cyan', '3. Start the server:');
  log('white', '   npm start');
  console.log('');
  log('cyan', '4. Test the API:');
  log('white', '   node test/apiTest.js');
  console.log('');
  log('cyan', '5. Available endpoints:');
  log('white', '   POST /api/quiz/get-answer     - Main endpoint');
  log('white', '   POST /api/auth/register       - Register user');
  log('white', '   POST /api/auth/verify         - Verify access key');
  log('white', '   GET  /api/quiz/search         - Search questions');
  log('white', '   GET  /health                  - Health check');
  console.log('');
  log('green', '📚 Check README.md for detailed documentation');
}

async function setup() {
  log('magenta', '🚀 Quiz Extension Backend Setup');
  log('magenta', '=' .repeat(40));
  
  const steps = [
    { name: 'Prerequisites', fn: checkPrerequisites },
    { name: 'Environment', fn: setupEnvironment },
    { name: 'Dependencies', fn: installDependencies },
    { name: 'Database Connection', fn: testConnection },
    { name: 'Sample Data', fn: importSampleData }
  ];
  
  let success = true;
  
  for (const step of steps) {
    try {
      const result = await step.fn();
      if (!result && step.name !== 'Sample Data') {
        success = false;
        break;
      }
    } catch (error) {
      log('red', `❌ Setup step failed: ${step.name}`);
      log('red', error.message);
      if (step.name !== 'Sample Data') {
        success = false;
        break;
      }
    }
  }
  
  if (success) {
    log('green', '\n✅ Setup completed successfully!');
    await showNextSteps();
  } else {
    log('red', '\n❌ Setup failed. Please check the errors above and try again.');
  }
}

// Run setup
setup().catch(error => {
  log('red', '❌ Setup script failed:', error.message);
  process.exit(1);
});
