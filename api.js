// api.js
const express = require('express');
const PollService = require('./service');

const router = express.Router();

// GET /api/frameworks
router.get('/frameworks', (req, res) => {
  try {
    res.json(PollService.listFrameworks());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/vote  { frameworkId, userName }
router.post('/vote', (req, res) => {
  try {
    const result = PollService.vote(req.body.frameworkId, req.body.userName);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/results
router.get('/results', (req, res) => {
  try {
    res.json(PollService.getResults());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/history - история всех голосов
router.get('/history', (req, res) => {
  try {
    res.json(PollService.getVoteHistory());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;