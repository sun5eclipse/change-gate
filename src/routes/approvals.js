const express = require('express');
const router = express.Router();
const db = require('../db');
const { STATES, canTransition } = require('../state');
const { transitionChange } = require('../changeService');

router.post('/:id/approve', async (req, res) => {
  try {
    const change = await transitionChange(req.params.id, STATES.APPROVED, {
      approved_at: new Date().toISOString()
    });
    res.json({ message: '성공적으로 승인되었습니다.', change });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/:id/reject', async (req, res) => {
  try {
    const change = await transitionChange(req.params.id, STATES.REJECTED);
    res.json({ message: '변경 요청이 거절되었습니다.', change });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;