const mongoose = require('mongoose');
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  hoursPerWeek: { type: Number, required: true, min: 1 },
  payRate: { type: Number, required: true, min: 0 },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'closed', 'filled'], default: 'open' },
  startDate: Date,
  endDate: Date,
  requirements: [String],
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }]
}, { timestamps: true });
module.exports = mongoose.model('Job', jobSchema);
