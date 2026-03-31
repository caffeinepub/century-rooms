import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency, getAppData } from "../store";

type Period = "all" | "daily" | "weekly" | "monthly" | "yearly";

function inPeriod(date: string, period: Period): boolean {
  if (period === "all") return true;
  const now = new Date();
  const d = new Date(date);
  if (period === "daily") return d.toDateString() === now.toDateString();
  if (period === "weekly") return (now.getTime() - d.getTime()) / 86400000 <= 7;
  if (period === "monthly")
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  if (period === "yearly") return d.getFullYear() === now.getFullYear();
  return true;
}

export default function ProfitLoss() {
  const [data] = useState(getAppData());
  const [period, setPeriod] = useState<Period>("monthly");

  const { totalSales, totalPurchases } = useMemo(
    () => ({
      totalSales: data.sales
        .filter((s) => inPeriod(s.checkInDate, period))
        .reduce((s, x) => s + x.totalAmount, 0),
      totalPurchases: data.purchases
        .filter((p) => inPeriod(p.date, period))
        .reduce((s, x) => s + x.amount, 0),
    }),
    [data, period],
  );

  const net = totalSales - totalPurchases;
  const isProfit = net >= 0;
  const ratio =
    totalSales > 0
      ? Math.round(((totalSales - totalPurchases) / totalSales) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
          Profit & Loss
        </h1>
        <p className="text-gray-500 text-sm">Financial performance summary</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", "daily", "weekly", "monthly", "yearly"] as Period[]).map(
          (p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${period === p ? "text-white" : "bg-white border text-gray-600"}`}
              style={period === p ? { background: "#7B1C2B" } : {}}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ),
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-700" />
            </div>
            <span className="text-sm text-gray-500 font-medium">
              Total Sales
            </span>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {formatCurrency(totalSales)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">
              Total Purchases
            </span>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(totalPurchases)}
          </p>
        </div>
        <div
          className="bg-white rounded-xl p-6 shadow-sm border"
          style={{
            borderColor: isProfit ? "#bbf7d0" : "#fecaca",
            background: isProfit ? "#f0fdf4" : "#fff1f2",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isProfit ? "bg-green-200" : "bg-red-200"}`}
            >
              <DollarSign
                size={20}
                className={isProfit ? "text-green-800" : "text-red-700"}
              />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: isProfit ? "#166534" : "#991b1b" }}
            >
              {isProfit ? "Net Profit" : "Net Loss"}
            </span>
          </div>
          <p
            className={`text-3xl font-bold ${isProfit ? "text-green-800" : "text-red-700"}`}
          >
            {formatCurrency(Math.abs(net))}
          </p>
        </div>
      </div>
      {totalSales > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Profit Margin
          </h3>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 rounded-full transition-all"
              style={{
                width: `${Math.max(0, ratio)}%`,
                background: isProfit ? "#16a34a" : "#dc2626",
              }}
            />
          </div>
          <p
            className="text-sm mt-2"
            style={{ color: isProfit ? "#16a34a" : "#dc2626" }}
          >
            {isProfit ? `${ratio}% profit margin` : "Operating at a loss"}
          </p>
        </div>
      )}
    </div>
  );
}
