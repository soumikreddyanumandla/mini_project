// src/pages/SurveySuccess.jsx
import { Link } from 'react-router-dom';
export default function SurveySuccess() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">Thank you!</h1>
        <p className="text-slate-400">Your response has been recorded successfully.</p>
      </div>
    </div>
  );
}
