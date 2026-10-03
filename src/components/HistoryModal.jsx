import React, { useState, useEffect, useMemo } from 'react';
import { History, X, Award, Clock, ShieldCheck, RefreshCw, BarChart2, TrendingUp, Target, Brain } from 'lucide-react';
import { fetchInterviewHistory } from '../services/supabaseService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function HistoryModal({ isOpen, onClose, onOpenAuth }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'analytics'

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    const { history: data, error: err } = await fetchInterviewHistory();
    if (err) {
      setError(err);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  // Analytics Calculations
  const analyticsData = useMemo(() => {
    if (!history || history.length === 0) return null;
    
    // Sort chronological (oldest to newest for charting)
    const sorted = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    const chartData = sorted.map((h, i) => ({
      name: `Int ${i + 1}`,
      date: new Date(h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: h.overall_score || 0
    }));

    const totalInterviews = history.length;
    const avgScore = Math.round(history.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / totalInterviews);
    
    const hiringDecisions = history.reduce((acc, curr) => {
      const dec = curr.hiring_decision || 'Pending';
      acc[dec] = (acc[dec] || 0) + 1;
      return acc;
    }, {});
    
    const hireCount = (hiringDecisions['Hire'] || 0) + (hiringDecisions['Strong Hire'] || 0);
    const passRate = Math.round((hireCount / totalInterviews) * 100);

    return { chartData, totalInterviews, avgScore, passRate };
  }, [history]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 border border-[#EAE6DF] shadow-2xl relative max-h-[85vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 ease-out">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FCF9EE] to-[#F5DE98] border border-[#EEDD9E] flex items-center justify-center text-[#855E15] shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>Performance Center</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Cloud Sync
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Track your mock interview scores, growth trends, and hiring verdicts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-gray-100/80 rounded-xl">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 cursor-pointer'
            }`}
          >
            <Clock className="w-4 h-4" />
            Past Interviews
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-[#855E15] shadow-sm border border-[#EEDD9E]/50'
                : 'text-gray-500 hover:text-[#855E15] hover:bg-[#F5DE98]/20 cursor-pointer'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Analytics & Insights
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[300px]">
          {loading ? (
            <div className="py-16 text-center space-y-3 flex flex-col items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Fetching your performance data...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-2 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800">
              <p className="text-xs font-semibold">{error}</p>
              <p className="text-[11px] text-amber-700">
                Run <code className="px-1.5 py-0.5 bg-white rounded border text-gray-900 font-mono">supabase/mockmate_schema.sql</code> in your Supabase SQL Editor.
              </p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center space-y-3 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm mb-2">
                <Award className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-base font-bold text-gray-700">No Data Available Yet</p>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Complete your first mock interview to unlock your detailed scorecard and growth analytics.
              </p>
              {onOpenAuth && (
                <div className="pt-4">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth('signup');
                    }}
                    className="px-5 py-2.5 text-sm font-bold text-white gold-gradient-btn rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5 hover:scale-105 transition-transform"
                  >
                    <span>Sign Up to Start Tracking</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* HISTORY TAB VIEW */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  {history.map((item) => {
                    const role = item.target_role || 'Software Engineer';
                    const name = item.candidate_name || 'Candidate';
                    const score = item.overall_score || 0;
                    const decision = item.hiring_decision || 'Pending';
                    const dateStr = item.created_at
                      ? new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Recent';

                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50/50 hover:bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] hover:shadow-md transition-all flex items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{role}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-200/80 text-gray-600">
                              {item.interview_type}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {dateStr}
                            </span>
                            <span>•</span>
                            <span>Duration: {item.duration_formatted}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1 justify-end mb-1">
                              <span className="text-xl font-black text-gray-900 group-hover:text-[#855E15] transition-colors">{score}</span>
                              <span className="text-xs font-bold text-gray-400">/100</span>
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg ${
                              decision.includes('Strong Hire')
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : decision.includes('Hire')
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {decision}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ANALYTICS TAB VIEW */}
              {activeTab === 'analytics' && analyticsData && (
                <div className="space-y-6 pb-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Sessions</span>
                      </div>
                      <div className="text-3xl font-black text-gray-900">{analyticsData.totalInterviews}</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-[#FCF9EE]/50 to-white border border-[#EEDD9E]/50 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-xs font-bold uppercase tracking-wider">Avg Score</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-[#855E15]">{analyticsData.avgScore}</span>
                        <span className="text-sm font-bold text-[#A87D1B]/50">/100</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                      <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Brain className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider">Hire Rate</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-emerald-700">{analyticsData.passRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart Section */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#D4AF37]" />
                      Performance Trend (Overall Score)
                    </h4>
                    <div className="h-56 w-full">
                      {analyticsData.chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analyticsData.chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                              dataKey="date" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                              dy={10}
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ color: '#855E15', fontWeight: 'bold' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#D4AF37" 
                              strokeWidth={3}
                              fillOpacity={1} 
                              fill="url(#colorScore)" 
                              activeDot={{ r: 6, fill: '#855E15', stroke: '#fff', strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <TrendingUp className="w-8 h-8 mb-2 text-gray-300" />
                          <p className="text-sm font-semibold">Not enough data</p>
                          <p className="text-xs">Complete at least 2 interviews to see your trend.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-gray-500">Row Level Security (RLS) Protected</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
