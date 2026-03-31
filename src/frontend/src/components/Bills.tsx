import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatDate, getAppData } from "../store";
import type { CurrentUser, Sale } from "../types";
import InvoiceTemplate from "./InvoiceTemplate";

interface Props {
  currentUser: CurrentUser;
}

export default function Bills({ currentUser: _currentUser }: Props) {
  const [data] = useState(getAppData());
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [open, setOpen] = useState(false);

  const completedSales = data.sales.filter((s) => s.status === "Completed");

  const openBill = (s: Sale) => {
    setViewSale(s);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
          Bills
        </h1>
        <p className="text-gray-500 text-sm">
          Checked-out customers — print bills here
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#4A0E1E" }}>
              {[
                "Invoice",
                "Customer",
                "Phone",
                "Room",
                "Check-in",
                "Check-out",
                "Total",
                "Print",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-3 text-white font-medium text-xs"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {completedSales.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  No checked-out customers yet
                </td>
              </tr>
            )}
            {completedSales.map((s, i) => (
              <tr
                key={s.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-3 font-mono text-xs text-gray-600">
                  #{s.invoiceNumber}
                </td>
                <td className="px-3 py-3 font-medium">{s.customerName}</td>
                <td className="px-3 py-3 text-gray-500">{s.customerPhone}</td>
                <td className="px-3 py-3">Room {s.roomNumber}</td>
                <td className="px-3 py-3 text-gray-500">
                  {formatDate(s.checkInDate)}
                </td>
                <td className="px-3 py-3 text-gray-500">
                  {formatDate(s.checkOutDate)}
                </td>
                <td
                  className="px-3 py-3 font-semibold"
                  style={{ color: "#C9A84C" }}
                >
                  {formatCurrency(s.totalAmount)}
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => openBill(s)}
                    className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
                    style={{ background: "#7B1C2B", color: "#fff" }}
                  >
                    <Printer size={12} /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              Bill #{viewSale?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {viewSale && (
            <div>
              <InvoiceTemplate sale={viewSale} data={data} />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="gap-2"
                  style={{ background: "#7B1C2B", color: "white" }}
                >
                  <Printer size={16} /> Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
