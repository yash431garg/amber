// utils/connectDB.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URL;

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

export default connectDB;
