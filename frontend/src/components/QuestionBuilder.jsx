// src/components/QuestionBuilder.jsx
import { Trash2, PlusCircle } from 'lucide-react';

const TYPES = [
  { key: 'TEXT',   label: '✏️ Text'           },
  { key: 'MCQ',    label: '☑️ Multiple Choice' },
  { key: 'RATING', label: '⭐ Rating (1–5)'    },
];

export default function QuestionBuilder({ index, question, onChange, onRemove, canRemove }) {
  const update = (field, value) => onChange({ ...question, [field]: value });
  const updateOption = (i, val) => {
    const opts = [...question.options]; opts[i] = val; update('options', opts);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 cursor-pointer select-none">
            <input type="checkbox" checked={question.required}
              onChange={e => update('required', e.target.checked)}
              className="rounded border-slate-400 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"/>
            Required
          </label>
          {canRemove && (
            <button type="button" onClick={onRemove}
              className="text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={16}/>
            </button>
          )}
        </div>
      </div>

      {/* Question text */}
      <input type="text" value={question.text}
        onChange={e => update('text', e.target.value)}
        placeholder="Enter your question..."
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700
          rounded-lg px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>

      {/* Type buttons */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => update('questionType', key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition
              ${question.questionType === key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}>
            {label}
          </button>
        ))}
      </div>

      {/* MCQ options */}
      {question.questionType === 'MCQ' && (
        <div className="space-y-2 mt-1">
          <p className="text-xs text-slate-500 font-medium">Options</p>
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-slate-600 flex-shrink-0"/>
              <input type="text" value={opt} onChange={e => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700
                  rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"/>
              {question.options.length > 2 && (
                <button type="button"
                  onClick={() => update('options', question.options.filter((_, idx) => idx !== i))}
                  className="text-slate-400 hover:text-red-500 transition flex-shrink-0">
                  <Trash2 size={14}/>
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => update('options', [...question.options, ''])}
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-400 transition font-medium mt-1">
            <PlusCircle size={14}/> Add option
          </button>
        </div>
      )}

      {/* RATING preview */}
      {question.questionType === 'RATING' && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-2">Preview — respondents will see:</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => <span key={n} className="text-2xl text-yellow-400 cursor-default">★</span>)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Respondent clicks a star from 1 to 5</p>
        </div>
      )}

      {/* TEXT preview */}
      {question.questionType === 'TEXT' && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs text-slate-500">
          Respondents will type a free-text suggestion or comment.
        </div>
      )}
    </div>
  );
}
