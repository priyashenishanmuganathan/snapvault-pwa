export default function AIInsights({
  topCategory,
  stats,
}) {

  return (

    <div
      className="
        bg-gradient-to-r
        from-violet-500/10
        to-indigo-500/10

        border
        border-violet-500/20

        rounded-3xl

        p-6
      "
    >

      <h2 className="text-2xl font-bold mb-4">
        AI Insights
      </h2>

      <div className="space-y-3">

        <div>
          📈 Highest spending category:
          {" "}
          <span className="text-violet-300">
            {topCategory?.name || "N/A"}
          </span>
        </div>

        <div>
          💰 Potential savings:
          RM150/month
        </div>

        <div>
          🎯 Average spend:
          RM {stats.averageExpense.toFixed(2)}
        </div>

      </div>

    </div>

  );
}