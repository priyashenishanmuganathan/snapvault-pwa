import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { auth, logoutUser } from "../firebase/authService";
import { getDashboardStats, getReceipts } from "../firebase/receiptService";
import { generatePDFReport } from "../services/pdfService";
import HeroSection from "../components/HeroSection";
import StatsCards from "../components/StatsCards";
import FinancialHealth from "../components/FinancialHealth";
import AIInsights from "../components/AIInsights";

const COLORS = ["#8B5CF6", "#A855F7", "#C084FC", "#6366F1", "#7C3AED", "#9333EA"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalExpenses: 0, receiptCount: 0, averageExpense: 0 });
  const [categoryData, setCategoryData] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Standard Firebase observer pattern prevents race conditions on initial page load
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        loadDashboard();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const dashboardStats = await getDashboardStats();
      const receipts = await getReceipts();
      
      setStats(dashboardStats);
      setRecentReceipts(receipts.slice(-5).reverse());

      // Parse and aggregate categories
      const categoryTotals = {};
      receipts.forEach((receipt) => {
        const category = receipt.category || "Others";
        const amount = Number(receipt.amount || 0);
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });

      const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
      setCategoryData(chartData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-slate-950">
        <div className="text-xl font-medium animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  const topCategory = categoryData.length > 0 
    ? [...categoryData].sort((a, b) => b.value - a.value)[0] 
    : null;

  return (
    <div className="mx-auto max-w-7xl p-6 text-white">
      {/* Top Action Buttons */}
      <div className="mb-6 flex justify-end gap-3">
        <button
          onClick={() => generatePDFReport(stats, categoryData, recentReceipts)}
          className="rounded-2xl bg-green-600 px-5 py-3 transition hover:bg-green-500 font-medium"
        >
          Export PDF
        </button>
        <button
          onClick={() => navigate("/ai-chat")}
          className="rounded-2xl bg-indigo-600 px-5 py-3 transition hover:bg-indigo-500 font-medium"
        >
          AI Assistant
        </button>
        <button
          onClick={handleLogout}
          className="rounded-2xl bg-violet-600 px-5 py-3 transition hover:bg-violet-500 font-medium"
        >
          Logout
        </button>
      </div>

      {/* Hero Header */}
      <HeroSection
        email={auth.currentUser?.email}
        totalExpenses={stats.totalExpenses}
        receiptCount={stats.receiptCount}
      />

      {/* Metrics Layout */}
      <StatsCards stats={stats} />

      {/* Analytical Components */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <FinancialHealth />
        <AIInsights topCategory={topCategory} stats={stats} />
      </div>

      {/* Data Visualization Breakdown */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-6 text-2xl font-bold">Spending Breakdown</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction History Activity */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-2xl font-bold">Recent Activity</h2>
        {recentReceipts.length === 0 ? (
          <p className="text-gray-400">No receipts found.</p>
        ) : (
          <div className="space-y-4">
            {recentReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-violet-500/20"
              >
                <div>
                  <p className="text-lg font-semibold">{receipt.merchant}</p>
                  <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-300">
                    {receipt.category}
                  </span>
                </div>
                <div className="text-xl font-bold">
                  RM {Number(receipt.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Persistent AI Trigger Button */}
      <button
        onClick={() => navigate("/ai-chat")}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 shadow-2xl shadow-violet-500/30 transition-all hover:scale-105"
      >
        ✨ AI
      </button>
    </div>
  );
}