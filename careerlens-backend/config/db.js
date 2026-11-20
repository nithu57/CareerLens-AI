import 'dotenv/config';
import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas cluster using Mongoose.
 * Centralized database connection for both React Web and Flutter Mobile clients.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in careerlens-backend/.env');
    console.error('👉 Please add your MongoDB connection string in .env to connect to the database.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Automatically build indexes defined in Mongoose schemas
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`====================================================`);
    console.log(`  ✅ MongoDB Connected Successfully`);
    console.log(`  Host     : ${conn.connection.host}`);
    console.log(`  Database : ${conn.connection.name}`);
    console.log(`====================================================`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully.');
});
