// 이 파일은 진짜 Claude API를 대신하는 "모의 LLM"입니다.

async function mockClaude(messages) {
  const lastMessage = messages[messages.length - 1];
  const userText = messages[0].content[0].text; // 첫 번째 사용자 요청
  const isRestartRequest = userText.includes('재시작') || userText.includes('restart');

  // 지금까지 실행된 도구들의 이름을 수집합니다.
  const executedTools = [];
  messages.forEach(m => {
    m.content.forEach(c => {
      if (c.type === 'tool_result') executedTools.push(c.name);
    });
  });

  // 1단계: 아직 상태 조회를 안 했다면 -> 상태 조회 도구 호출
  if (isRestartRequest && !executedTools.includes('get_server_status')) {
    return {
      stop_reason: 'tool_use',
      content: [{
        type: 'tool_use',
        id: 'call_' + Date.now(),
        name: 'get_server_status',
        input: { server_id: 'web-01' }
      }]
    };
  }

  // 2단계: 상태 조회는 했지만, 재시작 요청은 안 했다면 -> 재시작 도구 호출
  if (isRestartRequest && !executedTools.includes('request_restart')) {
    return {
      stop_reason: 'tool_use',
      content: [{
        type: 'tool_use',
        id: 'call_' + Date.now(),
        name: 'request_restart',
        input: { server_id: 'web-01', reason: '메모리 누수 의심' }
      }]
    };
  }

  // 3단계: 모든 필요한 도구를 다 썼다면 -> 최종 답변 반환
  if (isRestartRequest && executedTools.includes('request_restart')) {
    return {
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: '요청하신 작업을 완료했습니다. (승인 대기열에 추가됨)' }]
    };
  }

  // 예외: 재시작 요청이 아닌 경우
  return {
    stop_reason: 'end_turn',
    content: [{ type: 'text', text: '죄송합니다. 이해하지 못했습니다.' }]
  };
}

module.exports = { mockClaude };