'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMeetings, searchMeetings, type Meeting } from '@/lib/api';

export default function Home() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      loadMeetings();
      return;
    }

    setSearching(true);
    try {
      const data = await searchMeetings(query);
      setMeetings(data);
    } catch (error) {
      console.error('Error searching meetings:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

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

        {/* 검색 입력창 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="회의록 검색... (제목 또는 내용)"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </div>
        </div>

        {meetings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            {/* Empty State 일러스트 */}
            <svg className="w-48 h-48 mx-auto mb-6 animate-bounce" style={{animationDuration: '3s'}} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 문서 */}
              <rect x="50" y="30" width="100" height="130" rx="8" fill="#E0E7FF" stroke="#6366F1" strokeWidth="2"/>
              <line x1="70" y1="60" x2="130" y2="60" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round"/>
              <line x1="70" y1="80" x2="130" y2="80" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round"/>
              <line x1="70" y1="100" x2="110" y2="100" stroke="#A5B4FC" strokeWidth="3" strokeLinecap="round"/>
              {/* 펜 */}
              <path d="M140 140 L160 120 L170 130 L150 150 Z" fill="#6366F1"/>
              <path d="M138 142 L148 152 L145 158 Z" fill="#4F46E5"/>
            </svg>
            <p className="text-xl text-gray-600 font-medium">회의록이 없습니다.</p>
            <p className="text-gray-500 mt-2">첫 회의록을 작성해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start gap-4">
                  {/* 문서 아이콘 */}
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {meeting.title}
                    </h2>
                    {meeting.summary && (
                      <p className="text-gray-600 line-clamp-2">{meeting.summary}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-4">
                      {/* 캘린더 아이콘 */}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(meeting.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
