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
      
      // Calculate total amount spent
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
    setSaveStatus("Budget saved successfully!");
    setTimeout(() => setSaveStatus(""), 4000);
  };

  const remaining = budget - spent;
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  // Simple daily spending math
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

  // Pick dynamic colors depending on limit thresholds
  const getThemeColors = () => {
    if (percentage >= 100) return {
      bar: "from-red-500 to-rose-600 shadow-red-500/30",
      border: "border-red-500/30",
      text: "text-red-400"
    };
    if (percentage >= 80) return {
      bar: "from-amber-400 to-orange-500 shadow-amber-500/30",
      border: "border-amber-500/30",
      text: "text-amber-400"
    };
    return {
      bar: "from-violet-500 via-purple-500 to-indigo-500 shadow-violet-500/30",
      border: "border-violet-500/20",
      text: "text-violet-400"
    };
  };

  const currentTheme = getThemeColors();

  const getInsight = () => {
    if (percentage >= 100) {
      return {
        text: "You have exceeded your budget. Try to cut back on non-essential spending.",
        color: "text-red-400 bg-red-950/20 border-red-500/20",
        icon: "🚨"
      };
    }
    if (percentage >= 80) {
      return {
        text: "You are getting close to your limit. Watch your spending for the rest of the month.",
        color: "text-amber-400 bg-amber-950/20 border-amber-500/20",
        icon: "⚠️"
      };
    }
    return {
      text: "Great job! Your monthly spending looks healthy and is well within your budget.",
      color: "text-emerald-400 bg-emerald-950/20 border-emerald-500/20",
      icon: "✨"
    };
  };

  const insight = getInsight();

  return (
    <div className="min-h-screen bg-[#07070C] text-[#F2F3F7] p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      
      {/* Header */}
      <header className="pb-4 border-b border-[#1C1E27]/60">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-400">Monthly Plan</p>
        <h1 className="text-3xl font-black tracking-tight text-white mt-1">Budget Tracker</h1>
      </header>

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Box 1: Set Limit */}
        <div className="md:col-span-1 border border-[#1C1E27] bg-[#0D0E14] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Set Monthly Limit</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">Enter how much you want to spend this month.</p>
            
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-500 font-bold text-sm">RM</span>
              <input
                type="number"
                value={budget || ""}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-xl border border-[#1C1E27] bg-[#07070C] py-3 pl-12 pr-4 text-lg font-bold text-white focus:border-violet-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={saveBudget}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md active:scale-95 transition-all"
            >
              Save Limit
            </button>
            {saveStatus && (
              <p className="text-center text-[11px] font-medium text-emerald-400 animate-pulse">
                {saveStatus}
              </p>
            )}
          </div>
        </div>

        {/* Box 2: Summary cards */}
        <div className="md:col-span-2 border border-[#1C1E27] bg-[#0D0E14] rounded-2xl p-6 flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Spending Overview</h2>
              <p className="text-xs text-slate-400 mt-1">Track your remaining balance by category.</p>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-[#1C1E27] bg-[#07070C] p-2 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {Object.keys(categoryBreakdown).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <div className="rounded-xl bg-[#07070C]/50 border border-[#1C1E27]/60 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Your Limit</span>
              <p className="mt-1 text-lg font-bold text-white">
                RM {selectedCategory === "All" ? budget.toFixed(2) : "N/A"}
              </p>
            </div>
            
            <div className="rounded-xl bg-[#07070C]/50 border border-[#1C1E27]/60 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Spent</span>
              <p className="mt-1 text-lg font-bold text-violet-400">
                RM {(selectedCategory === "All" ? spent : (categoryBreakdown[selectedCategory] || 0)).toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl bg-[#07070C]/50 border border-[#1C1E27]/60 p-4">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">Remaining</span>
              <p className={`mt-1 text-lg font-bold ${remaining < 0 ? "text-red-400" : "text-emerald-400"}`}>
                {selectedCategory === "All" ? `RM ${remaining.toFixed(2)}` : "Main Pool"}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Progress Bar Progress Tracker */}
      <div className={`rounded-xl border ${currentTheme.border} bg-[#0D0E14] p-6 shadow-md transition-all`}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">Budget Used</h2>
          </div>
          <span className={`rounded-lg bg-[#07070C] border border-[#1C1E27] px-2.5 py-1 text-xs font-bold ${currentTheme.text}`}>
            {percentage.toFixed(1)}% Used
          </span>
        </div>
        
        <div className="relative w-full h-3 rounded-full bg-[#07070C] p-0.5 border border-[#1C1E27] overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${currentTheme.bar} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Forecast & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Forecast Card */}
        <div className="border border-[#1C1E27] bg-[#0D0E14] rounded-2xl p-6 shadow-md">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Spending Estimations</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1C1E27]/60 pb-2">
              <span className="text-xs text-slate-400">Daily Average Spending</span>
              <span className="font-bold text-xs text-white">RM {trackingMetrics.dailySpendingRate.toFixed(2)} / day</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#1C1E27]/60 pb-2">
              <span className="text-xs text-slate-400">Projected Month-End Total</span>
              <span className="font-bold text-sm text-violet-400">RM {trackingMetrics.projectedTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Estimated Days Left</span>
              <span className={`text-xs font-bold ${trackingMetrics.daysRemainingToSpend < 5 ? "text-amber-400" : "text-emerald-400"}`}>
                ~ {trackingMetrics.daysRemainingToSpend} Days left
              </span>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className={`rounded-2xl border p-6 shadow-md backdrop-blur-xl flex flex-col justify-between ${insight.color}`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{insight.icon}</span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">AI Budget Advice</h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">{insight.text}</p>
          </div>
        </div>

      </div>

    </div>
  );
}