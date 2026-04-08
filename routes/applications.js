const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// Get all applications (Admin) or student's own
router.get('/', auth, async (req, res) => {
  try {
    let query = req.user.role === 'admin' ? {} : { student: req.user.userId };
    const apps = await Application.find(query).populate('job student', 'title name');
    res.json(apps);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Apply for job
router.post('/', auth, [body('job').notEmpty(), body('coverLetter').optional()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  try {
    const { job, coverLetter } = req.body;
    const existing = await Application.findOne({ job, student: req.user.userId });
    if (existing) return res.status(400).json({ message: 'Already applied' });
    const app = new Application({ job, student: req.user.userId, coverLetter });
    await app.save();
    await Job.findByIdAndUpdate(job, { $push: { applications: app._id } });
    res.status(201).json(app);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Update application status (Admin)
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const { status, feedback, workHours } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, { status, feedback, workHours }, { new: true });
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json(app);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get single application
router.get('/:id', auth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('job student');
    if (!app) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && app.student._id.toString() !== req.user.userId) return res.status(403).json({ message: 'Forbidden' });
    res.json(app);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
