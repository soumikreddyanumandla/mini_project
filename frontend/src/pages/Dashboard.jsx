// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { surveyAPI } from '../services/api';
import { ClipboardList, Globe, Inbox, PlusCircle, ArrowRight } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22}/>
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([surveyAPI.getDashboardStats(), surveyAPI.getAll()])
      .then(([s, sv]) => { setStats(s.data); setSurveys(sv.data.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Hello, {admin?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your surveys.</p>
        </div>
        <Link to="/surveys/create"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-lg transition text-sm">
          <PlusCircle size={16}/> New Survey
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 h-24 animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={ClipboardList} label="Total Surveys"   value={stats?.totalSurveys}    color="bg-indigo-500/20 text-indigo-400"/>
          <StatCard icon={Globe}         label="Published"        value={stats?.publishedSurveys} color="bg-emerald-500/20 text-emerald-400"/>
          <StatCard icon={Inbox}         label="Total Responses"  value={stats?.totalResponses}   color="bg-violet-500/20 text-violet-400"/>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recent Surveys</h2>
          <Link to="/surveys" className="text-indigo-500 hover:text-indigo-400 text-sm flex items-center gap-1">
            View all <ArrowRight size={14}/>
          </Link>
        </div>
        {surveys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClipboardList className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={36}/>
            <p className="text-slate-500">No surveys yet.</p>
            <Link to="/surveys/create" className="text-indigo-500 hover:text-indigo-400 text-sm mt-2 inline-block">
              Create your first survey →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {surveys.map(s => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">{s.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{s.responseCount} responses</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                  ${s.published ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {s.published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
