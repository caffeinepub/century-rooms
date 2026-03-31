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
import { Textarea } from "@/components/ui/textarea";
import { Edit, ImageIcon, Plus, Save, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { generateId, getAppData, saveAppData } from "../store";
import type { CurrentUser, Employee } from "../types";

interface Props {
  currentUser: CurrentUser;
}

export default function Settings({ currentUser: _currentUser }: Props) {
  const [data, setData] = useState(getAppData());
  const [empOpen, setEmpOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [empForm, setEmpForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [waNumber, setWaNumber] = useState(data.settings.whatsappNumber);
  const [waTemplate, setWaTemplate] = useState(data.settings.whatsappTemplate);
  const [taxRate, setTaxRate] = useState(String(data.settings.taxRate));
  const [estimateHeaderImage, setEstimateHeaderImage] = useState(
    data.settings.estimateHeaderImage || "",
  );
  const [saved, setSaved] = useState(false);
  const headerImgRef = useRef<HTMLInputElement>(null);

  const openAddEmp = () => {
    setEditEmp(null);
    setEmpForm({ name: "", username: "", password: "" });
    setEmpOpen(true);
  };
  const openEditEmp = (e: Employee) => {
    setEditEmp(e);
    setEmpForm({ name: e.name, username: e.username, password: e.password });
    setEmpOpen(true);
  };

  const handleSaveEmp = () => {
    if (!empForm.name || !empForm.username || !empForm.password) return;
    const newData = { ...data };
    if (editEmp) {
      newData.employees = data.employees.map((e) =>
        e.id === editEmp.id ? { ...e, ...empForm } : e,
      );
    } else {
      newData.employees = [
        ...data.employees,
        { id: generateId(), ...empForm, role: "employee" as const },
      ];
    }
    saveAppData(newData);
    setData(newData);
    setEmpOpen(false);
  };

  const handleDeleteEmp = (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const newData = {
      ...data,
      employees: data.employees.filter((e) => e.id !== id),
    };
    saveAppData(newData);
    setData(newData);
  };

  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEstimateHeaderImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = () => {
    const newData = {
      ...data,
      settings: {
        ...data.settings,
        whatsappNumber: waNumber,
        whatsappTemplate: waTemplate,
        taxRate: Number(taxRate),
        estimateHeaderImage,
      },
    };
    saveAppData(newData);
    setData(newData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
          Settings
        </h1>
        <p className="text-gray-500 text-sm">
          Manage employees, WhatsApp, and business settings
        </p>
      </div>

      {/* Employees */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "#f0e4e6", background: "#fdf2f4" }}
        >
          <h2 className="font-semibold" style={{ color: "#7B1C2B" }}>
            Employee Management
          </h2>
          <Button
            onClick={openAddEmp}
            size="sm"
            className="gap-1 text-xs"
            style={{ background: "#C9A84C", color: "#1A0A10" }}
          >
            <Plus size={13} /> Add Employee
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {["Name", "Username", "Password", "Actions"].map((h) => (
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
            {data.employees.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">
                  No employees
                </td>
              </tr>
            )}
            {data.employees.map((e, i) => (
              <tr
                key={e.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-3 font-medium">{e.name}</td>
                <td className="px-4 py-3 text-gray-600">{e.username}</td>
                <td className="px-4 py-3 text-gray-400">
                  {"\u2022".repeat(e.password.length)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditEmp(e)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEmp(e.id)}
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

      {/* WhatsApp */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold" style={{ color: "#7B1C2B" }}>
          WhatsApp Settings
        </h2>
        <div>
          <Label>WhatsApp Number (with country code, no +)</Label>
          <Input
            value={waNumber}
            onChange={(e) => setWaNumber(e.target.value)}
            className="mt-1 max-w-xs"
            placeholder="919876543210"
          />
          <p className="text-xs text-gray-400 mt-1">
            Example: 919876543210 (91 = India code)
          </p>
        </div>
        <div>
          <Label>Message Template</Label>
          <p className="text-xs text-gray-400 mb-1">
            Use: {"{"}Customer Name{"}"} {"{"}Amount{"}"} {"{"}Phone Number{"}"}
          </p>
          <Textarea
            value={waTemplate}
            onChange={(e) => setWaTemplate(e.target.value)}
            rows={6}
            className="mt-1 font-mono text-sm"
          />
        </div>
      </div>

      {/* Business */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold" style={{ color: "#7B1C2B" }}>
          Business Settings
        </h2>
        <div>
          <Label>GST / Tax Rate (%)</Label>
          <Input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="mt-1 max-w-xs"
          />
        </div>
      </div>

      {/* Estimate Design */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold" style={{ color: "#7B1C2B" }}>
          Estimate Design
        </h2>
        <p className="text-sm text-gray-500">
          Upload a custom header image to replace the default maroon header in
          invoices and estimates.
        </p>
        <input
          ref={headerImgRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleHeaderImageUpload}
        />
        {estimateHeaderImage ? (
          <div className="space-y-3">
            <img
              src={estimateHeaderImage}
              alt="Estimate Header"
              className="max-h-32 rounded-lg border object-cover"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => headerImgRef.current?.click()}
                className="gap-1"
              >
                <ImageIcon size={14} /> Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => setEstimateHeaderImage("")}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => headerImgRef.current?.click()}
            className="gap-2"
          >
            <ImageIcon size={16} /> Upload Header Image
          </Button>
        )}
      </div>

      <Button
        onClick={handleSaveSettings}
        className="gap-2"
        style={{ background: saved ? "#16a34a" : "#7B1C2B", color: "white" }}
      >
        <Save size={16} />
        {saved ? "Saved!" : "Save All Settings"}
      </Button>

      {/* Employee Dialog */}
      <Dialog open={empOpen} onOpenChange={setEmpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: "#7B1C2B" }}>
              {editEmp ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name *</Label>
              <Input
                value={empForm.name}
                onChange={(e) =>
                  setEmpForm({ ...empForm, name: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Username *</Label>
              <Input
                value={empForm.username}
                onChange={(e) =>
                  setEmpForm({ ...empForm, username: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password *</Label>
              <Input
                type="text"
                value={empForm.password}
                onChange={(e) =>
                  setEmpForm({ ...empForm, password: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmpOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEmp}
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
