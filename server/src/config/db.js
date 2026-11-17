const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventsphere';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[EventSphere DB] Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[EventSphere DB] Connection notice: ${error.message}`);
    console.log('[EventSphere DB] The server will continue running. Ensure MongoDB is active when database operations are invoked.');
  }
};

module.exports = connectDatabase;
