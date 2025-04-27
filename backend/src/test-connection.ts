import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academichub');
    console.log('Successfully connected to MongoDB.');
    console.log('Connection state:', mongoose.connection.readyState);
    
    await mongoose.connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

testConnection(); 