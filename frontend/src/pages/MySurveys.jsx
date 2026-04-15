// src/pages/MySurveys.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { surveyAPI, exportAPI } from '../services/api';
import { PlusCircle, BarChart2, Edit2, Trash2, Globe, EyeOff, Copy, Check, Download } from 'lucide-react';

export default function MySurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const load = () => surveyAPI.getAll().then(r => setSurveys(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleTogglePublish = async (id) => { await surveyAPI.togglePublish(id); load(); };
  const handleDelete = async (id) => {
    if (!confirm('Delete this survey and all its responses?')) return;
    await surveyAPI.delete(id); load();
  };
  const copyLink = (publicId) => {
    navigator.clipboard.writeText(`${window.location.origin}/survey/${publicId}`);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const handleCsvDownload = async (id) => {
    setDownloadingId(id);
    try {
      const res = await exportAPI.downloadCsv(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `survey-${id}-responses.csv`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Failed to download CSV.'); }
    finally { setDownloadingId(null); }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 h-24 animate-pulse"/>)}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Surveys</h1>
          <p className="text-slate-500 mt-1">{surveys.length} survey{surveys.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/surveys/create"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm">
          <PlusCircle size={16}/> New Survey
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-6 py-16 text-center">
          <p className="text-slate-500">No surveys yet.</p>
          <Link to="/surveys/create" className="text-indigo-500 text-sm mt-2 inline-block">Create your first survey →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map(s => (
            <div key={s.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5
                flex flex-col sm:flex-row sm:items-center justify-between gap-4
                hover:border-slate-300 dark:hover:border-slate-700 transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-white truncate">{s.title}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0
                    ${s.published ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {s.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">{s.responseCount} responses</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {s.published && (
                  <button onClick={() => copyLink(s.publicId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition">
                    {copiedId === s.publicId ? <><Check size={13} className="text-emerald-500"/> Copied</> : <><Copy size={13}/> Copy link</>}
                  </button>
                )}
                <Link to={`/analytics/${s.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition">
                  <BarChart2 size={13}/> Analytics
                </Link>
                <button onClick={() => handleCsvDownload(s.id)} disabled={downloadingId === s.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition disabled:opacity-50">
                  <Download size={13}/>{downloadingId === s.id ? '...' : 'CSV'}
                </button>
                <Link to={`/surveys/edit/${s.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition">
                  <Edit2 size={13}/> Edit
                </Link>
                <button onClick={() => handleTogglePublish(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
                    ${s.published
                      ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : 'bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-500'}`}>
                  {s.published ? <><EyeOff size={13}/> Unpublish</> : <><Globe size={13}/> Publish</>}
                </button>
                <button onClick={() => handleDelete(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition">
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
