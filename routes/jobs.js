const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// Get all jobs
router.get('/', async (req, res) => {
  try { const jobs = await Job.find({ status: 'open' }).populate('postedBy', 'name department'); res.json(jobs); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

// Get single job
router.get('/:id', async (req, res) => {
  try { const job = await Job.findById(req.params.id).populate('postedBy', 'name email'); if (!job) return res.status(404).json({ message: 'Job not found' }); res.json(job); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

// Create job (Admin only)
router.post('/', auth, [body('title').notEmpty(), body('description').notEmpty(), body('department').notEmpty(), body('location').notEmpty(), body('hoursPerWeek').isNumeric(), body('payRate').isNumeric()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try { const { title, description, department, location, hoursPerWeek, payRate, requirements, startDate, endDate } = req.body;
    const job = new Job({ title, description, department, location, hoursPerWeek, payRate, requirements, startDate, endDate, postedBy: req.user.userId });
    await job.save(); res.status(201).json(job); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try { const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!job) return res.status(404).json({ message: 'Job not found' }); res.json(job); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try { const job = await Job.findByIdAndDelete(req.params.id); if (!job) return res.status(404).json({ message: 'Job not found' }); res.json({ message: 'Job deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
