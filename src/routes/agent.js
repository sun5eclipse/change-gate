const express = require('express');
const router = express.Router();
const { runAgent } = require('../agent');

router.post('/run', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt가 필요합니다.' });

    const result = await runAgent(prompt);
    res.json({ message: '에이전트 작업 완료', result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
