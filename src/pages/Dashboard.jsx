import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getReceipts } from "../firebase/receiptService";
import { auth, logoutUser } from "../firebase/authService";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#8B5CF6", "#A855F7", "#C084FC", "#6366F1", "#7C3AED", "#9333EA"];

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalExpenses: 0,
    receiptCount: 0,
    averageExpense: 0,
  });

  const [categoryData, setCategoryData] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }
    loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const loadDashboard = async () => {
    const dashboardStats = await getDashboardStats();
    setStats(dashboardStats);

    const receipts = await getReceipts();
    setRecentReceipts(receipts.slice(-5).reverse());

    const categoryTotals = {};
    receipts.forEach((receipt) => {
      const category = receipt.category || "Others";
      const amount = Number(receipt.amount || 0);

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    });

    const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));

    setCategoryData(chartData);
  };

  const topCategory = categoryData.length > 0
    ? [...categoryData].sort((a, b) => b.value - a.value)[0]
    : null;

  return (
    <div className="p-6 text-white max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mt-10 mb-8">
        <div>
          <p className="text-violet-400 text-sm uppercase tracking-widest">
            Smart Receipt Management
          </p>
          <h1 className="text-5xl font-bold tracking-tight mt-2">SnapVault</h1>
          <p className="text-slate-400 mt-2">{auth.currentUser?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-2xl transition"
        >
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
          <p className="text-slate-400">Total Expenses</p>
          <h2 className="text-4xl font-bold mt-3">RM {stats.totalExpenses.toFixed(2)}</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
          <p className="text-slate-400">Receipts</p>
          <h2 className="text-4xl font-bold mt-3">{stats.receiptCount}</h2>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
          <p className="text-slate-400">Average Spend</p>
          <h2 className="text-4xl font-bold mt-3">RM {stats.averageExpense.toFixed(2)}</h2>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-8">
        <h2 className="text-2xl font-bold mb-6">Spending Breakdown</h2>
        <div style={{ width: "100%", height: 350 }}>
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
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Spending Insight */}
      <div className="bg-white/5 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-6 mt-8">
        <h2 className="text-2xl font-bold mb-3">AI Spending Insight</h2>
        {topCategory ? (
          <p className="text-lg text-slate-300">
            Most spending goes to{" "}
            <span className="text-violet-400 font-bold">{topCategory.name}</span> with{" "}
            <span className="text-white font-bold">RM {topCategory.value.toFixed(2)}</span>
          </p>
        ) : (
          <p>No receipts found.</p>
        )}
      </div>

      {/* Recent Receipts Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Receipts</h2>
        {recentReceipts.length === 0 ? (
          <p>No receipts found.</p>
        ) : (
          <div className="space-y-4">
            {recentReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-black/20 border border-white/5 rounded-2xl p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">{receipt.merchant}</p>
                  <span className="bg-violet-500/15 text-violet-300 px-3 py-1 rounded-full text-xs">
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
    </div>
  );
}