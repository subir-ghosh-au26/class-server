const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    batch: { type: String, required: true },
    mobile: { type: String, required: true},
    feedback: { type: String, required: true },
    comments: { type: String },
    photo: { type: String, required:true },
    photoType: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);