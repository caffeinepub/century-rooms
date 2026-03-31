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
import { Download, Edit, ImageIcon, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  formatCurrency,
  formatDate,
  generateId,
  getAppData,
  saveAppData,
} from "../store";
import type { CurrentUser, PaymentMethod, Purchase } from "../types";

interface Props {
  currentUser: CurrentUser;
}
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

export default function Purchases({ currentUser }: Props) {
  const [data, setData] = useState(getAppData());
  const [period, setPeriod] = useState<Period>("all");
  const [payFilter, setPayFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [form, setForm] = useState({
    itemName: "",
    amount: "",
    paymentMethod: "Cash" as PaymentMethod,
    date: new Date().toISOString().split("T")[0],
    phone: "",
    receiptImage: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      data.purchases.filter((p) => {
        if (!inPeriod(p.date, period)) return false;
        if (payFilter !== "all" && p.paymentMethod !== payFilter) return false;
        return true;
      }),
    [data.purchases, period, payFilter],
  );

  const total = filtered.reduce((s, x) => s + x.amount, 0);

  const openAdd = () => {
    setEditing(null);
    setForm({
      itemName: "",
      amount: "",
      paymentMethod: "Cash",
      date: new Date().toISOString().split("T")[0],
      phone: "",
      receiptImage: "",
    });
    setOpen(true);
  };
  const openEdit = (p: Purchase) => {
    setEditing(p);
    setForm({
      itemName: p.itemName,
      amount: String(p.amount),
      paymentMethod: p.paymentMethod,
      date: p.date,
      phone: p.phone || "",
      receiptImage: p.receiptImage || "",
    });
    setOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, receiptImage: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = (imageData: string, name: string) => {
    const a = document.createElement("a");
    a.href = imageData;
    a.download = `receipt-${name}.png`;
    a.click();
  };

  const handleSave = () => {
    if (!form.itemName || !form.amount) return;
    const newData = { ...data };
    if (editing) {
      newData.purchases = data.purchases.map((p) =>
        p.id === editing.id
          ? {
              ...p,
              itemName: form.itemName,
              amount: Number(form.amount),
              paymentMethod: form.paymentMethod,
              date: form.date,
              phone: form.phone,
              receiptImage: form.receiptImage,
            }
          : p,
      );
    } else {
      newData.purchases = [
        ...data.purchases,
        {
          id: generateId(),
          itemName: form.itemName,
          amount: Number(form.amount),
          paymentMethod: form.paymentMethod,
          date: form.date,
          phone: form.phone,
          receiptImage: form.receiptImage,
          createdBy: currentUser.username,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    saveAppData(newData);
    setData(newData);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this purchase?")) return;
    const newData = {
      ...data,
      purchases: data.purchases.filter((p) => p.id !== id),
    };
    saveAppData(newData);
    setData(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
            Purchases
          </h1>
          <p className="text-gray-500 text-sm">Track all expenses</p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 text-sm"
          style={{ background: "#C9A84C", color: "#1A0A10" }}
        >
          <Plus size={16} /> Add Purchase
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(["all", "daily", "weekly", "monthly", "yearly"] as Period[]).map(
          (p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                period === p ? "text-white" : "bg-white border text-gray-600"
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
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 inline-block">
        <p className="text-xs text-gray-500 uppercase tracking-wide">
          Total Purchases
        </p>
        <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>
          {formatCurrency(total)}
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#4A0E1E" }}>
              {[
                "Item",
                "Amount",
                "Payment",
                "Phone",
                "Date",
                "Receipt",
                "Actions",
              ].map((h) => (
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No purchases found
                </td>
              </tr>
            )}
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-medium">{p.itemName}</td>
                <td className="px-4 py-3 font-semibold text-red-600">
                  {formatCurrency(p.amount)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {p.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.phone || "-"}</td>
                <td className="px-4 py-3 text-gray-500">
                  {formatDate(p.date)}
                </td>
                <td className="px-4 py-3">
                  {p.receiptImage ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={p.receiptImage}
                        alt="receipt"
                        className="w-10 h-10 object-cover rounded border cursor-pointer"
                        onClick={() => window.open(p.receiptImage, "_blank")}
                        onKeyDown={() => window.open(p.receiptImage, "_blank")}
                      />
                      {currentUser.role === "admin" && (
                        <button
                          type="button"
                          onClick={() =>
                            downloadImage(p.receiptImage!, p.itemName)
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {currentUser.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {currentUser.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700"
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              {editing ? "Edit Purchase" : "Add Purchase"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Item Name *</Label>
              <Input
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1"
                placeholder="Optional"
              />
            </div>
            <div>
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
              <Label>Upload Estimate (Camera / Gallery)</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 w-full"
                >
                  <ImageIcon size={16} /> Choose File / Camera
                </Button>
                {form.receiptImage && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={form.receiptImage}
                      alt="preview"
                      className="h-24 rounded border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, receiptImage: "" })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
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
