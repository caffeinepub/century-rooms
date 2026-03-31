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
import {
  BedDouble,
  CheckCircle,
  Edit,
  Plus,
  Printer,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import {
  formatCurrency,
  formatDate,
  generateId,
  getAppData,
  saveAppData,
} from "../store";
import type { CurrentUser, Room, RoomType, Sale } from "../types";
import InvoiceTemplate from "./InvoiceTemplate";

interface Props {
  currentUser: CurrentUser;
}

export default function Items({ currentUser }: Props) {
  const [data, setData] = useState(getAppData());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState({
    roomNumber: "",
    type: "AC" as RoomType,
    ratePerDay: "",
  });
  const [finishedSale, setFinishedSale] = useState<Sale | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm({ roomNumber: "", type: "AC", ratePerDay: "" });
    setOpen(true);
  };
  const openEdit = (r: Room) => {
    setEditing(r);
    setForm({
      roomNumber: r.roomNumber,
      type: r.type,
      ratePerDay: String(r.ratePerDay),
    });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.roomNumber || !form.ratePerDay) return;
    const newData = { ...data };
    if (editing) {
      newData.rooms = data.rooms.map((r) =>
        r.id === editing.id
          ? {
              ...r,
              roomNumber: form.roomNumber,
              type: form.type,
              ratePerDay: Number(form.ratePerDay),
            }
          : r,
      );
    } else {
      newData.rooms = [
        ...data.rooms,
        {
          id: generateId(),
          roomNumber: form.roomNumber,
          type: form.type,
          ratePerDay: Number(form.ratePerDay),
          isActive: true,
        },
      ];
    }
    saveAppData(newData);
    setData(newData);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this room?")) return;
    const newData = { ...data, rooms: data.rooms.filter((r) => r.id !== id) };
    saveAppData(newData);
    setData(newData);
  };

  const handleFinished = (room: Room) => {
    const sale = data.sales.find(
      (s) => s.roomId === room.id && s.status === "Ongoing",
    );
    if (!sale) return;
    const newData = {
      ...data,
      sales: data.sales.map((s) =>
        s.id === sale.id ? { ...s, status: "Completed" as const } : s,
      ),
    };
    saveAppData(newData);
    setData(newData);
    setFinishedSale(sale);
    setInvoiceOpen(true);
  };

  const getActiveSale = (roomId: string) =>
    data.sales.find((s) => s.roomId === roomId && s.status === "Ongoing");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
            Rooms
          </h1>
          <p className="text-gray-500 text-sm">Manage room inventory</p>
        </div>
        <Button
          onClick={openAdd}
          className="gap-2 text-sm"
          style={{ background: "#C9A84C", color: "#1A0A10" }}
        >
          <Plus size={16} /> Add Room
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.rooms.map((room) => {
          const activeSale = getActiveSale(room.id);
          const occupied = !!activeSale;
          return (
            <div
              key={room.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "#fdf2f4" }}
                  >
                    <BedDouble size={22} style={{ color: "#7B1C2B" }} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">
                      Room {room.roomNumber}
                    </div>
                    <div className="text-xs text-gray-500">{room.type}</div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    occupied
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {occupied ? "Occupied" : "Available"}
                </span>
              </div>

              {occupied && activeSale ? (
                <div
                  className="mt-3 p-3 rounded-lg text-sm space-y-1"
                  style={{ background: "#fdf2f4" }}
                >
                  <div className="font-semibold text-gray-800">
                    {activeSale.customerName}
                  </div>
                  {activeSale.customerPhone && (
                    <div className="text-gray-500 text-xs">
                      📞 {activeSale.customerPhone}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Check-in:{" "}
                    <span className="font-medium text-gray-700">
                      {formatDate(activeSale.checkInDate)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Check-out:{" "}
                    <span className="font-medium text-gray-700">
                      {formatDate(activeSale.checkOutDate)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <span
                    className="text-xl font-bold"
                    style={{ color: "#C9A84C" }}
                  >
                    {formatCurrency(room.ratePerDay)}
                  </span>
                  <span className="text-sm text-gray-400"> / day</span>
                </div>
              )}

              <div className="mt-3 flex gap-2 flex-wrap">
                {occupied && (
                  <button
                    type="button"
                    onClick={() => handleFinished(room)}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                    style={{ background: "#7B1C2B" }}
                  >
                    <CheckCircle size={13} /> Finished
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(room)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <Edit size={13} /> Edit
                </button>
                {currentUser.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(room.id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:underline"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Room Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              {editing ? "Edit Room" : "Add Room"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as RoomType })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="Non-AC">Non-AC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rate Per Day (₹) *</Label>
              <Input
                type="number"
                value={form.ratePerDay}
                onChange={(e) =>
                  setForm({ ...form, ratePerDay: e.target.value })
                }
                className="mt-1"
              />
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

      {/* Finished / Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              Invoice #{finishedSale?.invoiceNumber} — Room Finished
            </DialogTitle>
          </DialogHeader>
          {finishedSale && (
            <div>
              <InvoiceTemplate sale={finishedSale} data={data} />
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
    </div>
  );
}
