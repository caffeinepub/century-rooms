export type Role = "admin" | "employee";
export type PaymentMethod = "Cash" | "GPay" | "Card";
export type RoomType = "AC" | "Non-AC";
export type SaleStatus = "Ongoing" | "Completed";
export type EstimateStatus = "Pending" | "Converted";

export interface Employee {
  id: string;
  name: string;
  username: string;
  password: string;
  role: Role;
}
export interface Party {
  id: string;
  name: string;
  phone: string;
  email: string;
}
export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  ratePerDay: number;
  isActive: boolean;
}
export interface Sale {
  id: string;
  invoiceNumber: number;
  customerName: string;
  customerPhone: string;
  roomId: string;
  roomNumber: string;
  days: number;
  rate: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;
  paymentMethod: PaymentMethod;
  checkInDate: string;
  checkOutDate: string;
  status: SaleStatus;
  createdBy: string;
  createdAt: string;
}
export interface Purchase {
  id: string;
  itemName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  phone?: string;
  receiptImage?: string;
  createdBy: string;
  createdAt: string;
}
export interface Estimate {
  id: string;
  customerName: string;
  customerPhone: string;
  roomNumber: string;
  days: number;
  rate: number;
  totalAmount: number;
  advancePaid: number;
  paymentMethod: PaymentMethod;
  date: string;
  status: EstimateStatus;
  createdAt: string;
}
export interface Settings {
  whatsappNumber: string;
  whatsappTemplate: string;
  taxRate: number;
  businessAddress: string;
  estimateHeaderImage?: string;
}
export interface AppData {
  employees: Employee[];
  parties: Party[];
  rooms: Room[];
  sales: Sale[];
  purchases: Purchase[];
  estimates: Estimate[];
  settings: Settings;
  nextInvoiceNumber: number;
}
export interface CurrentUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}
