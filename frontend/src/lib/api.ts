// API 호출 함수

export interface Meeting {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  action_items: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateMeetingRequest {
  title: string;
  content: string;
}

// 회의록 목록 조회
export async function getMeetings(): Promise<Meeting[]> {
  const res = await fetch('/api/meetings');
  if (!res.ok) {
    throw new Error('Failed to fetch meetings');
  }
  return res.json();
}

// 회의록 상세 조회
export async function getMeeting(id: number): Promise<Meeting> {
  const res = await fetch(`/api/meetings/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch meeting');
  }
  return res.json();
}

// 회의록 생성
export async function createMeeting(data: CreateMeetingRequest): Promise<Meeting> {
  const res = await fetch('/api/meetings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create meeting');
  }
  return res.json();
}

// 회의록 삭제
export async function deleteMeeting(id: number): Promise<void> {
  const res = await fetch(`/api/meetings/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete meeting');
  }
}
