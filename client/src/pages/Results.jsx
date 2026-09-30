// client/src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export default function Results() {
  const [data, setData] = useState({ results: [], gpa: "0.00", total_credits: 0, student_id: '' });
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Executing the named apiRequest handler to fetch student records
    apiRequest('get', '/results/my-results')
      .then(res => {
        setData(res.data || res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load academic records:", err);
        setLoading(false);
      });
  }, []);

  // Keyboard shortcut: Press 'ESC' to close the active detail modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveCourse(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center font-mono text-slate-400 animate-pulse">
          Connecting to Neon cluster engines...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Overview Analytics Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h1 className="text-3xl font-black text-white">Academic Performance Portal</h1>
          <p className="text-slate-400 font-mono text-sm mt-1">
            Logged ID: <span className="text-indigo-400">{data?.student_id || 'N/A'}</span>
          </p>
        </div>
        <div className="flex gap-6 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Current GPA</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{data?.gpa || "0.00"}</p>
          </div>
          <div className="w-px bg-slate-800"></div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Total Credits</p>
            <p className="text-3xl font-black text-indigo-400 mt-1">{data?.total_credits || 0}</p>
          </div>
        </div>
      </div>{/* Courses Cards Grid Layout */}
      {data?.results && data.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.results.map((course) => (
            <div 
              key={course.course_code} 
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/10">
                    {course.course_code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium font-mono">{course.credit_hour} Cr.Hrs</span>
                </div>
                <h3 className="text-xl font-bold mt-4 mb-6 text-white leading-snug line-clamp-2 h-14">
                  {course.course_name}
                </h3>
              </div>
              
              <button
                onClick={() => setActiveCourse(course)}
                className="w-full bg-slate-800 hover:bg-indigo-600 hover:text-white transition-all text-slate-300 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700/50 hover:border-indigo-500"
              >
                👁️ See Result
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-mono">
          No academic records registered for this student session.
        </div>
      )}

      {/* Grade Details Drawer Component */}
      {activeCourse && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity"
          onClick={() => setActiveCourse(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">{activeCourse.course_name}</h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {activeCourse.course_code} — {activeCourse.credit_hour} Credit Hours
                </p>
              </div>
              <span className={`text-2xl font-black font-mono px-3 py-1 rounded-xl ${
                activeCourse.letter_grade === 'F' 
                  ? 'bg-red-500/10 text-red-400' 
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {activeCourse.letter_grade}
              </span>
            </div>
            
            <div className="space-y-3.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Midterm Exam (30%)</span>
                <span className="font-mono font-bold text-white">{activeCourse.midterm}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Continuous Assignment (20%)</span>
                <span className="font-mono font-bold text-white">{activeCourse.assignment}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Final Examination (50%)</span>
                <span className="font-mono font-bold text-white">{activeCourse.final_exam}</span>
              </div>
              <div className="h-px bg-slate-800 my-2"></div>
              <div className="flex justify-between items-center text-base font-bold">
                <span className="text-indigo-400">Total Score Aggregated</span>
                <span className="font-mono text-white text-lg">{activeCourse.total_mark}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveCourse(null)}
              className="mt-5 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-all border border-slate-700/40"
            >
              Dismiss Record View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}