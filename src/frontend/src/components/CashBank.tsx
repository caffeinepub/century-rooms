import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { formatCurrency, formatDate, getAppData } from "../store";

export default function CashBank() {
  const [data] = useState(getAppData());

  const cashSales = data.sales.filter((s) => s.paymentMethod === "Cash");
  const gpaySales = data.sales.filter((s) => s.paymentMethod === "GPay");
  const cardSales = data.sales.filter((s) => s.paymentMethod === "Card");

  const cashTotal = cashSales.reduce((s, x) => s + x.totalAmount, 0);
  const gpayTotal = gpaySales.reduce((s, x) => s + x.totalAmount, 0);
  const cardTotal = cardSales.reduce((s, x) => s + x.totalAmount, 0);

  const TxTable = ({
    sales,
    total,
    label,
  }: { sales: typeof data.sales; total: number; label: string }) => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 inline-block">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          {label} Balance
        </p>
        <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>
          {formatCurrency(total)}
        </p>
        <p className="text-xs text-gray-400">{sales.length} transaction(s)</p>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#4A0E1E" }}>
              {["Invoice", "Customer", "Room", "Date", "Amount"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-white font-medium text-xs"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No {label} transactions
                </td>
              </tr>
            )}
            {sales.map((s, i) => (
              <tr
                key={s.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  #{s.invoiceNumber}
                </td>
                <td className="px-4 py-3 font-medium">{s.customerName}</td>
                <td className="px-4 py-3">Room {s.roomNumber}</td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(s.checkInDate)}
                </td>
                <td className="px-4 py-3 font-semibold text-green-700">
                  {formatCurrency(s.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
          Cash & Bank
        </h1>
        <p className="text-gray-500 text-sm">
          Transaction logs by payment method
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Cash", value: cashTotal, color: "#16a34a" },
          { label: "GPay", value: gpayTotal, color: "#2563eb" },
          { label: "Card", value: cardTotal, color: "#9333ea" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: c.color }}>
              {formatCurrency(c.value)}
            </p>
          </div>
        ))}
      </div>
      <Tabs defaultValue="cash">
        <TabsList className="mb-4">
          <TabsTrigger value="cash">Cash ({cashSales.length})</TabsTrigger>
          <TabsTrigger value="gpay">GPay ({gpaySales.length})</TabsTrigger>
          <TabsTrigger value="card">Card ({cardSales.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="cash">
          <TxTable sales={cashSales} total={cashTotal} label="Cash" />
        </TabsContent>
        <TabsContent value="gpay">
          <TxTable sales={gpaySales} total={gpayTotal} label="GPay" />
        </TabsContent>
        <TabsContent value="card">
          <TxTable sales={cardSales} total={cardTotal} label="Card" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
