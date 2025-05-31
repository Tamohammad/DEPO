const mongoose = require("mongoose");



// MongoDB connection env file

const mongoURI = process.env.MONGO_URI;

function main() {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log('✅ MongoDB connected'))
      .catch((err) => console.error('❌ MongoDB connection error:', err))
    }
    

module.exports = { main };