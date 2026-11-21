const db = require('./db');
const { canTransition } = require('./state');

// HTTP 상태 코드를 담아 에러를 던지는 헬퍼 (기존 executor.js에 있던 것)
function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// 변경 요청 조회 + 없으면 404 (조회 로직 공통화)
async function getChangeOrThrow(changeId) {
  const changes = await db.readDB('changes.json');
  const index = changes.findIndex(c => c.id === changeId);
  if (index === -1) throw httpError('변경 요청을 찾을 수 없습니다.', 404);
  return { changes, index, change: changes[index] };
}

// 상태 전이 + 추가 필드 반영 + 저장 (전이 로직 공통화)
async function transitionChange(changeId, nextState, extraFields = {}) {
  const { changes, index, change } = await getChangeOrThrow(changeId);

  if (!canTransition(change.status, nextState)) {
    throw httpError(`현재 상태(${change.status})에서는 ${nextState}(으)로 전이할 수 없습니다.`, 400);
  }

  Object.assign(change, extraFields); // approved_at 같은 부가 정보 반영
  change.status = nextState;

  changes[index] = change;
  await db.writeDB('changes.json', changes);
  return change;
}

module.exports = { httpError, getChangeOrThrow, transitionChange };