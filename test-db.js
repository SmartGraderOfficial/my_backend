import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB connection...');
console.log('MONGO_URI:', process.env.MONGO_URI);

const testConnection = async () => {
  try {
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    console.log('⏳ Attempting to connect...');
    const conn = await mongoose.connect(process.env.MONGO_URI, connectionOptions);
    
    console.log('✅ MongoDB Connected successfully!');
    console.log('Host:', conn.connection.host);
    console.log('Database:', conn.connection.name);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure MongoDB is running on your system');
      console.log('   - If using local MongoDB: start mongod service');
      console.log('   - If using MongoDB Atlas: check your connection string');
    }
    
    process.exit(1);
  }
};

testConnection();
