// src/pages/CreateSurvey.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveyAPI } from '../services/api';
import QuestionBuilder from '../components/QuestionBuilder';
import { PlusCircle, Save } from 'lucide-react';

const emptyQuestion = () => ({
  text: '', questionType: 'TEXT', required: false, orderIndex: 0, options: ['', ''],
});

export default function CreateSurvey() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const addQuestion    = () => setQuestions(q => [...q, emptyQuestion()]);
  const updateQuestion = (idx, updated) => setQuestions(q => q.map((item, i) => i === idx ? updated : item));
  const removeQuestion = (idx) => setQuestions(q => q.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Survey title is required.'); return; }
    for (const [i, q] of questions.entries()) {
      if (!q.text.trim()) { setError(`Question ${i + 1} text is required.`); return; }
      if (q.questionType === 'MCQ' && q.options.filter(o => o.trim()).length < 2) {
        setError(`Question ${i + 1} needs at least 2 options.`); return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map((q, i) => ({
          text: q.text.trim(),
          questionType: q.questionType,
          required: q.required,
          orderIndex: i,
          options: q.questionType === 'MCQ' ? q.options.filter(o => o.trim()) : [],
        })),
      };
      await surveyAPI.create(payload);
      navigate('/surveys');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create survey.');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Survey</h1>
        <p className="text-slate-500 mt-1">Build your survey with questions and options.</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Survey Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Survey Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
            <input type="text" required value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Customer Satisfaction Survey"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700
                rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Optional description for respondents..." rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700
                rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"/>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Questions</h2>
          {questions.map((q, i) => (
            <QuestionBuilder key={i} index={i} question={q}
              onChange={updated => updateQuestion(i, updated)}
              onRemove={() => removeQuestion(i)}
              canRemove={questions.length > 1}/>
          ))}
          <button type="button" onClick={addQuestion}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed
              border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500
              text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400
              rounded-xl py-3 transition text-sm font-medium">
            <PlusCircle size={18}/> Add Question
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/surveys')}
            className="px-5 py-2.5 border border-slate-300 dark:border-slate-700
              text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white
              rounded-lg transition text-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50
              text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm">
            <Save size={16}/>{saving ? 'Saving...' : 'Save Survey'}
          </button>
        </div>
      </form>
    </div>
  );
}
