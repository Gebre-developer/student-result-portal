import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

/**
 * Computes official university grading metrics, letter transformations, 
 * and vivid neon glowing metrics matching high-end tactical analytics interfaces.
 */
const transformGradeSchema = (totalMark) => {
  const mark = Number(totalMark) || 0;
  if (mark >= 85) return { letter: 'A', points: 4.0, status: 'EXCELLENT PERFORMANCE', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' };
  if (mark >= 80) return { letter: 'A-', points: 3.75, status: 'EXCELLENT PERFORMANCE', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', glow: 'shadow-[0_0_20px_rgba(20,184,166,0.15)]' };
  if (mark >= 75) return { letter: 'B+', points: 3.5, status: 'VERY GOOD STANDING', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]' };
  if (mark >= 70) return { letter: 'B', points: 3.0, status: 'VERY GOOD STANDING', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', glow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]' };
  if (mark >= 65) return { letter: 'B-', points: 2.75, status: 'GOOD STANDING', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' };
  if (mark >= 60) return { letter: 'C+', points: 2.5, status: 'SATISFACTORY CREDIT', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' };
  if (mark >= 50) return { letter: 'C', points: 2.0, status: 'PASS MATRICULATION', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' };
  if (mark >= 45) return { letter: 'D', points: 1.0, status: 'CONDITIONAL PASS', text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' };
  return { letter: 'F', points: 0.0, status: 'ACADEMIC DEFICIENCY (FAIL)', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/40', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]' };
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gpa, setGpa] = useState('0.00');
  const [totalCredits, setTotalCredits] = useState(0);
  const [activeCourseCode, setActiveCourseCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulatedGrades, setSimulatedGrades] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiRequest('/results', { method: 'GET' })
      .then(res => {
        if (!isMounted) return;
        const records = res.dataPayload?.results || res.results || [];
        setStudentId(res.student_id || 'UNKNOWN NODE');

        const processedRecords = records.map(course => {
          const transformed = transformGradeSchema(course.total_mark);
          return { ...course, ...transformed };
        });

        setResults(processedRecords);
        calculateCumulativeMetrics(processedRecords, {});
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error("API Processing Fault:", err);
        setError(err.message || 'System error: Unable to map database indices.');
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const calculateCumulativeMetrics = (courseList, simulations) => {
    let pointsSum = 0;
    let creditsSum = 0;

    courseList.forEach(course => {
      const creditHour = Number(course.credit_hour) || 0;
      creditsSum += creditHour;

      const markToEvaluate = simulations[course.course_code] !== undefined 
        ? simulations[course.course_code] 
        : course.total_mark;

      const evaluated = transformGradeSchema(markToEvaluate);
      pointsSum += (evaluated.points * creditHour);
    });

    setTotalCredits(creditsSum);
    setGpa(creditsSum > 0 ? (pointsSum / creditsSum).toFixed(2) : '0.00');
  };

  const handleSimulationChange = (courseCode, newMark) => {
    const sanitizedMark = Math.min(Math.max(Number(newMark) || 0, 0), 100);
    const updatedSimulations = { ...simulatedGrades, [courseCode]: sanitizedMark };
    setSimulatedGrades(updatedSimulations);
    calculateCumulativeMetrics(results, updatedSimulations);
  };

  const resetSimulation = () => {
    setSimulatedGrades({});
    setIsSimulating(false);
    calculateCumulativeMetrics(results, {});
  };

  const filteredResults = results.filter(course => 
    course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCourseRow = (courseCode) => {
    setActiveCourseCode(activeCourseCode === courseCode ? null : courseCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 gap-4" style={{ backgroundColor: '#030712' }}>
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-center font-mono text-xs tracking-widest text-slate-400 uppercase animate-pulse">Decrypting Academic Core Nodes...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen text-slate-200 p-4 sm:p-6 lg:p-10 font-sans antialiased relative overflow-hidden w-full selection:bg-indigo-500/30 selection:text-indigo-200" style={{ backgroundColor: '#030712' }}>
      
      {/* High-End Vector Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-5%] w-[450px] h-[450px] bg-purple-500/[0.02] rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* --- PREMIUM PORTAL ARCHITECTURE HEADER --- */}
        <div className="backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] transition-all" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div>
            <div className="inline-flex items-center gap-2 border font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', borderColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              SECURE QUANTUM SESSION ACTIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text">Academic Performance Matrix</h1>
            <p className="text-slate-400 font-mono text-xs mt-2 flex items-center gap-2">
              <span className="text-slate-500">STUDENT IDENTIFIER:</span>
              <span className="text-indigo-400 font-bold px-2 py-0.5 rounded border border-slate-800" style={{ backgroundColor: 'rgba(15,23,42,0.8)' }}>{studentId}</span>
            </p>
          </div>

          {/* Core Telemetry Indicators */}
          <div className="flex gap-6 p-4 rounded-xl border border-slate-800/80 w-full md:w-auto justify-around shadow-inner backdrop-blur-md" style={{ backgroundColor: 'rgba(2, 6, 23, 0.6)' }}>
            <div className="text-center px-4">
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">CUMULATIVE GPA</p>
              <p className="text-3xl font-black text-emerald-400 mt-1 tracking-tighter font-mono filter drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]">{gpa}</p>
            </div>
            <div className="w-px bg-slate-800/80 self-stretch"></div>
            <div className="text-center px-4">
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest">CREDITS REGISTERED</p>
              <p className="text-3xl font-black text-indigo-400 mt-1 tracking-tighter font-mono filter drop-shadow-[0_0_10px_rgba(129,140,248,0.2)]">{totalCredits}</p>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC INTERACTION CONTROL DECK --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center p-3 rounded-xl border border-slate-800/40" style={{ backgroundColor: 'rgba(15, 23, 42, 0.2)' }}>
          <input 
            type="text"
            placeholder="Filter by course code or descriptor keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500/50 transition-all text-slate-200 shadow-inner"
            style={{ backgroundColor: 'rgba(2, 6, 23, 0.8)' }}
          />

          <div className="flex gap-2 shrink-0 w-full sm:w-auto">
            {isSimulating ? (
              <button onClick={resetSimulation} className="w-full sm:w-auto bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-xl transition-all font-mono">
                Reset Predictive Workspace
              </button>
            ) : (
              <button onClick={() => setIsSimulating(true)} className="w-full sm:w-auto bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-xl transition-all font-mono flex items-center justify-center gap-1.5">
                ⚡ Initialize GPA Simulator
              </button>
            )}
          </div>
        </div>

        {error && <div className="text-xs font-mono text-rose-400 p-4 rounded-xl border border-rose-500/20 mb-6 shadow-inner" style={{ backgroundColor: 'rgba(244,63,94,0.02)' }}>{error}</div>}

        {/* --- PREMIUM TRANS-LUCENT GRID FEEDER ROWS --- */}
        <div className="space-y-4">
        {filteredResults.length > 0 ? (
            filteredResults.map((course) => {
              const isExpanded = activeCourseCode === course.course_code;
              const currentDisplayedMark = simulatedGrades[course.course_code] !== undefined ? simulatedGrades[course.course_code] : course.total_mark;
              const currentGradeState = transformGradeSchema(currentDisplayedMark);

              return (
                <div 
                  key={course.course_code}
                  className={`rounded-2xl overflow-hidden border transition-all duration-300 ${isExpanded ? 'border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-slate-900/40' : 'border-slate-800/60 hover:border-slate-700/80 shadow-md bg-slate-900/10 hover:bg-slate-900/20'}`}
                >
                  {/* MASTER ACCORDION HEAD BLOCK */}
                  <div 
                    onClick={() => toggleCourseRow(course.course_code)}
                    className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="text-xs font-mono font-bold bg-slate-950 text-indigo-400 px-3 py-2 rounded-xl border border-slate-800 shadow-inner shrink-0 tracking-wider">
                        {course.course_code}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-white tracking-tight leading-tight truncate">{course.course_name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono mt-1 tracking-wide">{course.credit_hour} SEMESTRAL CR. HOURS</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto border-t border-slate-800/40 sm:border-0 pt-3 sm:pt-0">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-black px-3 py-1 rounded border tracking-wider transition-all duration-300 ${currentGradeState.border} ${currentGradeState.bg} ${currentGradeState.text} ${currentGradeState.glow}`}>
                          GRADE {currentGradeState.letter}
                        </span>
                        {simulatedGrades[course.course_code] !== undefined && (
                          <span className="text-[9px] uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono tracking-widest px-2 py-0.5 rounded-md animate-pulse">PREDICTED</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCourseRow(course.course_code); }}
                        className={`ml-4 px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase rounded-xl transition-all border ${isExpanded ? 'bg-indigo-600/10 text-indigo-300 border-indigo-500/30' : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:bg-slate-800/50 hover:text-slate-200'}`}
                      >
                        {isExpanded ? 'Hide ▲' : 'Inspect ▼'}
                      </button>
                    </div>
                  </div>

                  {/* ULTRA-THIN ALIGNED ASSESSMENT SUB-GRID VECTORS */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/40 p-5 animate-fade-in" style={{ backgroundColor: 'rgba(2, 6, 23, 0.4)' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                        
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 flex justify-between sm:flex-col gap-1 shadow-inner">
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono">Continuous Assessment</span>
                          <span className="font-mono font-black text-xl text-slate-100 mt-1">{course.assignment ?? 0}<span className="text-xs text-slate-600 font-normal"> / 20</span></span>
                        </div>
                        
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 flex justify-between sm:flex-col gap-1 shadow-inner">
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono">Midterm Examination</span>
                          <span className="font-mono font-black text-xl text-slate-100 mt-1">{course.midterm ?? 0}<span className="text-xs text-slate-600 font-normal"> / 30</span></span>
                        </div>
                        
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 flex justify-between sm:flex-col gap-1 shadow-inner">
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono">Final Examination</span>
                          <span className="font-mono font-black text-xl text-slate-100 mt-1">{course.final_exam ?? 0}<span className="text-xs text-slate-600 font-normal"> / 50</span></span>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900/50 p-4 rounded-xl border border-indigo-500/20 flex flex-col justify-center gap-2 shadow-md">
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-indigo-400 tracking-widest font-mono">Aggregate Sum</p>
                              <p className="text-2xl font-black text-white font-mono mt-0.5">{currentDisplayedMark}<span className="text-xs text-slate-500 font-sans font-normal">/100</span></p>
                            </div>
                          </div>
                          <p className={`text-[9px] font-mono font-black tracking-wider uppercase border-t border-slate-800/60 pt-1.5 ${currentGradeState.text}`}>{currentGradeState.status}</p>

                          {isSimulating && (
                            <div className="mt-1 pt-1.5 border-t border-slate-800/40 w-full animate-fade-in">
                              <label className="text-[8px] font-mono text-amber-400 block mb-1 uppercase tracking-widest font-bold">Simulate Grade Scaling:</label>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={currentDisplayedMark} 
                                onChange={(e) => handleSimulationChange(course.course_code, e.target.value)}
                                className="w-full accent-indigo-500 h-1 rounded-lg bg-slate-950 cursor-pointer border border-slate-800"
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-slate-900/10 border border-slate-800/40 rounded-2xl p-16 text-center text-slate-500 font-mono text-xs uppercase tracking-widest shadow-inner">
              No parameters found matching the query context.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
