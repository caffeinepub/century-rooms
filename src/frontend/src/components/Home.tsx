import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BedDouble, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate, getAppData } from "../store";
import type { CurrentUser } from "../types";

interface Props {
  currentUser: CurrentUser;
}

export default function Home({ currentUser }: Props) {
  const data = getAppData();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const allTx = useMemo(() => {
    const sales = data.sales.map((s) => ({
      id: s.id,
      date: s.checkInDate,
      type: "Sale" as const,
      description: `Room ${s.roomNumber} - ${s.customerName}`,
      amount: s.totalAmount,
      paymentMethod: s.paymentMethod,
    }));
    const purchases = data.purchases.map((p) => ({
      id: p.id,
      date: p.date,
      type: "Purchase" as const,
      description: p.itemName,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
    }));
    return [...sales, ...purchases].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }, [data]);

  const filtered = useMemo(
    () =>
      allTx.filter((tx) => {
        if (dateFrom && tx.date < dateFrom) return false;
        if (dateTo && tx.date > dateTo) return false;
        if (typeFilter !== "all" && tx.type !== typeFilter) return false;
        if (paymentFilter !== "all" && tx.paymentMethod !== paymentFilter)
          return false;
        return true;
      }),
    [allTx, dateFrom, dateTo, typeFilter, paymentFilter],
  );

  const totalIncome = data.sales.reduce((s, x) => s + x.totalAmount, 0);
  const totalExpenses = data.purchases.reduce((s, x) => s + x.amount, 0);
  const activeRooms = data.sales.filter((s) => s.status === "Ongoing").length;
  const activeSales = data.sales.filter((s) => s.status === "Ongoing");

  // Staff view: only active rooms
  if (currentUser.role !== "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
            Active Rooms
          </h1>
          <p className="text-gray-500 text-sm">
            Currently occupied rooms and customer details
          </p>
        </div>
        {activeSales.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400 border border-gray-100 shadow-sm">
            No active rooms at the moment
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#fdf2f4" }}
                  >
                    <BedDouble size={20} style={{ color: "#7B1C2B" }} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      Room {sale.roomNumber}
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                      Occupied
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Customer: </span>
                    <span className="font-semibold text-gray-800">
                      {sale.customerName}
                    </span>
                  </div>
                  {sale.customerPhone && (
                    <div>
                      <span className="text-gray-500">Phone: </span>
                      <span className="text-gray-700">
                        {sale.customerPhone}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Check-in: </span>
                    <span className="text-gray-700">
                      {formatDate(sale.checkInDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Check-out: </span>
                    <span className="text-gray-700">
                      {formatDate(sale.checkOutDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin view: full dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Overview of all transactions and activity
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Total Income",
            value: formatCurrency(totalIncome),
            sub: "All time sales",
            icon: TrendingUp,
            color: "#16a34a",
            bg: "#dcfce7",
          },
          {
            label: "Total Expenses",
            value: formatCurrency(totalExpenses),
            sub: "All purchases",
            icon: TrendingDown,
            color: "#dc2626",
            bg: "#fee2e2",
          },
          {
            label: "Net Balance",
            value: formatCurrency(totalIncome - totalExpenses),
            sub: "Income - Expenses",
            icon: Wallet,
            color: "#7B1C2B",
            bg: "#fdf2f4",
          },
          {
            label: "Active Rooms",
            value: String(activeRooms),
            sub: "Ongoing stays",
            icon: BedDouble,
            color: "#C9A84C",
            bg: "#fef9ec",
          },
        ].map((card) => (
          <Card
            key={card.label}
            className="rounded-xl shadow-sm border border-gray-100"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    {card.label}
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-xl shadow-sm border border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle
            className="text-base font-semibold"
            style={{ color: "#7B1C2B" }}
          >
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">From:</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 text-sm w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">To:</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 text-sm w-36"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-36 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-9 w-36 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="GPay">GPay</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#4A0E1E" }}>
                  {["Date", "Type", "Description", "Payment", "Amount"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-white font-medium text-xs"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
                {filtered.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === "Sale"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        tx.type === "Sale" ? "text-green-700" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <span className="text-gray-500">
              Filtered Income:{" "}
              <strong className="text-green-700">
                {formatCurrency(
                  filtered
                    .filter((t) => t.type === "Sale")
                    .reduce((s, t) => s + t.amount, 0),
                )}
              </strong>
            </span>
            <span className="text-gray-500">
              Filtered Expenses:{" "}
              <strong className="text-red-600">
                {formatCurrency(
                  filtered
                    .filter((t) => t.type === "Purchase")
                    .reduce((s, t) => s + t.amount, 0),
                )}
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
