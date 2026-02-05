'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Meeting {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  created_at: string;
}

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/meetings')
      .then((res) => res.json())
      .then((data) => {
        setMeetings(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching meetings:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">회의록 목록</h1>
          <Link
            href="/meetings/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            새 회의록 작성
          </Link>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-gray-500">회의록이 없습니다. 첫 회의록을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {meeting.title}
                </h2>
                {meeting.summary && (
                  <p className="text-gray-600 line-clamp-2">{meeting.summary}</p>
                )}
                <p className="text-sm text-gray-400 mt-4">
                  {new Date(meeting.created_at).toLocaleDateString('ko-KR')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
