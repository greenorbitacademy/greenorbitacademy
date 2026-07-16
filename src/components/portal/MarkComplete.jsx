import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/portalApi';

export default function MarkComplete({ courseId, lessonId, nextHref }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/progress/summary');
        setDone(data.completedLessons.some(p => p.course_id === courseId && p.lesson_id === lessonId));
      } catch {
        /* ignore — button still works */
      }
    })();
  }, [courseId, lessonId]);

  async function handleClick() {
    setLoading(true);
    setError('');
    try {
      await apiFetch(`/progress/lessons/${lessonId}/complete`, { method: 'POST', body: JSON.stringify({ courseId }) });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleClick}
        disabled={loading || done}
        className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-70 ${
          done ? 'bg-green-600' : 'bg-primary hover:opacity-90'
        }`}
      >
        {done ? '✓ Completed' : loading ? 'Saving…' : 'Mark lesson complete'}
      </button>
      {nextHref && (
        <a href={nextHref} className="text-sm font-medium text-primary hover:underline">
          Next lesson →
        </a>
      )}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
