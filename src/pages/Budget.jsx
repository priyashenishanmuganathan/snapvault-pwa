import { useEffect, useState } from "react";

import {
  getReceipts,
} from "../firebase/receiptService";

export default function Budget() {

  const [budget, setBudget] =
    useState(
      Number(
        localStorage.getItem(
          "monthlyBudget"
        )
      ) || 1000
    );

  const [spent, setSpent] =
    useState(0);

  useEffect(() => {

    loadBudgetData();

  }, []);

  const loadBudgetData =
    async () => {

      const receipts =
        await getReceipts();

      const totalSpent =
        receipts.reduce(
          (sum, receipt) =>
            sum +
            Number(
              receipt.amount || 0
            ),
          0
        );

      setSpent(totalSpent);
    };

  const saveBudget = () => {

    localStorage.setItem(
      "monthlyBudget",
      budget
    );

    alert(
      "Budget Saved Successfully"
    );
  };

  const remaining =
    budget - spent;

  const percentage =
    budget > 0
      ? Math.min(
          (spent / budget) * 100,
          100
        )
      : 0;

  const getProgressColor = () => {

    if (
      percentage >= 100
    ) {
      return "bg-red-500";
    }

    if (
      percentage >= 80
    ) {
      return "bg-yellow-500";
    }

    return "bg-violet-500";
  };

  const getInsight = () => {

    if (
      percentage >= 100
    ) {

      return {
        text:
          "Budget exceeded. Consider reducing discretionary spending.",
        color:
          "text-red-400",
      };
    }

    if (
      percentage >= 80
    ) {

      return {
        text:
          "You are approaching your monthly budget limit.",
        color:
          "text-yellow-400",
      };
    }

    return {
      text:
        "Excellent! Your spending remains within a healthy range.",
      color:
        "text-green-400",
    };
  };

  const insight =
    getInsight();

  return (

    <div className="p-6 text-white max-w-6xl mx-auto">

      <div className="mt-10 mb-8">

        <p
          className="
            text-violet-400
            uppercase
            tracking-widest
            text-sm
          "
        >
          Financial Planning
        </p>

        <h1
          className="
            text-5xl
            font-bold
            tracking-tight
            mt-2
          "
        >
          Budget Tracker
        </h1>

        <p
          className="
            text-slate-400
            mt-2
          "
        >
          Monitor spending and stay in control
        </p>

      </div>

      <div
        className="
          bg-white/5
          backdrop-blur-xl

          border
          border-white/10

          rounded-3xl

          p-6
        "
      >

        <h2
          className="
            text-xl
            font-bold
            mb-4
          "
        >
          Monthly Budget
        </h2>

        <input
          type="number"
          value={budget}
          onChange={(e) =>
            setBudget(
              Number(
                e.target.value
              )
            )
          }
          className="
            w-full

            bg-black/20

            border
            border-white/10

            text-white

            p-4

            rounded-2xl
          "
        />

        <button
          onClick={saveBudget}
          className="
            mt-4

            bg-violet-600
            hover:bg-violet-500

            px-6
            py-3

            rounded-2xl

            font-semibold

            transition
          "
        >
          Save Budget
        </button>

      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">

        <div
          className="
            bg-white/5
            backdrop-blur-xl

            border
            border-white/10

            rounded-3xl

            p-6
          "
        >

          <p className="text-slate-400">
            Budget
          </p>

          <p
            className="
              text-3xl
              font-bold
              mt-2
            "
          >
            RM {budget.toFixed(2)}
          </p>

        </div>

        <div
          className="
            bg-white/5
            backdrop-blur-xl

            border
            border-white/10

            rounded-3xl

            p-6
          "
        >

          <p className="text-slate-400">
            Total Spent
          </p>

          <p
            className="
              text-3xl
              font-bold
              mt-2
            "
          >
            RM {spent.toFixed(2)}
          </p>

        </div>

        <div
          className="
            bg-white/5
            backdrop-blur-xl

            border
            border-white/10

            rounded-3xl

            p-6
          "
        >

          <p className="text-slate-400">
            Remaining
          </p>

          <p
            className={`
              text-3xl
              font-bold
              mt-2

              ${
                remaining < 0
                  ? "text-red-400"
                  : "text-green-400"
              }
            `}
          >
            RM {remaining.toFixed(2)}
          </p>

        </div>

      </div>

      <div
        className="
          bg-white/5
          backdrop-blur-xl

          border
          border-white/10

          rounded-3xl

          p-6

          mt-6
        "
      >

        <div
          className="
            flex
            justify-between
            mb-4
          "
        >

          <h2
            className="
              text-xl
              font-bold
            "
          >
            Budget Usage
          </h2>

          <span
            className="
              text-violet-300
              font-semibold
            "
          >
            {percentage.toFixed(1)}%
          </span>

        </div>

        <div
          className="
            w-full
            bg-slate-800
            rounded-full
            h-5
          "
        >

          <div
            className={`
              ${getProgressColor()}
              h-5
              rounded-full
              transition-all
            `}
            style={{
              width:
                `${percentage}%`,
            }}
          />

        </div>

      </div>

      <div
        className="
          bg-white/5
          backdrop-blur-xl

          border
          border-white/10

          rounded-3xl

          p-6

          mt-6
        "
      >

        <h2
          className="
            text-xl
            font-bold
            mb-4
          "
        >
          AI Budget Insight
        </h2>

        <p
          className={`
            text-lg
            ${insight.color}
          `}
        >
          {insight.text}
        </p>

      </div>

    </div>

  );
}