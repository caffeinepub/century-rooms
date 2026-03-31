import type { AppData } from "./types";

const STORAGE_KEY = "centuryrooms_data";

const defaultData: AppData = {
  employees: [
    {
      id: "emp1",
      name: "Staff One",
      username: "staff1",
      password: "staff12",
      role: "employee",
    },
  ],
  parties: [
    {
      id: "p1",
      name: "Rahul Kumar",
      phone: "9876543210",
      email: "rahul@email.com",
    },
    {
      id: "p2",
      name: "Priya Sharma",
      phone: "9123456789",
      email: "priya@email.com",
    },
  ],
  rooms: [
    {
      id: "r1",
      roomNumber: "101",
      type: "AC",
      ratePerDay: 1500,
      isActive: true,
    },
    {
      id: "r2",
      roomNumber: "102",
      type: "Non-AC",
      ratePerDay: 800,
      isActive: true,
    },
    {
      id: "r3",
      roomNumber: "103",
      type: "AC",
      ratePerDay: 2000,
      isActive: true,
    },
  ],
  sales: [
    {
      id: "s1",
      invoiceNumber: 1001,
      customerName: "Rahul Kumar",
      customerPhone: "9876543210",
      roomId: "r1",
      roomNumber: "101",
      days: 3,
      rate: 1500,
      totalAmount: 4500,
      advancePaid: 2000,
      balanceAmount: 2500,
      paymentMethod: "Cash",
      checkInDate: "2026-03-28",
      checkOutDate: "2026-03-31",
      status: "Ongoing",
      createdBy: "ahsan123",
      createdAt: "2026-03-28T10:00:00Z",
    },
    {
      id: "s2",
      invoiceNumber: 1002,
      customerName: "Priya Sharma",
      customerPhone: "9123456789",
      roomId: "r2",
      roomNumber: "102",
      days: 2,
      rate: 800,
      totalAmount: 1600,
      advancePaid: 1600,
      balanceAmount: 0,
      paymentMethod: "GPay",
      checkInDate: "2026-03-25",
      checkOutDate: "2026-03-27",
      status: "Completed",
      createdBy: "ahsan123",
      createdAt: "2026-03-25T12:00:00Z",
    },
  ],
  purchases: [
    {
      id: "pu1",
      itemName: "Cleaning Supplies",
      amount: 500,
      paymentMethod: "Cash",
      date: "2026-03-29",
      createdBy: "ahsan123",
      createdAt: "2026-03-29T09:00:00Z",
    },
    {
      id: "pu2",
      itemName: "Toiletries Stock",
      amount: 1200,
      paymentMethod: "GPay",
      date: "2026-03-30",
      createdBy: "ahsan123",
      createdAt: "2026-03-30T10:00:00Z",
    },
  ],
  estimates: [
    {
      id: "e1",
      customerName: "Amit Verma",
      customerPhone: "9988776655",
      roomNumber: "103",
      days: 4,
      rate: 2000,
      totalAmount: 8000,
      advancePaid: 3000,
      paymentMethod: "Cash",
      date: "2026-04-01",
      status: "Pending",
      createdAt: "2026-03-30T11:00:00Z",
    },
  ],
  settings: {
    whatsappNumber: "919876543210",
    whatsappTemplate:
      "Hi {Customer Name},\n\nDetails of your Sale Invoice from Century Lodging\n\nInvoice Amount: \u20b9 {Amount}\n\nThank you for doing business with us,\nCentury Lodging\n{Phone Number}",
    taxRate: 12,
    businessAddress: "Ernakulam, SRM Road",
    estimateHeaderImage: "",
  },
  nextInvoiceNumber: 1003,
};

export function getAppData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(stored) as AppData;
    // Ensure new fields exist
    if (!parsed.settings.estimateHeaderImage) {
      parsed.settings.estimateHeaderImage = "";
    }
    return parsed;
  } catch {
    return defaultData;
  }
}

export function saveAppData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function formatCurrency(amount: number): string {
  return `\u20b9${amount.toLocaleString("en-IN")}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}
