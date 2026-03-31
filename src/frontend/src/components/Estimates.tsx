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
import { ArrowRight, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  formatCurrency,
  formatDate,
  generateId,
  getAppData,
  saveAppData,
} from "../store";
import type { CurrentUser, Estimate, PaymentMethod } from "../types";

interface Props {
  currentUser: CurrentUser;
}

export default function Estimates({ currentUser: _currentUser }: Props) {
  const [data, setData] = useState(getAppData());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Estimate | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    roomNumber: "",
    days: "",
    rate: "",
    advancePaid: "",
    paymentMethod: "Cash" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
  });

  const total = Number(form.days) * Number(form.rate);

  const openAdd = () => {
    setEditing(null);
    setForm({
      customerName: "",
      customerPhone: "",
      roomNumber: "",
      days: "",
      rate: "",
      advancePaid: "",
      paymentMethod: "Cash",
      date: new Date().toISOString().split("T")[0],
    });
    setOpen(true);
  };
  const openEdit = (e: Estimate) => {
    setEditing(e);
    setForm({
      customerName: e.customerName,
      customerPhone: e.customerPhone,
      roomNumber: e.roomNumber,
      days: String(e.days),
      rate: String(e.rate),
      advancePaid: String(e.advancePaid),
      paymentMethod: e.paymentMethod,
      date: e.date,
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.customerName || !form.roomNumber) return;
    const newData = { ...data };
    if (editing) {
      newData.estimates = data.estimates.map((e) =>
        e.id === editing.id
          ? {
              ...e,
              customerName: form.customerName,
              customerPhone: form.customerPhone,
              roomNumber: form.roomNumber,
              days: Number(form.days),
              rate: Number(form.rate),
              totalAmount: total,
              advancePaid: Number(form.advancePaid),
              paymentMethod: form.paymentMethod,
              date: form.date,
            }
          : e,
      );
    } else {
      newData.estimates = [
        ...data.estimates,
        {
          id: generateId(),
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          roomNumber: form.roomNumber,
          days: Number(form.days),
          rate: Number(form.rate),
          totalAmount: total,
          advancePaid: Number(form.advancePaid),
          paymentMethod: form.paymentMethod,
          date: form.date,
          status: "Pending",
          createdAt: new Date().toISOString(),
        },
      ];
    }
    saveAppData(newData);
    setData(newData);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this estimate?")) return;
    const newData = {
      ...data,
      estimates: data.estimates.filter((e) => e.id !== id),
    };
    saveAppData(newData);
    setData(newData);
  };

  const convertToSale = (est: Estimate) => {
    const room = data.rooms.find((r) => r.roomNumber === est.roomNumber);
    if (!room) {
      alert("Room not found in Items. Add the room first.");
      return;
    }
    const checkOut = new Date(est.date);
    checkOut.setDate(checkOut.getDate() + est.days);
    const newData = { ...data };
    newData.sales = [
      ...data.sales,
      {
        id: generateId(),
        invoiceNumber: data.nextInvoiceNumber,
        customerName: est.customerName,
        customerPhone: est.customerPhone,
        roomId: room.id,
        roomNumber: room.roomNumber,
        days: est.days,
        rate: est.rate,
        totalAmount: est.totalAmount,
        advancePaid: est.advancePaid,
        balanceAmount: est.totalAmount - est.advancePaid,
        paymentMethod: est.paymentMethod,
        checkInDate: est.date,
        checkOutDate: checkOut.toISOString().split("T")[0],
        status: "Ongoing",
        createdBy: "admin",
        createdAt: new Date().toISOString(),
      },
    ];
    newData.nextInvoiceNumber = data.nextInvoiceNumber + 1;
    newData.estimates = data.estimates.map((e) =>
      e.id === est.id ? { ...e, status: "Converted" } : e,
    );
    saveAppData(newData);
    setData(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
            Estimates
          </h1>
          <p className="text-gray-500 text-sm">
            Manage quotes and convert to sales
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 text-sm"
          style={{ background: "#C9A84C", color: "#1A0A10" }}
        >
          <Plus size={16} /> Add Estimate
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#4A0E1E" }}>
              {[
                "Customer",
                "Phone",
                "Room",
                "Days",
                "Rate",
                "Total",
                "Date",
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
            {data.estimates.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-gray-400">
                  No estimates
                </td>
              </tr>
            )}
            {data.estimates.map((e, i) => (
              <tr
                key={e.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-3 font-medium">{e.customerName}</td>
                <td className="px-3 py-3 text-gray-500">{e.customerPhone}</td>
                <td className="px-3 py-3">Room {e.roomNumber}</td>
                <td className="px-3 py-3">{e.days}</td>
                <td className="px-3 py-3">{formatCurrency(e.rate)}</td>
                <td
                  className="px-3 py-3 font-semibold"
                  style={{ color: "#C9A84C" }}
                >
                  {formatCurrency(e.totalAmount)}
                </td>
                <td className="px-3 py-3 text-gray-500">
                  {formatDate(e.date)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${e.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    {e.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => convertToSale(e)}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        <ArrowRight size={12} /> Convert
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openEdit(e)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(e.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              {editing ? "Edit Estimate" : "Add Estimate"}
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
            <div>
              <Label>Room Number *</Label>
              <Input
                value={form.roomNumber}
                onChange={(e) =>
                  setForm({ ...form, roomNumber: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Days</Label>
              <Input
                type="number"
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
              <Label>Advance (₹)</Label>
              <Input
                type="number"
                value={form.advancePaid}
                onChange={(e) =>
                  setForm({ ...form, advancePaid: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Payment</Label>
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
                className="col-span-2 p-3 rounded"
                style={{ background: "#fdf2f4" }}
              >
                <span className="text-sm">
                  Estimated Total: <strong>{formatCurrency(total)}</strong>
                </span>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ background: "#C9A84C", color: "#1A0A10" }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
