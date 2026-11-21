const STATES = {
  PENDING_APPROVAL: 'PENDING_APPROVAL', // 승인 대기
  APPROVED: 'APPROVED',                 // 승인됨
  REJECTED: 'REJECTED',                 // 거절됨
  EXECUTING: 'EXECUTING',               // 실행 중
  COMPLETED: 'COMPLETED',               // 완료
  FAILED: 'FAILED',                     // 실패
  ROLLED_BACK: 'ROLLED_BACK'            // 롤백됨
};

// 상태 전이 규칙 (From -> To 배열)
const TRANSITIONS = {
  [STATES.PENDING_APPROVAL]: [STATES.APPROVED, STATES.REJECTED],
  [STATES.APPROVED]: [STATES.EXECUTING],
  [STATES.EXECUTING]: [STATES.COMPLETED, STATES.FAILED],
  [STATES.FAILED]: [STATES.ROLLED_BACK],
  [STATES.COMPLETED]: [], // 완료된 건 더 이상 바꿀 수 없음
  [STATES.REJECTED]: [],
  [STATES.ROLLED_BACK]: []
};

// 상태 전이가 가능한지 검사하는 함수
function canTransition(currentState, nextState) {
  const allowed = TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
}

module.exports = { STATES, canTransition };