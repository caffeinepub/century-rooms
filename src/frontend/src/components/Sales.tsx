import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Eye, MessageCircle, Plus, Printer, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  formatCurrency,
  formatDate,
  generateId,
  getAppData,
  saveAppData,
} from "../store";
import type { AppData, CurrentUser, PaymentMethod, Sale } from "../types";
import InvoiceTemplate from "./InvoiceTemplate";

interface Props {
  currentUser: CurrentUser;
}

type Period = "all" | "daily" | "weekly" | "monthly" | "yearly";

function periodFilter(date: string, period: Period): boolean {
  if (period === "all") return true;
  const now = new Date();
  const d = new Date(date);
  if (period === "daily") return d.toDateString() === now.toDateString();
  if (period === "weekly") {
    const diff = (now.getTime() - d.getTime()) / 86400000;
    return diff <= 7;
  }
  if (period === "monthly")
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  if (period === "yearly") return d.getFullYear() === now.getFullYear();
  return true;
}

export default function Sales({ currentUser }: Props) {
  const [data, setData] = useState<AppData>(getAppData());
  const [period, setPeriod] = useState<Period>("all");
  const [payFilter, setPayFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const [finishInvoiceOpen, setFinishInvoiceOpen] = useState(false);
  const [finishedSale, setFinishedSale] = useState<Sale | null>(null);

  const emptyForm = {
    customerName: "",
    customerPhone: "",
    roomId: "",
    days: "",
    rate: "",
    advancePaid: "",
    paymentMethod: "Cash" as PaymentMethod,
    checkInDate: new Date().toISOString().split("T")[0],
  };
  const [form, setForm] = useState(emptyForm);

  const total = Number(form.days) * Number(form.rate);
  const balance = total - Number(form.advancePaid);

  const filteredSales = useMemo(
    () =>
      data.sales.filter((s) => {
        if (!periodFilter(s.checkInDate, period)) return false;
        if (payFilter !== "all" && s.paymentMethod !== payFilter) return false;
        return true;
      }),
    [data.sales, period, payFilter],
  );

  const totalSales = filteredSales.reduce((s, x) => s + x.totalAmount, 0);
  const cashSales = filteredSales
    .filter((s) => s.paymentMethod === "Cash")
    .reduce((s, x) => s + x.totalAmount, 0);
  const gpaySales = filteredSales
    .filter((s) => s.paymentMethod === "GPay")
    .reduce((s, x) => s + x.totalAmount, 0);
  const cardSales = filteredSales
    .filter((s) => s.paymentMethod === "Card")
    .reduce((s, x) => s + x.totalAmount, 0);
  const ongoingSales = data.sales.filter((s) => s.status === "Ongoing");

  const openAdd = () => {
    setEditSale(null);
    setForm(emptyForm);
    setAddOpen(true);
  };
  const openEdit = (s: Sale) => {
    setEditSale(s);
    setForm({
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      roomId: s.roomId,
      days: String(s.days),
      rate: String(s.rate),
      advancePaid: String(s.advancePaid),
      paymentMethod: s.paymentMethod,
      checkInDate: s.checkInDate,
    });
    setAddOpen(true);
  };

  const handleRoomChange = (roomId: string) => {
    const room = data.rooms.find((r) => r.id === roomId);
    setForm((f) => ({
      ...f,
      roomId,
      rate: room ? String(room.ratePerDay) : f.rate,
    }));
  };

  const handleSave = () => {
    if (!form.customerName || !form.roomId || !form.days || !form.rate) return;
    const room = data.rooms.find((r) => r.id === form.roomId);
    if (!room) return;
    const checkOut = new Date(form.checkInDate);
    checkOut.setDate(checkOut.getDate() + Number(form.days));
    const newData = { ...data };
    if (editSale) {
      newData.sales = data.sales.map((s) =>
        s.id === editSale.id
          ? {
              ...s,
              customerName: form.customerName,
              customerPhone: form.customerPhone,
              roomId: form.roomId,
              roomNumber: room.roomNumber,
              days: Number(form.days),
              rate: Number(form.rate),
              totalAmount: total,
              advancePaid: Number(form.advancePaid),
              balanceAmount: balance,
              paymentMethod: form.paymentMethod,
              checkInDate: form.checkInDate,
              checkOutDate: checkOut.toISOString().split("T")[0],
            }
          : s,
      );
    } else {
      const sale: Sale = {
        id: generateId(),
        invoiceNumber: data.nextInvoiceNumber,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        roomId: form.roomId,
        roomNumber: room.roomNumber,
        days: Number(form.days),
        rate: Number(form.rate),
        totalAmount: total,
        advancePaid: Number(form.advancePaid),
        balanceAmount: balance,
        paymentMethod: form.paymentMethod,
        checkInDate: form.checkInDate,
        checkOutDate: checkOut.toISOString().split("T")[0],
        status: "Ongoing",
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
      };
      newData.sales = [...data.sales, sale];
      newData.nextInvoiceNumber = data.nextInvoiceNumber + 1;
    }
    saveAppData(newData);
    setData(newData);
    setAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this sale?")) return;
    const newData = { ...data, sales: data.sales.filter((s) => s.id !== id) };
    saveAppData(newData);
    setData(newData);
  };

  const openInvoice = (s: Sale) => {
    setViewSale(s);
    setInvoiceOpen(true);
  };

  const sendWhatsApp = (s: Sale) => {
    const { whatsappNumber, whatsappTemplate } = data.settings;
    const msg = whatsappTemplate
      .replace("{Customer Name}", s.customerName)
      .replace("{Amount}", formatCurrency(s.totalAmount))
      .replace("{Phone Number}", whatsappNumber);
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleFinishSale = (s: Sale) => {
    const completedSale: Sale = { ...s, status: "Completed" };
    const newData = {
      ...data,
      sales: data.sales.map((sale) =>
        sale.id === s.id ? completedSale : sale,
      ),
    };
    saveAppData(newData);
    setData(newData);
    setFinishedSale(completedSale);
    setFinishInvoiceOpen(true);
  };

  const sendWhatsAppToCustomer = (s: Sale) => {
    const phone = s.customerPhone.replace(/\D/g, "");
    const msg = `Dear ${s.customerName}, your bill for Room ${s.roomNumber} is ready.\nCheck-in: ${formatDate(s.checkInDate)} | Check-out: ${formatDate(s.checkOutDate)}\nTotal Amount: ₹${s.totalAmount}\nBalance: ₹${s.balanceAmount}\nThank you for staying at Century Rooms!`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
            Sales
          </h1>
          <p className="text-gray-500 text-sm">
            Manage room bookings and invoices
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 text-sm"
          style={{ background: "#C9A84C", color: "#1A0A10" }}
        >
          <Plus size={16} /> Add Sale
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "daily", "weekly", "monthly", "yearly"] as Period[]).map(
          (p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                period === p
                  ? "text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
              style={period === p ? { background: "#7B1C2B" } : {}}
            >
              {p === "all" ? "All Time" : p}
            </button>
          ),
        )}
        <Select value={payFilter} onValueChange={setPayFilter}>
          <SelectTrigger className="h-8 w-32 text-xs">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Sales",
            value: formatCurrency(totalSales),
            color: "#7B1C2B",
          },
          { label: "Cash", value: formatCurrency(cashSales), color: "#16a34a" },
          { label: "GPay", value: formatCurrency(gpaySales), color: "#2563eb" },
          { label: "Card", value: formatCurrency(cardSales), color: "#9333ea" },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {c.label}
            </p>
            <p className="text-xl font-bold mt-1" style={{ color: c.color }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Ongoing Sales */}
      {ongoingSales.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "#f0e4e6" }}
          >
            <h2 className="font-semibold" style={{ color: "#7B1C2B" }}>
              Ongoing Stays
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {[
                    "Room",
                    "Customer",
                    "Check-in",
                    "Advance",
                    "Balance",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ongoingSales.map((s) => (
                  <tr key={s.id} className="border-t border-gray-50">
                    <td className="px-4 py-3 font-medium">
                      Room {s.roomNumber}
                    </td>
                    <td className="px-4 py-3">{s.customerName}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(s.checkInDate)}
                    </td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {formatCurrency(s.advancePaid)}
                    </td>
                    <td className="px-4 py-3 text-red-600 font-medium">
                      {formatCurrency(s.balanceAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700">
                        Occupied
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: "#f0e4e6" }}>
          <h2 className="font-semibold" style={{ color: "#7B1C2B" }}>
            All Sales ({filteredSales.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#4A0E1E" }}>
                {[
                  "Invoice",
                  "Customer",
                  "Room",
                  "Check-in",
                  "Total",
                  "Balance",
                  "Payment",
                  "Status",
                  "Actions",
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
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400">
                    No sales found
                  </td>
                </tr>
              )}
              {filteredSales.map((s, i) => (
                <tr
                  key={s.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-3 font-mono text-xs text-gray-600">
                    #{s.invoiceNumber}
                  </td>
                  <td className="px-3 py-3 font-medium">{s.customerName}</td>
                  <td className="px-3 py-3">Room {s.roomNumber}</td>
                  <td className="px-3 py-3 text-gray-500">
                    {formatDate(s.checkInDate)}
                  </td>
                  <td className="px-3 py-3 font-semibold text-gray-800">
                    {formatCurrency(s.totalAmount)}
                  </td>
                  <td className="px-3 py-3 text-red-600">
                    {formatCurrency(s.balanceAmount)}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === "Ongoing"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.status === "Ongoing" && (
                        <button
                          type="button"
                          data-ocid="sales.finish_sale.button"
                          onClick={() => handleFinishSale(s)}
                          className="text-xs px-2 py-1 rounded text-white font-medium"
                          style={{ background: "#7B1C2B" }}
                        >
                          Finished Sale
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openInvoice(s)}
                        className="text-purple-600 hover:text-purple-800"
                        title="View Invoice"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => sendWhatsApp(s)}
                        className="text-green-600 hover:text-green-800"
                        title="WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      {currentUser.role === "admin" && (
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Sale Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              {editSale ? "Edit Sale" : "Add New Sale"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Customer Name *</Label>
              <Input
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label>Phone</Label>
              <Input
                value={form.customerPhone}
                onChange={(e) =>
                  setForm({ ...form, customerPhone: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label>Room *</Label>
              <Select value={form.roomId} onValueChange={handleRoomChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {data.rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.type}) -{" "}
                      {formatCurrency(r.ratePerDay)}/day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Check-in Date *</Label>
              <Input
                type="date"
                value={form.checkInDate}
                onChange={(e) =>
                  setForm({ ...form, checkInDate: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Days *</Label>
              <Input
                type="number"
                min="1"
                value={form.days}
                onChange={(e) => setForm({ ...form, days: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Rate/Day (₹)</Label>
              <Input
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Advance Paid (₹)</Label>
              <Input
                type="number"
                value={form.advancePaid}
                onChange={(e) =>
                  setForm({ ...form, advancePaid: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label>Payment Method</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(v) =>
                  setForm({ ...form, paymentMethod: v as PaymentMethod })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="GPay">GPay</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.days && form.rate ? (
              <div
                className="col-span-2 rounded-lg p-3"
                style={{ background: "#fdf2f4" }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Total:{" "}
                    <strong className="text-gray-800">
                      {formatCurrency(total)}
                    </strong>
                  </span>
                  <span className="text-gray-600">
                    Balance:{" "}
                    <strong className="text-red-600">
                      {formatCurrency(balance)}
                    </strong>
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ background: "#C9A84C", color: "#1A0A10" }}
            >
              Save Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              Invoice #{viewSale?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {viewSale && (
            <div>
              <InvoiceTemplate sale={viewSale} data={data} />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setInvoiceOpen(false)}>
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

      {/* Finished Sale Dialog */}
      <Dialog open={finishInvoiceOpen} onOpenChange={setFinishInvoiceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              Bill — Invoice #{finishedSale?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {finishedSale && (
            <div>
              <InvoiceTemplate sale={finishedSale} data={data} />
              <div className="flex justify-end gap-2 mt-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setFinishInvoiceOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="gap-2"
                  style={{ background: "#7B1C2B", color: "white" }}
                  data-ocid="sales.finish_print.button"
                >
                  <Printer size={16} /> Print
                </Button>
                <Button
                  onClick={() => sendWhatsAppToCustomer(finishedSale)}
                  className="gap-2"
                  style={{ background: "#25D366", color: "white" }}
                  data-ocid="sales.finish_whatsapp.button"
                >
                  <MessageCircle size={16} /> Send to Customer via WhatsApp
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
