import os
from pathlib import Path
from dotenv import load_dotenv

# .env 파일 로드 (다른 모듈 import 전에 먼저 실행!)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import examples, meetings

# 환경 변수 로드 확인
print("=" * 50)
print("[SERVER] Starting...")
print(f"[PATH] Working directory: {os.getcwd()}")
groq_key = os.getenv("GROQ_API_KEY")
if groq_key:
    print(f"[OK] GROQ_API_KEY loaded (length: {len(groq_key)})")
else:
    print("[WARN] GROQ_API_KEY is not set.")
    print("       Create .env file and add GROQ_API_KEY=your_key")
print("=" * 50)

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Module 5 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(examples.router)
app.include_router(meetings.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI 서버가 정상 작동 중입니다."}
