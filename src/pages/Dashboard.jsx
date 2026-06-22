import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { auth } from "../firebase/authService";
import { getDashboardStats, getReceipts } from "../firebase/receiptService";
import { generatePDFReport } from "../services/pdfService"; // Imported PDF generator module
import StatsCards from "../components/StatsCards";
import AIInsights from "../components/AIInsights";

import mascotGif from "../assets/rewards/oh-hiiii-oh-hi.gif";

const CHART_COLORS = ["#5B8CFF", "#9B6BFF", "#3DD6C2", "#FFB454", "#FF6B81", "#6E7385"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalExpenses: 0, receiptCount: 0, averageExpense: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
      else loadDashboard();
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      const receipts = await getReceipts();

      setStats(dashboardStats);
      setRecentReceipts(receipts.slice(-6).reverse());

      const categoryTotals = {};
      receipts.forEach((receipt) => {
        const category = receipt.category || "Others";
        const amount = Number(receipt.amount || 0);
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      setCategoryData(Object.entries(categoryTotals).map(([name, value]) => ({ name, value })));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#07070C]">
        <div className="flex items-center gap-3 text-[#5C6072] text-xs font-mono uppercase tracking-[0.2em]">
          <div className="h-4 w-4 rounded-full border-2 border-[#1C1E27] border-t-[#5B8CFF] animate-spin" />
          Synchronizing Neural Matrix
        </div>
      </div>
    );
  }

  const sortedCategories = [...categoryData].sort((a, b) => b.value - a.value);
  const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;
  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F2F3F7] selection:bg-[#5B8CFF]/30 overflow-x-hidden relative">
      {/* Global CSS Style Injection for Perfect Interface Scrollers */}
      <style>{`
        .custom-ledger-scroll::-webkit-scrollbar { width: 4px; }
        .custom-ledger-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-ledger-scroll::-webkit-scrollbar-thumb { background: #1C1E27; border-radius: 10px; }
        .custom-ledger-scroll::-webkit-scrollbar-thumb:hover { background: #5B8CFF/30; }
      `}</style>

      {/* High-Fidelity Deep Ambient Illumination Matrices */}
      <div className="pointer-events-none fixed -top-64 left-1/3 w-[800px] h-[600px] bg-[#5B8CFF]/[0.06] blur-[150px] rounded-full z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-64 w-[600px] h-[500px] bg-[#9B6BFF]/[0.04] blur-[130px] rounded-full z-0" />

      <div className="relative p-4 sm:p-6 md:p-8 lg:p-10 max-w-6xl mx-auto space-y-6 z-10 pb-24">
        
        {/* ── Dynamic Control Deck Header ── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-[#1C1E27]/40 relative group">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D0E14] to-[#07070C] border border-[#1C1E27] p-1.5 flex items-center justify-center shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <img src={mascotGif} alt="" className="w-10 h-10 object-contain select-none pointer-events-none" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#3DD6C2] border-2 border-[#07070C] flex items-center justify-center shadow-[0_0_10px_#3DD6C2]">
                <span className="w-1 h-1 rounded-full bg-white animate-ping" />
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#5C6072] flex items-center gap-2">
                <span className="text-[#3DD6C2] font-bold">ONLINE</span>
                <span>•</span>
                <span>SYSTEM ENVIRONMENT</span>
                <span>•</span>
                <span className="text-[#9498A8]">{dateLabel}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mt-0.5">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F2F3F7] to-[#9498A8]">{auth.currentUser?.email?.split("@")[0]}</span>
              </h1>
            </div>
          </div>

          {/* Quick Metrics Stream Deck Layout */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-gradient-to-r from-[#0D0E14] to-[#0D0E14]/40 border border-[#1C1E27] rounded-xl p-2.5 px-5 self-start md:self-auto backdrop-blur-md shadow-lg group-hover:border-[#5B8CFF]/30 transition-colors duration-300">
            <div className="text-right">
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#5C6072] block">AGGREGATE TRACKED</span>
              <span className="text-base font-black font-mono text-[#5B8CFF] tracking-tight">RM {stats.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="w-px h-8 bg-[#1C1E27] mx-2 hidden sm:block" />
            <div>
              <span className="text-[8px] font-mono uppercase tracking-widest text-[#5C6072] block">LOGGED INVENTORY</span>
              <span className="text-sm font-bold font-mono text-white block mt-0.5">{stats.receiptCount} Units</span>
            </div>
            <div className="w-px h-8 bg-[#1C1E27] mx-2 hidden sm:block" />
            
            {/* Integrated Vector Ledger PDF Action Trigger */}
            <button
              onClick={() => generatePDFReport(stats, categoryData, recentReceipts)}
              className="rounded-lg bg-[#1C1E27] hover:bg-[#5B8CFF]/10 border border-[#1C1E27] hover:border-[#5B8CFF]/30 px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider text-zinc-300 hover:text-[#5B8CFF] transition-all duration-200 active:scale-95 outline-none"
            >
              📋 EXPORT REPORT
            </button>
          </div>
        </header>

        {/* ── Submodules Framework ── */}
        <div className="space-y-4">
          <StatsCards stats={stats} />
          <AIInsights topCategory={topCategory} stats={stats} />
        </div>

        {/* ── Central Control Workspace Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── Left Grid Block: Interactive Allocation Distribution Chart (7 Columns) ── */}
          <section className="lg:col-span-7 border border-[#1C1E27] bg-gradient-to-b from-[#0D0E14] to-[#0D0E14]/70 rounded-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#5B8CFF]/30 via-[#9B6BFF]/20 to-transparent" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono text-[11px] tracking-widest">Expense Vector Allocation</h2>
                <p className="text-xs text-[#5C6072] mt-0.5">Asset deployment across core operational classes</p>
              </div>
              {topCategory && (
                <div className="bg-[#5B8CFF]/5 border border-[#5B8CFF]/20 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#5B8CFF] block leading-none">PEAK OUTFLOW</span>
                  <span className="text-xs font-black text-white mt-1 block tracking-wide">{topCategory.name}</span>
                </div>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-12 items-center">
              <div className="sm:col-span-5 h-[200px] w-full flex items-center justify-center relative select-none">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 text-center">
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-[#5C6072]">TOTAL NET</span>
                  <span className="text-lg font-black font-mono tracking-tighter text-white mt-0.5">
                    RM {Number(stats.totalExpenses).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="76%"
                      outerRadius="100%"
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          className="stroke-[#0D0E14] stroke-[4px] outline-none transition-all duration-300 hover:opacity-75 cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#07070C", border: "1px solid #1C1E27", borderRadius: "12px", color: "#F2F3F7", fontSize: "11px", fontFamily: "monospace" }}
                      itemStyle={{ color: "#9498A8" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Advanced Interactive Ledger Readout */}
              <div className="sm:col-span-7 w-full self-center">
                {categoryData.length === 0 ? (
                  <div className="text-xs text-[#5C6072] py-6 italic text-center font-mono tracking-wide">Telemetry pool uninitialized.</div>
                ) : (
                  <div className="max-h-[210px] overflow-y-auto space-y-1.5 pr-1 custom-ledger-scroll">
                    {sortedCategories.map((entry, index) => {
                      const pct = stats.totalExpenses > 0 ? (entry.value / stats.totalExpenses) * 100 : 0;
                      const color = CHART_COLORS[categoryData.findIndex(c => c.name === entry.name) % CHART_COLORS.length];
                      return (
                        <div key={entry.name} className="py-2 px-2.5 rounded-xl hover:bg-[#1C1E27]/40 border border-transparent hover:border-[#1C1E27]/40 transition-all duration-200 group/row">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-sm transition-transform group-hover/row:scale-125" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                              <span className="font-semibold text-[#9498A8] group-hover/row:text-[#F2F3F7] truncate transition-colors duration-150">{entry.name}</span>
                            </div>
                            <div className="shrink-0 flex items-baseline gap-2 font-mono ml-2">
                              <span className="font-bold text-white">RM {entry.value.toFixed(2)}</span>
                              <span className="text-[#5C6072] text-[10px] font-medium w-8 text-right">{pct.toFixed(0)}%</span>
                            </div>
                          </div>
                          <div className="h-[3px] rounded-full bg-[#1C1E27] overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Right Grid Block: High-Precision Activity Ledger Terminal (5 Columns) ── */}
          <section className="lg:col-span-5 border border-[#1C1E27] bg-gradient-to-b from-[#0D0E14] to-[#0D0E14]/70 rounded-2xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#9B6BFF]/30 to-transparent" />
            
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono text-[11px] tracking-widest">Real-time Node Activity</h2>
                <p className="text-xs text-[#5C6072] mt-0.5">Chronological ingestion log</p>
              </div>
              <div className="flex items-center gap-2 bg-[#3DD6C2]/10 border border-[#3DD6C2]/20 px-2.5 py-0.5 rounded-md">
                <span className="w-1 h-1 rounded-full bg-[#3DD6C2] animate-ping" />
                <span className="text-[9px] font-mono font-bold text-[#3DD6C2] uppercase tracking-wider">Stream</span>
              </div>
            </div>

            {recentReceipts.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#1C1E27] rounded-xl text-xs text-[#5C6072] font-mono tracking-wide">
                No active payload assets captured.
              </div>
            ) : (
              <div className="space-y-2 max-h-[235px] overflow-y-auto pr-1 custom-ledger-scroll">
                {recentReceipts.map((receipt) => (
                  <div key={receipt.id} className="group/item flex items-center justify-between p-3 bg-[#07070C]/50 border border-[#1C1E27]/60 hover:border-[#5B8CFF]/30 hover:bg-[#07070C] transition-all duration-200 rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="max-w-[75px] text-[8px] font-mono font-bold uppercase tracking-wide text-[#9498A8] bg-[#1C1E27]/50 border border-[#1C1E27] px-2 py-0.5 rounded-md truncate shrink-0 group-hover/item:border-[#1C1E27] group-hover/item:text-white transition-colors">
                        {receipt.category}
                      </div>
                      <span className="text-xs font-semibold text-[#D5D7E0] group-hover/item:text-white truncate transition-colors">
                        {receipt.merchant}
                      </span>
                    </div>
                    <span className="text-xs font-black font-mono text-white shrink-0 ml-3 tracking-tight group-hover/item:text-[#5B8CFF] transition-colors">
                      RM {Number(receipt.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}