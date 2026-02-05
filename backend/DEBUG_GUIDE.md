# 회의록 생성 API 디버깅 가이드

## 수정 내역 (2026-02-05)

### 1. ai_service.py 개선
- API 키 검증을 모듈 로드 시점으로 변경
- API 키가 None일 때 configure 호출하지 않도록 수정
- 상세 로깅 추가 (API 호출 시작/성공/실패)
- Gemini API 타임아웃 60초 설정
- 에러 발생 시 traceback 출력으로 디버깅 정보 강화

### 2. main.py 개선
- 서버 시작 시 환경 변수 로드 상태 출력
- GEMINI_API_KEY 존재 여부 확인 로그 추가
- 사용자에게 .env 파일 설정 안내 메시지 추가

### 3. meetings.py 개선
- 회의록 생성 요청 로깅 추가
- AI 요약 완료 로그 추가
- DB 저장 완료 로그 추가
- 에러 발생 시 명확한 HTTPException 반환
- DB rollback 처리 추가

### 4. .env.example 생성
- 사용자가 쉽게 환경 변수를 설정할 수 있도록 예시 파일 생성
- API 키 발급 링크 포함

## 테스트 방법

### 1. 환경 변수 설정
```bash
cd backend
cp .env.example .env
# .env 파일을 열어서 GEMINI_API_KEY를 실제 값으로 변경
```

### 2. 서버 실행
```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

### 3. 서버 로그 확인
서버 시작 시 다음 메시지가 출력되어야 합니다:
```
==================================================
🚀 서버 시작 중...
📁 작업 디렉토리: C:\...\backend
✅ GEMINI_API_KEY 로드됨 (길이: 39)
==================================================
```

### 4. API 테스트
http://localhost:8000/docs 에서 Swagger UI로 테스트:

**POST /api/meetings**
```json
{
  "title": "테스트 회의",
  "content": "오늘은 프로젝트 진행 상황을 논의했습니다. 홍길동은 API 설계를 2월 15일까지 완료하기로 했습니다. 김철수는 프론트엔드 구현을 담당합니다."
}
```

### 5. 로그 확인
성공 시 다음 로그가 출력됩니다:
```
📝 회의록 생성 요청: 테스트 회의
🤖 Gemini API 호출 시작...
✅ Gemini API 응답 성공 (길이: 234)
✅ AI 요약 완료 (요약 길이: 150)
✅ DB 저장 완료 (ID: 1)
```

## 문제 해결

### 문제 1: GEMINI_API_KEY 없음
**증상**: 서버 시작 시 "⚠️ GEMINI_API_KEY 환경 변수가 없습니다." 출력

**해결**:
1. `.env.example`을 `.env`로 복사
2. https://makersuite.google.com/app/apikey 에서 API 키 발급
3. `.env` 파일에 `GEMINI_API_KEY=발급받은키` 추가
4. 서버 재시작

### 문제 2: Gemini API 호출 실패
**증상**: "❌ AI 요약 생성 실패" 로그 출력

**원인**:
- API 키가 유효하지 않음
- 네트워크 연결 문제
- Gemini API 서버 문제
- 타임아웃 (60초 초과)

**해결**:
1. API 키 재확인
2. 인터넷 연결 확인
3. https://generativelanguage.googleapis.com 접속 가능 여부 확인
4. 로그에서 구체적인 에러 메시지 확인 (traceback 출력됨)

### 문제 3: DB 저장 실패
**증상**: "❌ 회의록 생성 실패" 로그 출력

**원인**:
- DB 파일 권한 문제
- 디스크 공간 부족
- 데이터 검증 실패

**해결**:
1. `backend/app.db` 파일 권한 확인
2. 디스크 공간 확인
3. 요청 데이터 검증 (title, content 필수)

## 주요 변경 사항 요약

| 파일 | 변경 내용 |
|------|----------|
| `app/services/ai_service.py` | API 키 검증 개선, 로깅 추가, 타임아웃 설정, 에러 처리 강화 |
| `app/main.py` | 서버 시작 시 환경 변수 확인 로그 추가 |
| `app/routers/meetings.py` | 회의록 생성 프로세스 로깅, 에러 처리 개선 |
| `.env.example` | 환경 변수 예시 파일 생성 |

## 체크리스트

디버깅 완료 후 다음 항목을 확인하세요:

- [ ] 서버 시작 시 GEMINI_API_KEY 로드 확인
- [ ] POST /api/meetings 호출 시 로그 출력 확인
- [ ] Gemini API 호출 성공 확인
- [ ] DB 저장 완료 확인
- [ ] 에러 발생 시 명확한 메시지 출력 확인
- [ ] http://localhost:8000/docs 에서 API 문서 접근 가능 확인
