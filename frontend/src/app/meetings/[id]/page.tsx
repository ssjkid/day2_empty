'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMeeting, deleteMeeting, updateMeeting, type Meeting } from '@/lib/api';

export default function MeetingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [regenerateSummary, setRegenerateSummary] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadMeeting();
  }, [params.id]);

  const loadMeeting = async () => {
    try {
      const data = await getMeeting(Number(params.id));
      setMeeting(data);
    } catch (error) {
      console.error('Failed to load meeting:', error);
      alert('회의록을 불러오는데 실패했습니다.');
      router.push('/meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 회의록을 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteMeeting(Number(params.id));
      alert('회의록이 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      alert('회의록 삭제에 실패했습니다.');
      setDeleting(false);
    }
  };

  const handleEditClick = () => {
    if (!meeting) return;
    setEditTitle(meeting.title);
    setEditContent(meeting.content);
    setRegenerateSummary(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
    setRegenerateSummary(false);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setUpdating(true);
    try {
      const updatedMeeting = await updateMeeting(Number(params.id), {
        title: editTitle,
        content: editContent,
        regenerate_summary: regenerateSummary,
      });
      setMeeting(updatedMeeting);
      setIsEditing(false);
      alert('회의록이 수정되었습니다.');
    } catch (error) {
      console.error('Failed to update meeting:', error);
      alert('회의록 수정에 실패했습니다.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            ← 목록으로
          </button>
          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="text-indigo-600 hover:text-indigo-700 px-4 py-2"
              >
                수정
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 px-4 py-2"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {isEditing ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">회의록 수정</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="회의록 제목을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="회의 내용을 입력하세요"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="regenerate-summary"
                  checked={regenerateSummary}
                  onChange={(e) => setRegenerateSummary(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
                />
                <label htmlFor="regenerate-summary" className="ml-2 text-sm text-gray-700">
                  요약 재생성 (AI가 수정된 내용을 바탕으로 요약을 다시 생성합니다)
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400"
                >
                  {updating ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {meeting.title}
                </h1>
                <p className="text-sm text-gray-400">
                  {new Date(meeting.created_at).toLocaleString('ko-KR')}
                </p>
              </div>

          {meeting.summary && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                {/* 스파클 아이콘 (AI 요약) */}
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800">AI 요약</h2>
              </div>
              <div className="prose prose-indigo max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {meeting.summary}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {meeting.action_items && meeting.action_items !== '없음' && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                {/* 체크리스트 아이콘 (액션 아이템) */}
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800">액션 아이템</h2>
              </div>
              <div className="prose prose-indigo max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => (
                      <table className="min-w-full divide-y divide-gray-200 border" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase border" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border" {...props} />
                    ),
                  }}
                >
                  {meeting.action_items}
                </ReactMarkdown>
              </div>
            </div>
          )}

              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  {/* 문서 아이콘 (원본 회의록) */}
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800">원본 회의록</h2>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-gray-700">
                  {meeting.content}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
