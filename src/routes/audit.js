const express = require('express');
const router = express.Router();
const { readAuditLogs } = require('../audit');

router.get('/', async (req, res) => {
  try {
    const logs = await readAuditLogs();
    // changeId 쿼리로 필터링 가능 (?changeId=chg-xxx)
    const filtered = req.query.changeId
      ? logs.filter(l => l.changeId === req.query.changeId)
      : logs;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
