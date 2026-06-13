import { motion } from "framer-motion";

export default function HeroSection({
  email,
  totalExpenses,
  receiptCount,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative
        overflow-hidden

        rounded-[32px]

        p-8

        mb-8

        bg-gradient-to-br
        from-violet-600/20
        via-purple-600/10
        to-indigo-600/20

        border
        border-violet-500/20

        backdrop-blur-xl
      "
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-[150px]" />

      <div className="relative z-10">

        <p className="uppercase tracking-widest text-violet-300 text-sm">
          AI Financial Command Center
        </p>

        <h1 className="text-5xl font-bold mt-3">
          Welcome Back 👋
        </h1>

        <p className="text-slate-300 mt-3">
          {email}
        </p>

        <div className="mt-6 text-lg">
          You have spent
          <span className="font-bold text-white">
            {" "}RM {totalExpenses.toFixed(2)}
          </span>
          {" "}across
          <span className="font-bold text-white">
            {" "}{receiptCount}
          </span>
          {" "}receipts.
        </div>

      </div>
    </motion.div>
  );
}