//dotenv 패키지를 불러와서 즉시 실행
//현재 폴더의 .env 파일을 읽어서 그 안의 값을 process.env에 넣어줌
require('dotenv').config();
//express 패키지를 불러와 express라는 변수에 담음 -> 서버를 만드는 함수
const express = require('express');

//Express 애플리케이션 인스턴스를 만듦
const app = express();
//환경변수 PORT가 있으면 그걸 쓰고, 없으면 3000을 사용
const PORT = process.env.PORT || 3000;

//미들웨어 등록 , 요청 본문이 json이면 자동으로 파싱하여 받음
app.use(express.json());

// [추가된 부분] 서버 라우터 연결
const serversRouter = require('./routes/servers');
app.use('/servers', serversRouter);

// [추가] 변경 요청 라우터 연결
const changesRouter = require('./routes/changes');
app.use('/changes', changesRouter);

// [추가] 승인/거절 라우터 연결
const approvalsRouter = require('./routes/approvals');
app.use('/approvals', approvalsRouter);

//라우트 정의
app.get('/health', (req, res) => {
  // JSON 문자열로 변환해서 응답
  res.json({ ok: true, service: 'change-gate', time: new Date().toISOString() });
});

//서버를 실제로 키는 코드
app.listen(PORT, () => {
  console.log(`change-gate listening on http://localhost:${PORT}`);
});
