import { useEffect, useState } from "react";
import { getReceipts } from "../firebase/receiptService";

export default function Budget() {
  const [budget, setBudget] = useState(
    Number(localStorage.getItem("monthlyBudget")) || 1000
  );
  const [spent, setSpent] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      const receipts = await getReceipts();
      
      // Calculate overall total spent
      const totalSpent = receipts.reduce(
        (sum, receipt) => sum + Number(receipt.amount || 0),
        0
      );
      setSpent(totalSpent);

      // Group totals by category
      const categories = {};
      receipts.forEach((receipt) => {
        const cat = receipt.category || "Others";
        categories[cat] = (categories[cat] || 0) + Number(receipt.amount || 0);
      });
      setCategoryBreakdown(categories);
    } catch (error) {
      console.error("Failed to load budget data:", error);
    }
  };

  const saveBudget = () => {
    localStorage.setItem("monthlyBudget", budget.toString());
    setSaveStatus("Budget Saved Successfully");
    setTimeout(() => setSaveStatus(""), 4000);
  };

  const remaining = budget - spent;
  
  const percentage = budget > 0 
    ? Math.min((spent / budget) * 100, 100) 
    : 0;

  // Calculate math metrics for daily spending speed
  const getBudgetCalculations = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = totalDaysInMonth - currentDay;

    const dailySpendingRate = spent / currentDay;
    const projectedEndExpenditure = dailySpendingRate * totalDaysInMonth;
    const daysLeftUntilEmpty = dailySpendingRate > 0 ? Math.max(0, remaining / dailySpendingRate) : daysRemaining;

    return {
      dailySpendingRate: dailySpendingRate || 0,
      projectedTotal: projectedEndExpenditure || 0,
      daysRemainingToSpend: Math.floor(daysLeftUntilEmpty)
    };
  };

  const trackingMetrics = getBudgetCalculations();

  const getProgressColor = () => {
    if (percentage >= 100) return "from-red-500 to-rose-600 shadow-red-500/50";
    if (percentage >= 80) return "from-amber-400 to-yellow-500 shadow-amber-500/50";
    return "from-violet-500 to-indigo-600 shadow-indigo-500/50";
  };

  const getInsight = () => {
    if (percentage >= 100) {
      return {
        text: "Budget exceeded. Consider reducing discretionary spending.",
        color: "text-red-400 bg-red-950/20 border-red-500/30",
        icon: "🚨"
      };
    }
    if (percentage >= 80) {
      return {
        text: "You are approaching your monthly budget limit.",
        color: "text-yellow-400 bg-yellow-950/20 border-yellow-500/30",
        icon: "⚠️"
      };
    }
    return {
      text: "Excellent! Your spending remains within a healthy range.",
      color: "text-emerald-400 bg-emerald-950/20 border-emerald-500/30",
      icon: "✨"
    };
  };

  const insight = getInsight();

  return (
    <div className="mx-auto max-w-6xl p-6 text-white animate-fade-in">
      
      {/* Title & Header Segment */}
      <div className="mt-10 mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">Financial Planning</p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight">Budget Tracker</h1>
        <p className="mt-2 text-slate-400">Monitor spending and stay in control</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Panel 1: Set Monthly Budget Limit */}
        <div className="lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-2">Monthly Budget</h2>
            <p className="text-xs text-slate-400 mb-4">Enter your spending limit for the month.</p>
            <div className="relative">
              <span className="absolute left-4 top-4 text-slate-400 font-semibold">RM</span>
              <input
                type="number"
                value={budget || ""}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-xl font-bold text-white placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={saveBudget}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 font-semibold tracking-wide shadow-lg shadow-indigo-600/20 transition hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98]"
            >
              Save Budget
            </button>
            {saveStatus && (
              <p className="mt-3 text-center text-xs font-semibold text-emerald-400 animate-pulse">
                {saveStatus}
              </p>
            )}
          </div>
        </div>

        {/* Panel 2: Spending Summary Numbers */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Monthly Spending Summary</h2>
              <p className="text-xs text-slate-400">Filter your tracking numbers by category.</p>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-medium text-slate-300 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {Object.keys(categoryBreakdown).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <p className="text-xs font-medium text-slate-400">Budget</p>
              <p className="mt-2 text-2xl font-bold">RM {selectedCategory === "All" ? budget.toFixed(2) : "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
              <p className="text-xs font-medium text-slate-400">Total Spent</p>
              <p className="mt-2 text-2xl font-bold text-indigo-300">
                RM {(selectedCategory === "All" ? spent : (categoryBreakdown[selectedCategory] || 0)).toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4 col-span-2 sm:col-span-1">
              <p className="text-xs font-medium text-slate-400">Remaining</p>
              <p className={`mt-2 text-2xl font-bold ${remaining < 0 ? "text-red-400" : "text-green-400"}`}>
                RM {selectedCategory === "All" ? remaining.toFixed(2) : "Main Pool Only"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Core Bar Module */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Budget Usage</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tracking-wider text-violet-300">
            {percentage.toFixed(1)}% Used
          </span>
        </div>
        <div className="relative w-full h-6 rounded-full bg-slate-950/60 p-1 border border-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Advanced Insights & Forecast Estimations */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Card: Spending Rate Estimations */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold tracking-tight mb-4 text-slate-300">Spending Forecast</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-sm text-slate-400">Average Daily Spending</span>
              <span className="font-mono font-bold">RM {trackingMetrics.dailySpendingRate.toFixed(2)} / day</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-sm text-slate-400">Projected Total for Month End</span>
              <span className="font-mono font-bold text-indigo-300">RM {trackingMetrics.projectedTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-sm text-slate-400">Estimated Days Until Empty</span>
              <span className={`font-bold ${trackingMetrics.daysRemainingToSpend < 5 ? "text-amber-400" : "text-emerald-400"}`}>
                ~ {trackingMetrics.daysRemainingToSpend} Days left
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: AI Logic Response Module */}
        <div className={`rounded-3xl border p-6 backdrop-blur-xl flex flex-col justify-between ${insight.color}`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{insight.icon}</span>
              <h2 className="text-lg font-bold tracking-tight">AI Budget Insight</h2>
            </div>
            <p className="text-base leading-relaxed opacity-90">{insight.text}</p>
          </div>
          <div className="mt-6 text-xs opacity-50 font-mono tracking-widest uppercase">
            Status: Fully Checked
          </div>
        </div>
      </div>

    </div>
  );
}