import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/portalApi';

// `courseId` + `modules` ([{id,title,lessons:[{id,title,duration,hasQuiz}]}]) come from
// the static content collection via Astro props.
export default function CourseProgress({ courseId, courseSlug, modules }) {
  const [completed, setCompleted] = useState(null);
  const [enrolled, setEnrolled] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/progress/summary');
        const isEnrolled = data.enrollments.some(e => e.course_id === courseId);
        setEnrolled(isEnrolled);
        setCompleted(new Set(data.completedLessons.filter(p => p.course_id === courseId).map(p => p.lesson_id)));
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [courseId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (completed === null) return <p className="text-sm text-slate-500">Loading…</p>;

  if (!enrolled) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="text-sm text-amber-800">You're not enrolled in this course yet.</p>
        <a href="/portal/dashboard" className="mt-2 inline-block text-sm font-semibold text-primary">
          Back to dashboard →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map(mod => (
        <div key={mod.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 font-semibold">{mod.title}</h3>
          <ul className="space-y-2">
            {mod.lessons.map(lesson => {
              const done = completed.has(lesson.id);
              return (
                <li key={lesson.id}>
                  <a
                    href={`/portal/lessons/${courseSlug}/${lesson.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                          done ? 'bg-green-500 text-white' : 'border border-slate-300 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      {lesson.title}
                      {lesson.hasQuiz && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">Quiz</span>}
                    </span>
                    <span className="text-xs text-slate-400">{lesson.duration}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
