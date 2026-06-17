import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { auth } from "../firebase/authService";
import { getDashboardStats, getReceipts } from "../firebase/receiptService";
import { generatePDFReport } from "../services/pdfService";
import StatsCards from "../components/StatsCards";
import AIInsights from "../components/AIInsights";

// DIRECT IMPORT: Pulling your local asset into the React build pipeline
import mascotGif from "../assets/rewards/jorrparivar-practical-totaa.gif";

const CHART_COLORS = ["#6366f1", "#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalExpenses: 0, receiptCount: 0, averageExpense: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Collapse interface control state
  const [chartOpen, setChartOpen] = useState(false);

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
      <div className="flex h-screen w-full items-center justify-center text-zinc-400 text-sm bg-[#0A0A0F]">
        <div className="h-5 w-5 rounded-full border-2 border-zinc-800 border-t-indigo-500 animate-spin mr-3" />
        Loading...
      </div>
    );
  }

  const topCategory = categoryData.length > 0 
    ? [...categoryData].sort((a, b) => b.value - a.value)[0] 
    : null;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto space-y-6 md:space-y-8 pb-24 text-zinc-100">
      
      {/* Clean Top Banner Row without the Ask AI button */}
      <header className="border-b border-zinc-900/80 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-xs text-zinc-400 mt-1">Track and organize your personal expenses</p>
      </header>

      {/* Welcome Hero Card */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-indigo-950/30 via-purple-950/15 to-zinc-900/10 p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-center sm:justify-between gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10 text-center sm:text-left w-full sm:max-w-[70%]">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Summary Card</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-zinc-400 font-medium truncate">
            Logged in as <span className="text-zinc-200">{auth.currentUser?.email}</span>
          </p>
          <p className="text-sm text-zinc-300 pt-1 font-medium leading-relaxed">
            You have spent <span className="text-white font-bold underline decoration-indigo-400 decoration-2">RM {stats.totalExpenses.toFixed(2)}</span> across <span className="text-white font-bold">{stats.receiptCount}</span> receipts.
          </p>
        </div>

        {/* Mascot Frame */}
        <div className="relative shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 shadow-inner overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 via-transparent to-transparent opacity-60" />
          <img 
            src={mascotGif} 
            alt="Waving Mascot" 
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 select-none pointer-events-none"
          />
        </div>
      </section>

      {/* Stats and AI Insights Sections */}
      <div className="space-y-6">
        <StatsCards stats={stats} />
        <AIInsights topCategory={topCategory} stats={stats} />
      </div>

      {/* Spending Breakdown Collapsible Container Panel */}
      <section className="border border-zinc-900 bg-zinc-900/20 rounded-2xl overflow-hidden transition-all duration-300">
        
        {/* Clickable Header Box */}
        <div 
          onClick={() => setChartOpen(!chartOpen)}
          className="p-4 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-zinc-900/10 transition-colors select-none"
        >
          <div>
            <h2 className="text-sm font-bold text-zinc-200">Spending Breakdown</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Your expenses grouped cleanly by categories</p>
          </div>
          <ChevronDown 
            className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${chartOpen ? "rotate-180 text-white" : ""}`} 
          />
        </div>

        {/* Collapsible Content Wrapper Drawer */}
        <div className={`grid transition-all duration-300 ease-in-out ${chartOpen ? "grid-rows-[1fr] opacity-100 p-4 sm:p-6 md:p-8 pt-0 border-t border-zinc-900/60" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`}>
          <div className="overflow-hidden">
            <div className="grid gap-6 lg:grid-cols-12 items-center mt-4">
              
              {/* Responsive Pie Chart Container */}
              <div className="lg:col-span-7 h-[260px] sm:h-[320px] md:h-[400px] w-full flex items-center justify-center relative bg-zinc-900/10 border border-zinc-900/60 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4 text-center">
                  <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-zinc-400">Total Spent</span>
                  <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-0.5 truncate max-w-full">
                    RM {Number(stats.totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="68%"
                      outerRadius="88%"
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                          className="stroke-zinc-950 stroke-[3px] md:stroke-[4px] outline-none transition-all duration-200 hover:opacity-90"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                      itemStyle={{ color: '#a1a1aa' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List Module */}
              <div className="lg:col-span-5 space-y-2 w-full">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1 mb-2">Categories</div>
                {categoryData.length === 0 ? (
                  <div className="text-xs text-zinc-500 py-4 italic">No active data found.</div>
                ) : (
                  <div className="grid gap-2 max-h-[220px] lg:max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                    {categoryData.map((entry, index) => {
                      const computedPct = stats.totalExpenses > 0 ? ((entry.value / stats.totalExpenses) * 100).toFixed(1) : 0;
                      return (
                        <div key={entry.name} className="flex items-center justify-between text-xs bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 rounded-xl p-3 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span className="font-semibold text-zinc-300 truncate">{entry.name}</span>
                          </div>
                          <div className="text-right shrink-0 font-medium text-zinc-200">
                            <span className="font-bold">RM {entry.value.toFixed(2)}</span>
                            <span className="text-zinc-500 ml-1.5 text-[10px] sm:text-[11px]">({computedPct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* History Table Log Area */}
      <section className="border border-zinc-900 bg-zinc-900/20 rounded-2xl p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-zinc-200">Recent Activity</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Your latest uploaded receipts and statements</p>
        </div>

        {recentReceipts.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl text-xs text-zinc-500">
            No receipts found in your history.
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-zinc-900/40">
            <table className="w-full text-left border-collapse min-w-[450px] sm:min-w-0">
              <thead>
                <tr className="border-b border-zinc-900 text-[10px] uppercase tracking-wider text-zinc-400 font-bold bg-zinc-900/10">
                  <th className="p-3 font-medium">Merchant</th>
                  <th className="p-3 font-medium text-center sm:text-left">Category</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs">
                {recentReceipts.map((receipt) => (
                  <tr key={receipt.id} className="group hover:bg-zinc-900/10 transition-all">
                    <td className="p-3 font-semibold text-zinc-200 group-hover:text-white transition-all max-w-[180px] truncate">
                      {receipt.merchant}
                    </td>
                    <td className="p-3 text-center sm:text-left">
                      <span className="inline-block text-[10px] font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                        {receipt.category}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold tracking-tight text-zinc-200 font-mono">
                      RM {Number(receipt.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}