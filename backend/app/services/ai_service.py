import os
from groq import Groq
from typing import Tuple

# Groq API 설정
api_key = os.getenv("GROQ_API_KEY")
client = None

if api_key:
    client = Groq(api_key=api_key)
    print(f"[OK] Groq API key loaded (length: {len(api_key)})")
else:
    print("[WARN] GROQ_API_KEY is not set.")


async def generate_summary(content: str) -> Tuple[str, str]:
    """
    회의록을 3줄 요약 + 액션 아이템 추출 (Groq Llama 사용)

    Returns:
        (summary, action_items) - 마크다운 형식
    """
    if not client:
        return "AI 요약 기능이 비활성화되어 있습니다. (GROQ_API_KEY 없음)", "없음"

    prompt = f"""다음 회의록을 분석해주세요:

{content[:2000]}

요청사항:
1. 3줄 요약: 주요 논의 내용을 3개의 핵심 포인트로 정리
2. 액션 아이템: '담당자', '작업 내용', '기한' 형식으로 추출 (없으면 "없음")

출력 형식 (반드시 준수):
## 3줄 요약
- 포인트 1
- 포인트 2
- 포인트 3

## 액션 아이템
| 담당자 | 작업 내용 | 기한 |
|--------|----------|------|
| 홍길동 | API 설계 | 2024-02-15 |
"""

    try:
        print("[AI] Groq API call started...")

        # Groq API 호출 (Llama 3.3 70B 모델 사용)
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            max_tokens=500,
            temperature=0.3,
        )

        result = chat_completion.choices[0].message.content
        print(f"[OK] Groq API response success (length: {len(result)})")

        # 요약과 액션 아이템 분리
        parts = result.split("## 액션 아이템")
        summary = parts[0].replace("## 3줄 요약", "").strip()
        action_items = parts[1].strip() if len(parts) > 1 else "없음"

        return summary, action_items

    except Exception as e:
        print(f"[ERROR] AI summary failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return f"AI 요약 생성 실패: {str(e)}", "없음"
