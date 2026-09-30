import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

/**
 * @interface CourseRecord
 * @property {string} course_code - Unique university identifier
 * @property {string} course_name - Full academic name of the course
 * @property {number} credit_hour - Numeric weight of the course
 * @property {number} midterm - Score out of 30
 * @property {number} assignment - Score out of 20
 * @property {number} final_exam - Score out of 50
 * @property {number} total_mark - Combined score out of 100
 */

/**
 * Computes official university grading metrics, letter transformations, 
 * and theme colors matching enterprise dashboard criteria.
 */
const transformGradeSchema = (totalMark) => {
  const mark = Number(totalMark) || 0;
  if (mark >= 85) return { letter: 'A', points: 4.0, status: 'Excellent', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
  if (mark >= 80) return { letter: 'A-', points: 3.75, status: 'Excellent', text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' };
  if (mark >= 75) return { letter: 'B+', points: 3.5, status: 'Very Good', text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' };
  if (mark >= 70) return { letter: 'B', points: 3.0, status: 'Very Good', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
  if (mark >= 65) return { letter: 'B-', points: 2.75, status: 'Good', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
  if (mark >= 60) return { letter: 'C+', points: 2.5, status: 'Satisfactory', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
  if (mark >= 50) return { letter: 'C', points: 2.0, status: 'Pass', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  if (mark >= 45) return { letter: 'D', points: 1.0, status: 'Conditional Pass', text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  return { letter: 'F', points: 0.0, status: 'Fail', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
};

export default function Results() {
  // --- State Configuration Management System ---
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gpa, setGpa] = useState('0.00');
  const [totalCredits, setTotalCredits] = useState(0);
  const [activeCourseCode, setActiveCourseCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Advanced Simulator Functionality ---
  const [simulatedGrades, setSimulatedGrades] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiRequest('/results', { method: 'GET' })
      .then(res => {
        if (!isMounted) return;
        const records = res.results || [];
        setStudentId(res.student_id || 'N/A');

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
        console.error("API Pipeline Failure:", err);
        setError(err.message || 'System error: Unable to aggregate academic schema matrix.');
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);
  // Recalculates GPA values instantly when actual or simulated changes occur
  const calculateCumulativeMetrics = (courseList, simulations) => {
    let pointsSum = 0;
    let creditsSum = 0;

    courseList.forEach(course => {
      const creditHour = Number(course.credit_hour) || 0;
      creditsSum += creditHour;

      // Use simulated mark override if user is explicitly testing performance changes
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

  // Filter list rows based on search parameters
  const filteredResults = results.filter(course => 
    course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCourseRow = (courseCode) => {
    setActiveCourseCode(activeCourseCode === courseCode ? null : courseCode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 gap-4" style={{ backgroundColor: '#030712' }}>
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="text-center font-mono text-xs tracking-widest text-slate-400 uppercase animate-pulse">Syncing Secure Neon Core Nodes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 p-4 sm:p-6 lg:p-10 font-sans antialiased relative overflow-hidden" style={{ backgroundColor: '#030712', minHeight: '100vh' }}>
      
      {/* High-End Ambient Lighting Backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* --- PREMIUM PORTAL HEADER --- */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl transition-all">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              SECURE DECRYPTED SESSION MAPPED
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3">Academic Performance Architecture</h1>
            <p className="text-slate-400 font-mono text-xs mt-1.5 flex items-center gap-2">
              <span>Student ID:</span>
              <span className="text-slate-300 font-bold bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700/40">{studentId}</span>
            </p>
          </div>

          {/* Clean Analytics Scoreboard Container */}
          <div className="flex gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 w-full md:w-auto justify-around shadow-xl">
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">CUMULATIVE GPA</p>
              <p className="text-3xl font-black text-emerald-400 mt-1 tracking-tight">{gpa}</p>
            </div>
            <div className="w-px bg-slate-800/60"></div>
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">TOTAL CREDITS</p>
              <p className="text-3xl font-black text-indigo-400 mt-1 tracking-tight">{totalCredits}</p>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC INTERACTION CONTROLS SUB-BAR --- */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center bg-slate-900/20 p-3 rounded-xl border border-slate-800/30">
          <input 
            type="text"
            placeholder="Search course code or syllabus descriptor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500/80 transition-colors text-slate-200"
          />

          <div className="flex gap-2 shrink-0">
            {isSimulating ? (
              <button onClick={resetSimulation} className="bg-rose-950/40 border border-rose-800/50 hover:bg-rose-900/50 text-rose-400 text-xs font-bold px-3 py-2 rounded-xl transition-all">
                Reset Mock Matrix
              </button>
            ) : (
              <button onClick={() => setIsSimulating(true)} className="bg-indigo-950/40 border border-indigo-900/40 hover:bg-indigo-900/40 text-indigo-400 text-xs font-bold px-3 py-2 rounded-xl transition-all">
                ⚙️ Simulate Target GPA
              </button>
            )}
          </div>
        </div>

        {error && <div className="text-xs font-mono text-rose-400 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 mb-6">{error}</div>}
        {/* --- PREMIUM FINE-LINE LIST MODE VIEW --- */}
        <div className="space-y-3.5">
          {filteredResults.length > 0 ? (
            filteredResults.map((course) => {
              const isExpanded = activeCourseCode === course.course_code;
              
              // Evaluate live mock simulation variables if active
              const currentDisplayedMark = simulatedGrades[course.course_code] !== undefined 
                ? simulatedGrades[course.course_code] 
                : course.total_mark;
                
              const currentGradeState = transformGradeSchema(currentDisplayedMark);

              return (
                <div 
                  key={course.course_code}
                  className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                    isExpanded 
                      ? 'bg-slate-900/80 border-indigo-500/40 shadow-2xl scale-[1.005]' 
                      : 'bg-slate-900/20 border-slate-800/40 hover:border-slate-800 hover:bg-slate-900/40 shadow-md'
                  }`}
                >
                  {/* ACCORDION MAIN PANEL HEADER BANNER */}
                  <div 
                    onClick={() => toggleCourseRow(course.course_code)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      {/* Premium Slim Module Badging */}
                      <div className="text-xs font-mono font-bold bg-slate-950 text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm shrink-0">
                        {course.course_code}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight leading-tight">
                          {course.course_name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{course.credit_hour} Semestral Weight Hours</p>
                      </div>
                    </div>

                    {/* Performance Controls Actions Trigger */}
                    <div className="flex items-center justify-between w-full sm:w-auto border-t border-slate-800/40 sm:border-0 pt-3 sm:pt-0">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded border ${currentGradeState.border} ${currentGradeState.bg} ${currentGradeState.text}`}>
                          {currentGradeState.letter}
                        </span>
                        {simulatedGrades[course.course_code] !== undefined && (
                          <span className="text-[9px] uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono tracking-wider px-1.5 py-0.5 rounded">Mocked</span>
                        )}
                      </div>
                      <button
                        className={`ml-4 px-3 py-1.5 font-mono text-[10px] uppercase rounded-lg transition-all border ${
                          isExpanded 
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                            : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {isExpanded ? 'Collapse ▲' : 'Expand Details ▼'}
                      </button>
                    </div>
                  </div>

                  {/* ✅ NESTED ASSESSMENT MODULE — FEATURING FINE-LINE ULTRA-THIN ALIGNMENT LINES */}
                  {isExpanded && (
                    <div className="bg-slate-950/40 border-t border-slate-800/30 p-5 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        
                        {/* Assessment Vector Block 1 */}
                        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/40 flex justify-between md:flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Continuous Work (20%)</span>
                          <span className="font-mono font-black text-lg text-slate-200 mt-0.5">{course.assignment}</span>
                        </div>
                        
                        {/* Assessment Vector Block 2 */}
                        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/40 flex justify-between md:flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Midterm Assessment (30%)</span>
                          <span className="font-mono font-black text-lg text-slate-200 mt-0.5">{course.midterm}</span>
                        </div>
                        
                        {/* Assessment Vector Block 3 */}
                        <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/40 flex justify-between md:flex-col gap-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Final Examination (50%)</span>
                          <span className="font-mono font-black text-lg text-slate-200 mt-0.5">{course.final_exam}</span>
                        </div>

                        {/* Combined Cumulative Score Container & Prediction Input Slider */}
                        <div className="bg-gradient-to-br from-indigo-950/20 to-slate-900/40 p-4 rounded-xl border border-indigo-500/20 flex flex-col justify-center gap-2">
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <p className="text-[9px] uppercase font-black text-indigo-400 tracking-widest">Aggregate Total</p>
                              <p className="text-xl font-black text-white font-mono mt-0.5">
                                {currentDisplayedMark}<span className="text-xs text-slate-600 font-sans">/100</span>
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 italic uppercase">{currentGradeState.status}</span>
                          </div>

                          {/* Render dynamic slider interaction if simulation workspace tool toggled active */}
                          {isSimulating && (
                            <div className="mt-1 pt-1.5 border-t border-slate-800/60 w-full">
                              <label className="text-[9px] font-mono text-amber-400 block mb-1 uppercase tracking-wide">Adjust Target Grade Simulation:</label>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={currentDisplayedMark} 
                                onChange={(e) => handleSimulationChange(course.course_code, e.target.value)}
                                className="w-full accent-indigo-500 h-1 rounded bg-slate-950 cursor-pointer"
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
            <div className="bg-slate-900/10 border border-slate-800/40 rounded-xl p-12 text-center text-slate-600 font-mono text-xs uppercase tracking-wider">
              No matching module index parameters tracked in query.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
