from datetime import datetime
from pydantic import BaseModel, Field


class MeetingCreate(BaseModel):
    title: str = Field(..., max_length=200, min_length=1)
    content: str = Field(..., min_length=10)


class MeetingResponse(BaseModel):
    id: int
    title: str
    content: str
    summary: str | None
    action_items: str | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True
