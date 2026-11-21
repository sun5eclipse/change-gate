const { mockClaude } = require('./mockLlm');

// 우리 서버의 API를 호출하는 도우미 함수 (fetch 사용)
async function callTool(toolName, input) {
  let url = '';
  let method = 'GET';
  let body = null;

  if (toolName === 'get_server_status') {
    url = `http://localhost:3000/servers/${input.server_id}`;
  } else if (toolName === 'request_restart') {
    url = 'http://localhost:3000/changes';
    method = 'POST';
    body = JSON.stringify({ server_id: input.server_id, reason: input.reason });
  } else {
    throw new Error(`알 수 없는 도구: ${toolName}`);
  }

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body
  });

  return await response.json();
}

// 메인 에이전트 루프
async function runAgent(userPrompt) {
  const messages = [
    { role: 'user', content: [{ type: 'text', text: userPrompt }] }
  ];

  console.log(`\n👤 사용자: ${userPrompt}`);

  // 최대 5번까지 반복 (무한 루프 방지)
  for (let i = 0; i < 5; i++) {
    // 1. AI에게 지금까지의 대화를 보내고, 다음 행동을 물어봄
    const aiResponse = await mockClaude(messages);
    
    // AI의 응답을 대화 기록에 추가
    messages.push({ role: 'assistant', content: aiResponse.content });

    // 2. 만약 AI가 도구를 쓰겠다고 하면 (tool_use)
    const toolUses = aiResponse.content.filter(c => c.type === 'tool_use');
    
    if (toolUses.length > 0) {
      for (const toolUse of toolUses) {
        console.log(`🤖 AI의 판단: ${toolUse.name} 도구를 호출합니다.`, toolUse.input);
        
        // 3. 실제 우리 API를 호출해서 실행
        const result = await callTool(toolUse.name, toolUse.input);
        console.log(`   └─ 도구 실행 결과:`, result);

        // 4. 도구 실행 결과를 다시 AI에게 전달 (tool_result)
        messages.push({
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolUse.id,
            name: toolUse.name,
            content: JSON.stringify(result)
          }]
        });
      }
      // 도구 실행 후 다시 while 문 처음으로 (AI가 또 생각하게 하기 위해)
      continue;
    }

    // 5. AI가 도구를 안 쓰고 최종 답변(text)을 했다면 루프 종료
    const textContent = aiResponse.content.find(c => c.type === 'text');
    if (textContent) {
      console.log(`🤖 AI의 최종 답변: ${textContent.text}`);
      return textContent.text;
    }
  }
}

module.exports = { runAgent };