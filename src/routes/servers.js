const express = require('express');
const router = express.Router(); //app 전체에 라우트를 붙이는 게 아니라, 특정 기능(서버 관리)만 모아둔 미니 앱을 만듦
const db = require('../db');

// 1. 전체 서버 목록 조회 (GET /servers)
router.get('/', async (req, res) => {
  try {
    const data = await db.readDB();
    res.json(data.servers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 특정 서버 상세 조회 (GET /servers/:id)
router.get('/:id', async (req, res) => {
  try {
    const data = await db.readDB();
    const server = data.servers.find(s => s.id === req.params.id);
    
    if (!server) {
      return res.status(404).json({ error: '서버를 찾을 수 없습니다.' });
    }
    res.json(server);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;