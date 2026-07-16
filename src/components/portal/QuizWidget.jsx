import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/portalApi';

export default function QuizWidget({ courseId, lessonId, nextHref }) {
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/courses/${courseId}/lessons/${lessonId}/quiz`);
        setQuestions(data.questions);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [courseId, lessonId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = await apiFetch(`/courses/${courseId}/lessons/${lessonId}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!questions) return <p className="text-sm text-slate-500">Loading quiz…</p>;
  if (questions.length === 0) return null;

  if (result) {
    return (
      <div className={`rounded-xl border p-6 ${result.passed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
        <p className="mb-1 text-lg font-semibold">{result.passed ? '✓ Passed' : 'Not quite there yet'}</p>
        <p className="mb-4 text-sm text-slate-600">Score: {result.score}% (70% required to pass)</p>
        {!result.passed && (
          <button onClick={() => { setResult(null); setAnswers({}); }} className="text-sm font-semibold text-primary hover:underline">
            Try again
          </button>
        )}
        {result.passed && nextHref && (
          <a href={nextHref} className="text-sm font-semibold text-primary hover:underline">
            Next lesson →
          </a>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold">Knowledge check</h3>
      {questions.map((q, i) => (
        <div key={q.id}>
          <p className="mb-2 text-sm font-medium">
            {i + 1}. {q.question}
          </p>
          <div className="space-y-1.5">
            {q.options.map((opt, idx) => (
              <label key={idx} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <input
                  type="radio"
                  name={q.id}
                  required
                  checked={answers[q.id] === idx}
                  onChange={() => setAnswers(a => ({ ...a, [q.id]: idx }))}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        type="submit"
        disabled={submitting || Object.keys(answers).length !== questions.length}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit answers'}
      </button>
    </form>
  );
}
