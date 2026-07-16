import { useEffect, useState } from 'react';
import { apiFetch, getToken } from '../../lib/portalApi';

// `courses` prop: [{ courseId, slug, title, image, totalLessons }] — built statically from content collections.
export default function DashboardCourses({ courses }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(null);

  async function load() {
    try {
      const data = await apiFetch('/progress/summary');
      setSummary(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (getToken()) load();
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!summary) return <p className="text-sm text-slate-500">Loading your courses…</p>;

  const enrolledIds = new Set(summary.enrollments.map(e => e.course_id));
  const completedByCourse = {};
  for (const p of summary.completedLessons) {
    completedByCourse[p.course_id] = (completedByCourse[p.course_id] || 0) + 1;
  }

  const enrolled = courses.filter(c => enrolledIds.has(c.courseId));
  const available = courses.filter(c => !enrolledIds.has(c.courseId));

  async function handleEnroll(courseId) {
    setEnrolling(courseId);
    try {
      await apiFetch('/enrollments', { method: 'POST', body: JSON.stringify({ courseId }) });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnrolling(null);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-4 text-xl font-semibold">Your courses</h2>
        {enrolled.length === 0 && <p className="text-sm text-slate-500">You're not enrolled in anything yet.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrolled.map(c => {
            const done = completedByCourse[c.courseId] || 0;
            const pct = c.totalLessons ? Math.round((done / c.totalLessons) * 100) : 0;
            return (
              <a
                key={c.courseId}
                href={`/portal/courses/${c.slug}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <h3 className="mb-2 font-semibold">{c.title}</h3>
                <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-500">
                  {done} / {c.totalLessons} lessons complete ({pct}%)
                </p>
              </a>
            );
          })}
        </div>
      </div>

      {available.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Available courses</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map(c => (
              <div key={c.courseId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 font-semibold">{c.title}</h3>
                <button
                  onClick={() => handleEnroll(c.courseId)}
                  disabled={enrolling === c.courseId}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {enrolling === c.courseId ? 'Enrolling…' : 'Enroll'}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Self-enroll is open here for simplicity — gate paid courses by removing this button and enrolling
            students via /admin/enroll instead (e.g. from your Stripe webhook on successful payment).
          </p>
        </div>
      )}
    </div>
  );
}
