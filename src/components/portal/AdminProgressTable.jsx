import { useEffect, useState } from 'react';
import { apiFetch, getStoredUser } from '../../lib/portalApi';

// `courses` prop: [{ courseId, title, totalLessons }] from the static content collection.
export default function AdminProgressTable({ courses }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (user && user.role !== 'admin') {
      setError('Admin access required.');
      return;
    }
    (async () => {
      try {
        const res = await apiFetch('/admin/progress');
        setData(res);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;

  const courseById = Object.fromEntries(courses.map(c => [c.courseId, c]));

  // Group enrollments by student
  const byStudent = {};
  for (const e of data.enrollments) {
    byStudent[e.user_id] ??= { name: e.name, email: e.email, courses: {} };
    byStudent[e.user_id].courses[e.course_id] = { enrolledAt: e.enrolled_at, completed: 0 };
  }
  for (const p of data.progress) {
    const student = byStudent[p.user_id];
    if (student?.courses[p.course_id]) student.courses[p.course_id].completed += 1;
  }

  const rows = Object.values(byStudent);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Student</th>
            {courses.map(c => (
              <th key={c.courseId} className="px-4 py-3 text-left font-semibold">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((student, i) => (
            <tr key={i}>
              <td className="px-4 py-3">
                <div className="font-medium">{student.name}</div>
                <div className="text-xs text-slate-400">{student.email}</div>
              </td>
              {courses.map(c => {
                const enrollment = student.courses[c.courseId];
                if (!enrollment) return <td key={c.courseId} className="px-4 py-3 text-slate-300">—</td>;
                const total = courseById[c.courseId]?.totalLessons || 0;
                const pct = total ? Math.round((enrollment.completed / total) * 100) : 0;
                return (
                  <td key={c.courseId} className="px-4 py-3">
                    <div className="mb-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">
                      {enrollment.completed}/{total} ({pct}%)
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
