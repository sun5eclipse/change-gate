const fs = require('fs/promises');
const path = require('path');

// 감사 로그 파일 경로 (JSON Lines 형식)
const AUDIT_PATH = path.join(__dirname, '..', 'data', 'audit.jsonl');

async function appendEvent(event) {
  // 이벤트에 시간과 고유 ID를 자동으로 붙임
  const record = {
    id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    ...event
  };

  // JSON 문자열로 변환하고 줄바꿈(\n)을 추가해서 파일에 append
  const line = JSON.stringify(record) + '\n';
  await fs.appendFile(AUDIT_PATH, line, 'utf8');
  return record;
}

async function readAuditLogs() {
  try {
    const raw = await fs.readFile(AUDIT_PATH, 'utf8');
    // 각 줄을 잘라서 JSON 객체로 변환
    return raw
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));
  } catch (error) {
    if (error.code === 'ENOENT') return []; // 파일 없으면 빈 배열
    throw error;
  }
}

module.exports = { appendEvent, readAuditLogs };