const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
      const mongoURI = process.env.MONGO_URI;
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // poolSize: 10, // You can also configure the pool size
        });
        console.log('MongoDB connected!');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;