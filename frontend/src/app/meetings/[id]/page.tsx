'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMeeting, deleteMeeting, type Meeting } from '@/lib/api';

export default function MeetingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
      router.push('/meetings');
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      alert('회의록 삭제에 실패했습니다.');
      setDeleting(false);
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
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700"
          >
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 AI 요약</h2>
              <div className="prose prose-indigo max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {meeting.summary}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {meeting.action_items && meeting.action_items !== '없음' && (
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">✅ 액션 아이템</h2>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📄 원본 회의록</h2>
            <div className="bg-gray-50 p-6 rounded-lg whitespace-pre-wrap text-gray-700">
              {meeting.content}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
