export default function AIInsights({
  topCategory,
  stats,
}) {

  return (
    <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-6 relative overflow-hidden">
      {/* Subtle light arc backing layer */}
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
      
      {/* Header Container */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-4 mb-5">
        <span className="text-sm">✨</span>
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          AI Insights
        </h2>
      </div>

      {/* Row Metrics Grid Layout */}
      <div className="grid gap-4 sm:grid-cols-3">

        {/* Highest Spending Category */}
        <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl flex items-center gap-3.5 transition-all">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-indigo-400 shadow-inner shrink-0">
            📈
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Highest spending category</span>
            <span className="text-sm font-semibold text-zinc-200 truncate block mt-0.5">
              {topCategory?.name || "N/A"}
            </span>
          </div>
        </div>

        {/* Potential Savings */}
        <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl flex items-center gap-3.5 transition-all">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-emerald-400 shadow-inner shrink-0">
            💰
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Potential savings</span>
            <span className="text-sm font-bold text-zinc-200 block mt-0.5 font-mono tracking-tight">
              RM150/month
            </span>
          </div>
        </div>

        {/* Average Spend */}
        <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl flex items-center gap-3.5 transition-all">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-amber-400 shadow-inner shrink-0">
            🎯
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Average spend</span>
            <span className="text-sm font-bold text-zinc-200 block mt-0.5 font-mono tracking-tight">
              RM {stats.averageExpense.toFixed(2)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}