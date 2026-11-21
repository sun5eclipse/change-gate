const fs = require('fs/promises');
//fs : node js 안의 기본 도구 , 파일을 읽고 쓰는 기능

const path = require('path');
//파일 경로를 OS에 맞게 안전하게 조합해주는 도구

const DATA_DIR = path.join(__dirname , '..' , 'data');
// data 폴더의 절대 경로를 미리 정해둠

// 파일 이름을 인자로 받아서 읽음. (기본값: servers.json)
async function readDB(filename = 'servers.json') {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    // 파일이 없으면 빈 배열 혹은 빈 객체를 반환하도록 처리 (초기 실행 시 에러 방지)
    if (error.code === 'ENOENT') return filename === 'changes.json' ? [] : { servers: [] };
    console.error('DB 읽기 실패:', error);
    throw new Error('데이터를 읽을 수 없습니다.');
  }
}

// 파일 이름과 데이터를 받아서 씁니다.
async function writeDB(filename = 'servers.json', data) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonString, 'utf8');
  } catch (error) {
    console.error('DB 쓰기 실패:', error);
    throw new Error('데이터를 저장할 수 없습니다.');
  }
}

module.exports = { readDB, writeDB };
//readDB와 writeDB를 쓸 수 있게 export