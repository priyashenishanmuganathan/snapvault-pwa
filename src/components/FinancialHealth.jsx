export default function FinancialHealth({

  totalExpenses,

  receiptCount,

  points,

}) {

  let score = 0;

  // Receipt Activity
  if (receiptCount >= 5)
    score += 20;

  if (receiptCount >= 20)
    score += 20;

  // Spending Behaviour
  if (totalExpenses < 500)
    score += 30;

  else if (totalExpenses < 1000)
    score += 20;

  else
    score += 10;

  // Rewards Engagement
  if (points >= 100)
    score += 15;

  if (points >= 500)
    score += 15;

  const status =
    score >= 80

      ? "Excellent"

      : score >= 50

      ? "Good"

      : "Needs Review";

  const color =
    score >= 80

      ? "text-green-400"

      : score >= 50

      ? "text-yellow-400"

      : "text-red-400";

  return (

    <div
      className="
        bg-white/5
        border
        border-white/10
        rounded-3xl
        p-8
        text-center
      "
    >

      <p className="text-slate-400">
        Financial Health
      </p>

      <h1
        className={`
          text-7xl
          font-bold
          mt-3
          ${color}
        `}
      >
        {score}
      </h1>

      <p
        className={`
          mt-2
          ${color}
        `}
      >
        {status}
      </p>

    </div>

  );
}