const mongoose = require('mongoose');
const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'withdrawn'], default: 'pending' },
  workHours: { type: Number, default: 0 },
  feedback: { type: String },
  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });
module.exports = mongoose.model('Application', applicationSchema);
