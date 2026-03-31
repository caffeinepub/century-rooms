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
import { Download, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { generateId, getAppData, saveAppData } from "../store";
import type { CurrentUser, Party } from "../types";

interface Props {
  currentUser: CurrentUser;
}

export default function Parties({ currentUser }: Props) {
  const [data, setData] = useState(getAppData());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Party | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const filtered = data.parties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", phone: "", email: "" });
    setOpen(true);
  };
  const openEdit = (p: Party) => {
    setEditing(p);
    setForm({ name: p.name, phone: p.phone, email: p.email });
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    const newData = { ...data };
    if (editing) {
      newData.parties = data.parties.map((p) =>
        p.id === editing.id ? { ...p, ...form } : p,
      );
    } else {
      newData.parties = [...data.parties, { id: generateId(), ...form }];
    }
    saveAppData(newData);
    setData(newData);
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this party?")) return;
    const newData = {
      ...data,
      parties: data.parties.filter((p) => p.id !== id),
    };
    saveAppData(newData);
    setData(newData);
  };

  const exportCSV = () => {
    const rows = [
      "Name,Phone",
      ...data.parties.map((p) => `${p.name},${p.phone}`),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "parties.csv";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
            Parties
          </h1>
          <p className="text-gray-500 text-sm">Manage customer details</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportCSV}
            className="gap-2 text-sm"
          >
            <Download size={16} /> Export CSV
          </Button>
          <Button
            onClick={openAdd}
            className="gap-2 text-sm"
            style={{ background: "#C9A84C", color: "#1A0A10" }}
          >
            <Plus size={16} /> Add Party
          </Button>
        </div>
      </div>
      <div className="relative w-full max-w-xs">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="pl-9 text-sm"
        />
      </div>
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#4A0E1E" }}>
              {["Name", "Phone", "Email", "Actions"].map((h) => (
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
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  No parties found
                </td>
              </tr>
            )}
            {filtered.map((p, i) => (
              <tr
                key={p.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                <td className="px-4 py-3 text-gray-600">{p.email || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={15} />
                    </button>
                    {currentUser.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={15} />
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
              {editing ? "Edit Party" : "Add Party"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
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
    </div>
  );
}
