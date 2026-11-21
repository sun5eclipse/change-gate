// 이 파일은 AI(Claude)에게 우리 서버의 API(도구)가 무엇이 있는지 알려주는 "설명서"입니다.

const tools = [
  {
    name: 'get_server_status',
    description: '특정 서버의 현재 상태(켜짐/꺼짐, 버전 등)를 조회합니다.',
    input_schema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: '조회할 서버의 ID (예: web-01)' },
      },
      required: ['server_id'],
    },
  },
  {
    name: 'request_restart',
    description: '서버 재시작을 요청합니다. 이 요청은 즉시 실행되지 않고 "승인 대기(PENDING_APPROVAL)" 상태가 됩니다.',
    input_schema: {
      type: 'object',
      properties: {
        server_id: { type: 'string', description: '재시작할 서버의 ID' },
        reason: { type: 'string', description: '재시작이 필요한 이유' },
      },
      required: ['server_id', 'reason'],
    },
  },
];

module.exports = { tools };