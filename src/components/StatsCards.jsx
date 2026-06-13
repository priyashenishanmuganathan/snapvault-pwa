export default function StatsCards({
  stats,
}) {
  const cards = [
    {
      title: "Total Expenses",
      value: `RM ${stats.totalExpenses.toFixed(2)}`,
    },
    {
      title: "Receipts",
      value: stats.receiptCount,
    },
    {
      title: "Average Spend",
      value: `RM ${stats.averageExpense.toFixed(2)}`,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-5">

      {cards.map((card) => (

        <div
          key={card.title}
          className="
            bg-white/5

            backdrop-blur-xl

            border
            border-white/10

            hover:border-violet-500/30

            hover:shadow-xl
            hover:shadow-violet-500/10

            transition-all

            rounded-3xl

            p-6
          "
        >

          <p className="text-slate-400">
            {card.title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {card.value}
          </h2>

        </div>

      ))}

    </div>
  );
}