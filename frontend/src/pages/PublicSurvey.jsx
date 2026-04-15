// src/pages/PublicSurvey.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n} type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="text-3xl transition-transform hover:scale-110 focus:outline-none"
        >
          <span className={
            n <= (hovered || value)
              ? 'text-yellow-400'
              : 'text-slate-300'
          }>★</span>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm text-slate-500 self-center">{value}/5</span>
      )}
    </div>
  );
}

export default function PublicSurvey() {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicAPI.getSurvey(publicId)
      .then(r => {
        setSurvey(r.data);
        const init = {};
        r.data.questions.forEach(q => { init[q.id] = ''; });
        setAnswers(init);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [publicId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    for (const q of survey.questions) {
      if (q.required && !answers[q.id]?.toString().trim()) {
        setError(`Please answer: "${q.text}"`); return;
      }
    }
    setSubmitting(true);
    try {
      await publicAPI.submitResponse(publicId, {
        answers,
        respondentEmail: email.trim() || null,
      });
      navigate('/survey/success');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-400 text-sm">Loading survey...</div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Survey Not Found</h1>
        <p className="text-slate-500 text-sm">This survey doesn't exist or is no longer available.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Survey header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm mb-4">S</div>
          <h1 className="text-2xl font-bold text-slate-900">{survey.title}</h1>
          {survey.description && (
            <p className="text-slate-500 mt-2">{survey.description}</p>
          )}
          <p className="text-slate-400 text-xs mt-4">
            {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Questions */}
          {survey.questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-indigo-500 font-semibold text-sm flex-shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-slate-800 font-medium">
                  {q.text}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </p>
              </div>

              {/* TEXT */}
              {q.questionType === 'TEXT' && (
                <textarea
                  value={answers[q.id] || ''}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="Share your thoughts or suggestions..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5
                    text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                    focus:ring-indigo-400 transition resize-none text-sm"
                />
              )}

              {/* MCQ */}
              {q.questionType === 'MCQ' && (
                <div className="space-y-2 ml-5">
                  {q.options.map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={String(opt.id)}
                        checked={answers[q.id] === String(opt.id)}
                        onChange={() => setAnswers(a => ({ ...a, [q.id]: String(opt.id) }))}
                        className="text-indigo-600 focus:ring-indigo-400 border-slate-300"
                      />
                      <span className="text-slate-700 text-sm group-hover:text-slate-900 transition">
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* RATING */}
              {q.questionType === 'RATING' && (
                <div className="ml-5">
                  <StarRating
                    value={Number(answers[q.id]) || 0}
                    onChange={val => setAnswers(a => ({ ...a, [q.id]: String(val) }))}
                  />
                  {answers[q.id] && (
                    <p className="text-xs text-slate-400 mt-1">
                      {{1:'Poor',2:'Fair',3:'Good',4:'Very Good',5:'Excellent'}[answers[q.id]]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Optional email */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-slate-700 font-medium text-sm mb-1">
              📧 Get a copy of your response <span className="text-slate-400 font-normal">(optional)</span>
            </p>
            <p className="text-slate-400 text-xs mb-3">
              Enter your email and we'll send you a confirmation with your answers.
            </p>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5
                text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                focus:ring-indigo-400 transition text-sm"
            />
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
              disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition text-sm shadow-md">
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs pb-6">Powered by SurveyFlow</p>
      </div>
    </div>
  );
}
