const express = require('express');
const router = express.Router();
const crypto = require('crypto'); // 고유 ID 생성을 위해 Node.js 내장 모듈 사용
const db = require('../db');
const { STATES } = require('../state');
const { executeChange } = require('../executor');

// 1. 변경 요청 생성 (POST /changes)
router.post('/', async (req, res) => {
  try {
    const { server_id, reason } = req.body;

    if (!server_id) {
      return res.status(400).json({ error: 'server_id는 필수입니다.' });
    }

    const changes = await db.readDB('changes.json');

    // 새로운 변경 요청 객체 생성
    const newChange = {
      id: 'chg-' + crypto.randomUUID().slice(0, 8), // 예: chg-a1b2c3d4
      server_id,
      reason: reason || '이유 없음',
      status: STATES.PENDING_APPROVAL, //  무조건 승인 대기 상태로 시작!
      requested_at: new Date().toISOString(),
      approved_at: null,
      executed_at: null,
      before_state: null, // 실행 전 스냅샷을 위해 나중에 채울 예정
      after_state: null
    };

    changes.push(newChange);
    await db.writeDB('changes.json', changes);

    res.status(201).json(newChange);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. 변경 요청 상세 조회 (GET /changes/:id)
router.get('/:id', async (req, res) => {
  try {
    const changes = await db.readDB('changes.json');
    const change = changes.find(c => c.id === req.params.id);
    if (!change) return res.status(404).json({ error: '변경 요청을 찾을 수 없습니다.' });
    res.json(change);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. 변경 요청 실행 (POST /changes/:id/execute)
router.post('/:id/execute', async (req, res) => {
  try {
    const simulateFailure = req.query.simulate_failure === 'true';
    const change = await executeChange(req.params.id, { simulateFailure });
    res.json({ message: '실행이 완료되었습니다.', change });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;