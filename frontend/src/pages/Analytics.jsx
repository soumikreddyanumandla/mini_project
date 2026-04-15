// src/pages/Analytics.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyticsAPI, exportAPI } from '../services/api';
import { ArrowLeft, Users, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#10b981','#f59e0b',
  '#3b82f6','#ef4444','#14b8a6','#f97316','#84cc16',
];

function MCQChart({ question, isDark }) {
  const labels = question.optionCounts.map(o => o.optionText);
  const data   = question.optionCounts.map(o => o.count);
  const total  = data.reduce((a, b) => a + b, 0);
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div>
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Multiple Choice</span>
        <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{question.questionText}</h3>
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{total} responses</p>
      </div>

      {/* FIX: Pie + Bar in overflow-hidden containers with fixed heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
          <div style={{ width: 180, height: 180 }}>
            <Pie
              data={{ labels, datasets: [{ data, backgroundColor: COLORS.slice(0, labels.length), borderWidth: 0 }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
        {/* FIX: wrap Bar in a fixed height div to prevent overflow */}
        <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
          <Bar
            data={{ labels, datasets: [{ label: 'Responses', data, backgroundColor: COLORS.slice(0, labels.length), borderRadius: 6 }] }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: gridColor }, ticks: { color: tickColor, maxRotation: 30, font: { size: 11 } } },
                y: { grid: { color: gridColor }, ticks: { color: tickColor, stepSize: 1 }, beginAtZero: true },
              },
            }}
          />
        </div>
      </div>

      {/* Option breakdown */}
      <div className="space-y-2 pt-2">
        {question.optionCounts.map((o, i) => (
          <div key={o.optionId} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
            <span className={`text-sm flex-1 truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{o.optionText}</span>
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{o.count}</span>
            <span className={`text-xs w-10 text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {total > 0 ? Math.round((o.count / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingChart({ question, isDark }) {
  const labels    = ['1 ★', '2 ★★', '3 ★★★', '4 ★★★★', '5 ★★★★★'];
  const data      = question.ratingDistribution || [0,0,0,0,0];
  const total     = data.reduce((a,b) => a+b, 0);
  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div>
        <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wider">Rating Question</span>
        <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{question.questionText}</h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-3xl font-bold text-yellow-400">{question.averageRating ?? '—'}</span>
          <div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`text-lg ${n <= Math.round(question.averageRating || 0) ? 'text-yellow-400' : isDark ? 'text-slate-700' : 'text-slate-200'}`}>★</span>
              ))}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{total} responses</p>
          </div>
        </div>
      </div>
      {/* FIX: fixed height container for bar chart */}
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        <Bar
          data={{ labels, datasets: [{ label: 'Responses', data,
            backgroundColor: ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e'],
            borderRadius: 6 }]}}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: gridColor }, ticks: { color: tickColor } },
              y: { grid: { color: gridColor }, ticks: { color: tickColor, stepSize: 1 }, beginAtZero: true },
            },
          }}
        />
      </div>
    </div>
  );
}

function TextAnswers({ question, isDark }) {
  return (
    <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div>
        <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Text Responses</span>
        <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{question.questionText}</h3>
        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{question.textAnswers?.length || 0} responses</p>
      </div>
      {!question.textAnswers?.length ? (
        <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No responses yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {question.textAnswers.map((ans, i) => (
            <div key={i} className={`rounded-lg px-4 py-2.5 text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
              {ans}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    analyticsAPI.getSurveyAnalytics(id)
      .then(r => setData(r.data))
      .catch(() => setError('Could not load analytics.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCsvDownload = async () => {
    setDownloading(true);
    try {
      const res = await exportAPI.downloadCsv(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `survey-${id}-responses.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download CSV.');
    } finally {
      setDownloading(false);
    }
  };

  const card = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className={`rounded-2xl border p-6 h-48 animate-pulse ${card}`}/>)}
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400">{error}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link to="/surveys" className={`transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft size={20}/>
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.surveyTitle}</h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Analytics</p>
          </div>
        </div>
        <button onClick={handleCsvDownload} disabled={downloading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm">
          <Download size={16}/>{downloading ? 'Downloading...' : 'Export CSV'}
        </button>
      </div>

      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${card}`}>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
          <Users size={20}/>
        </div>
        <div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Responses</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.totalResponses}</p>
        </div>
      </div>

      {data.questions.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No questions found.</div>
      ) : (
        <div className="space-y-5">
          {data.questions.map(q => {
            if (q.questionType === 'MCQ')    return <MCQChart    key={q.questionId} question={q} isDark={isDark}/>;
            if (q.questionType === 'RATING') return <RatingChart key={q.questionId} question={q} isDark={isDark}/>;
            return                                  <TextAnswers key={q.questionId} question={q} isDark={isDark}/>;
          })}
        </div>
      )}
    </div>
  );
}
