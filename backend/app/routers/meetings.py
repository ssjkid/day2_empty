from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.meeting_record import MeetingRecord
from app.schemas.meeting_record import MeetingCreate, MeetingResponse
from app.services.ai_service import generate_summary

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


@router.post("", response_model=MeetingResponse, status_code=201)
async def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    """회의록 생성 + AI 요약"""
    try:
        print(f"📝 회의록 생성 요청: {meeting.title}")

        # AI 요약 생성
        summary, action_items = await generate_summary(meeting.content)
        print(f"✅ AI 요약 완료 (요약 길이: {len(summary)})")

        # DB 저장
        db_meeting = MeetingRecord(
            title=meeting.title,
            content=meeting.content,
            summary=summary,
            action_items=action_items
        )
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)

        print(f"✅ DB 저장 완료 (ID: {db_meeting.id})")
        return db_meeting

    except Exception as e:
        print(f"❌ 회의록 생성 실패: {type(e).__name__}: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"회의록 생성 중 오류 발생: {str(e)}"
        )


@router.get("", response_model=list[MeetingResponse])
def get_meetings(db: Session = Depends(get_db)):
    """회의록 목록 조회 (최신순)"""
    return db.query(MeetingRecord).order_by(MeetingRecord.created_at.desc()).all()


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """회의록 상세 조회"""
    meeting = db.query(MeetingRecord).filter(MeetingRecord.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


@router.delete("/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    """회의록 삭제"""
    meeting = db.query(MeetingRecord).filter(MeetingRecord.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return {"message": "Meeting deleted successfully"}
