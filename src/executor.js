const db = require('./db');
const { STATES, canTransition } = require('./state');
const { httpError, getChangeOrThrow } = require('./changeService');

async function executeChange(changeId, options = {}) {
    // 1) 조회는 공통 헬퍼로
    const { changes, index : changeIndex, change } = await getChangeOrThrow(changeId);
    // 2) 상태 머신 검증: APPROVED -> EXECUTING 만 허용
    if (!canTransition(change.status, STATES.EXECUTING)) {
        throw httpError(`현재 상태(${change.status})에서는 실행할 수 없습니다.`, 400);
    }

    // 3) 대상 서버 조회
    const serversData = await db.readDB('servers.json');
    const serverIndex = serversData.servers.findIndex(s => s.id === change.server_id);
    if (serverIndex === -1) throw httpError('대상 서버를 찾을 수 없습니다.', 404);

    const server = serversData.servers[serverIndex];

    // 4) 실행 전 스냅샷 저장 (깊은 복사)
    // 참조가 아닌, 문자열로 바꿨다가 다시 객체로 되돌림.
    change.before_state = JSON.parse(JSON.stringify(server));
    change.status = STATES.EXECUTING;
    change.executed_at = new Date().toISOString();
    changes[changeIndex] = change;
    await db.writeDB('changes.json', changes);

    try {
        // 5) 시뮬레이션: 서버를 restarting 상태로
        server.status = 'restarting';
        serversData.servers[serverIndex] = server;
        await db.writeDB('servers.json', serversData);

        // 실제 재시작처럼 보이게 0.3초 대기
        await new Promise(resolve => setTimeout(resolve, 300));

        // 6) 실패 시뮬레이션 옵션
        if (options.simulateFailure) {
        throw new Error('시뮬레이션된 실행 실패');
        }

        // 7) 성공: 서버를 다시 running으로
        server.status = 'running';
        serversData.servers[serverIndex] = server;
        await db.writeDB('servers.json', serversData);

        change.after_state = JSON.parse(JSON.stringify(server));
        change.status = STATES.COMPLETED;
        changes[changeIndex] = change;
        await db.writeDB('changes.json', changes);

        return change;
    }
    catch(err){
        // 8) 실패: FAILED 기록 후 스냅샷으로 롤백
        change.status = STATES.FAILED;
        changes[changeIndex] = change;
        await db.writeDB('changes.json', changes);

        // before_state로 복원
        serversData.servers[serverIndex] = change.before_state;
        await db.writeDB('servers.json', serversData);

        change.status = STATES.ROLLED_BACK;
        changes[changeIndex] = change;
        await db.writeDB('changes.json', changes);

        throw httpError(`실행 실패 후 롤백되었습니다: ${err.message}`, 500);
    }
}

module.exports = { executeChange };