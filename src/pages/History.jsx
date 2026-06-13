import { useEffect, useState } from "react";

import {
  getReceipts,
} from "../firebase/receiptService";

export default function History() {

  const [receipts, setReceipts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [categoryFilter,
    setCategoryFilter] =
    useState("All");

  const [sortOrder,
    setSortOrder] =
    useState("newest");

  useEffect(() => {

    loadReceipts();

  }, []);

  const loadReceipts =
    async () => {

      const data =
        await getReceipts();

      setReceipts(data);
    };

  const latestReceipts =
    [...receipts]
      .reverse()
      .slice(0, 5);

  const filteredReceipts =
    receipts
      .filter((receipt) => {

        const matchesSearch =
          receipt.merchant
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesCategory =
          categoryFilter === "All"
            ? true
            : receipt.category ===
              categoryFilter;

        return (
          matchesSearch &&
          matchesCategory
        );
      })
      .sort((a, b) => {

        if (
          sortOrder === "newest"
        ) {

          return (
            new Date(b.date) -
            new Date(a.date)
          );
        }

        if (
          sortOrder === "oldest"
        ) {

          return (
            new Date(a.date) -
            new Date(b.date)
          );
        }

        if (
          sortOrder === "highest"
        ) {

          return (
            Number(b.amount) -
            Number(a.amount)
          );
        }

        if (
          sortOrder === "lowest"
        ) {

          return (
            Number(a.amount) -
            Number(b.amount)
          );
        }

        return 0;
      });

  const totalSpent =
    filteredReceipts.reduce(
      (sum, receipt) =>
        sum +
        Number(
          receipt.amount || 0
        ),
      0
    );

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
          Transaction Records
        </p>

        <h1
          className="
            text-5xl
            font-bold
            tracking-tight
            mt-2
          "
        >
          Receipt History
        </h1>

        <p
          className="
            text-slate-400
            mt-2
          "
        >
          Search, filter and review expenses
        </p>

      </div>

      <div
        className="
          bg-white/5
          backdrop-blur-xl
          border
          border-violet-500/20
          rounded-3xl
          p-6
          mb-8
        "
      >

        <h2
          className="
            text-xl
            font-bold
            text-violet-400
            mb-4
          "
        >
          Latest Added Receipts
        </h2>

        <div className="space-y-3">

          {latestReceipts.map(
            (receipt) => (

              <div
                key={
                  "latest-" +
                  receipt.id
                }
                className="
                  bg-black/20
                  border
                  border-white/10
                  p-4
                  rounded-2xl
                "
              >

                <div
                  className="
                    flex
                    justify-between
                  "
                >

                  <h3
                    className="
                      font-bold
                    "
                  >
                    {
                      receipt.merchant
                    }
                  </h3>

                  <span
                    className="
                      font-semibold
                    "
                  >
                    RM {
                      Number(
                        receipt.amount || 0
                      ).toFixed(2)
                    }
                  </span>

                </div>

                <p
                  className="
                    text-violet-300
                    text-sm
                  "
                >
                  {
                    receipt.category
                  }
                </p>

                <p
                  className="
                    text-slate-500
                    text-xs
                  "
                >
                  {
                    receipt.date
                  }
                </p>

              </div>

            )
          )}

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">

        <div
          className="
            bg-white/5
            backdrop-blur-xl
            border
            border-white/10
            p-5
            rounded-3xl
          "
        >

          <p className="text-slate-400">
            Receipts
          </p>

          <p
            className="
              text-3xl
              font-bold
              mt-2
            "
          >
            {
              filteredReceipts.length
            }
          </p>

        </div>

        <div
          className="
            bg-white/5
            backdrop-blur-xl
            border
            border-white/10
            p-5
            rounded-3xl
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
            RM {
              totalSpent.toFixed(2)
            }
          </p>

        </div>

      </div>

      <input
        type="text"
        placeholder="Search merchant..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="
          w-full
          p-4
          rounded-2xl

          bg-black/20

          border
          border-white/10

          text-white

          placeholder:text-slate-500
        "
      />

      <select
        value={categoryFilter}
        onChange={(e) =>
          setCategoryFilter(
            e.target.value
          )
        }
        className="
          mt-4
          w-full
          p-4

          rounded-2xl

          bg-black/20

          border
          border-white/10

          text-white
        "
      >

        <option value="All">
          All Categories
        </option>

        <option value="Food">
          Food
        </option>

        <option value="Transport">
          Transport
        </option>

        <option value="Shopping">
          Shopping
        </option>

        <option value="Groceries">
          Groceries
        </option>

        <option value="Bills">
          Bills
        </option>

        <option value="Entertainment">
          Entertainment
        </option>

        <option value="Healthcare">
          Healthcare
        </option>

        <option value="Education">
          Education
        </option>

        <option value="Others">
          Others
        </option>

      </select>

      <select
        value={sortOrder}
        onChange={(e) =>
          setSortOrder(
            e.target.value
          )
        }
        className="
          mt-4
          w-full
          p-4

          rounded-2xl

          bg-black/20

          border
          border-white/10

          text-white
        "
      >

        <option value="newest">
          Newest First
        </option>

        <option value="oldest">
          Oldest First
        </option>

        <option value="highest">
          Highest Amount
        </option>

        <option value="lowest">
          Lowest Amount
        </option>

      </select>

      <div className="mt-8 space-y-4">

        {filteredReceipts.length === 0 ? (

          <div
            className="
              bg-white/5
              backdrop-blur-xl

              border
              border-white/10

              p-8

              rounded-3xl

              text-center
            "
          >
            No receipts found
          </div>

        ) : (

          filteredReceipts.map(
            (receipt) => (

              <div
                key={receipt.id}
                className="
                  bg-white/5
                  backdrop-blur-xl

                  border
                  border-white/10

                  p-5

                  rounded-3xl
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    items-center
                  "
                >

                  <h2
                    className="
                      text-lg
                      font-bold
                    "
                  >
                    {
                      receipt.merchant
                    }
                  </h2>

                  <span
                    className="
                      bg-violet-500/15
                      text-violet-300

                      px-3
                      py-1

                      rounded-full

                      text-sm
                    "
                  >
                    {
                      receipt.category
                    }
                  </span>

                </div>

                <p
                  className="
                    text-3xl
                    font-bold
                    mt-3
                  "
                >
                  RM {
                    Number(
                      receipt.amount || 0
                    ).toFixed(2)
                  }
                </p>

                <p
                  className="
                    text-slate-500
                    text-sm
                    mt-2
                  "
                >
                  {
                    receipt.date
                  }
                </p>

              </div>

            )
          )

        )}

      </div>

    </div>

  );
}