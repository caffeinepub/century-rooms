import {
  BedDouble,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings as SettingsIcon,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import type { CurrentUser } from "../types";
import Bills from "./Bills";
import CashBank from "./CashBank";
import Estimates from "./Estimates";
import Home from "./Home";
import Items from "./Items";
import Parties from "./Parties";
import ProfitLoss from "./ProfitLoss";
import Purchases from "./Purchases";
import Sales from "./Sales";
import Settings from "./Settings";

type Tab =
  | "home"
  | "parties"
  | "items"
  | "sales"
  | "purchases"
  | "cashbank"
  | "estimates"
  | "profitloss"
  | "settings"
  | "bills";

interface Props {
  currentUser: CurrentUser;
  onLogout: () => void;
}

const adminNavItems = [
  { id: "home" as Tab, label: "Home", icon: LayoutDashboard },
  { id: "parties" as Tab, label: "Parties", icon: Users },
  { id: "items" as Tab, label: "Rooms", icon: BedDouble },
  { id: "sales" as Tab, label: "Sales", icon: ShoppingCart },
  { id: "purchases" as Tab, label: "Purchases", icon: Package },
  { id: "cashbank" as Tab, label: "Cash & Bank", icon: Wallet },
  { id: "estimates" as Tab, label: "Estimates", icon: FileText },
  { id: "profitloss" as Tab, label: "Profit / Loss", icon: TrendingUp },
  { id: "settings" as Tab, label: "Settings", icon: SettingsIcon },
];

const employeeNavItems = [
  { id: "items" as Tab, label: "Rooms", icon: BedDouble },
  { id: "home" as Tab, label: "Active Rooms", icon: LayoutDashboard },
  { id: "sales" as Tab, label: "Sales", icon: ShoppingCart },
  { id: "purchases" as Tab, label: "Purchases", icon: Package },
  { id: "bills" as Tab, label: "Bills", icon: Receipt },
];

export default function Layout({ currentUser, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("items");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems =
    currentUser.role === "admin" ? adminNavItems : employeeNavItems;

  const renderTab = () => {
    switch (activeTab) {
      case "home":
        return <Home currentUser={currentUser} />;
      case "parties":
        return <Parties currentUser={currentUser} />;
      case "items":
        return <Items currentUser={currentUser} />;
      case "sales":
        return <Sales currentUser={currentUser} />;
      case "purchases":
        return <Purchases currentUser={currentUser} />;
      case "cashbank":
        return <CashBank />;
      case "estimates":
        return <Estimates currentUser={currentUser} />;
      case "profitloss":
        return <ProfitLoss />;
      case "settings":
        return <Settings currentUser={currentUser} />;
      case "bills":
        return <Bills currentUser={currentUser} />;
      default:
        return <Home currentUser={currentUser} />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div
        className="p-6 border-b"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #E0CC8F)",
              color: "#1A0A10",
            }}
          >
            CR
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-widest">
              CENTURY ROOMS
            </div>
            <div className="text-xs" style={{ color: "#C9A84C" }}>
              Where Comfort Meets Convenience
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={
                active
                  ? { background: "#C9A84C", color: "#1A0A10" }
                  : { color: "rgba(255,255,255,0.75)" }
              }
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div
        className="p-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "#C9A84C", color: "#1A0A10" }}
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-medium">
              {currentUser.name}
            </div>
            <div className="text-xs capitalize" style={{ color: "#C9A84C" }}>
              {currentUser.role}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
          }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex-shrink-0 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background:
            "linear-gradient(180deg, #1A0A10 0%, #4A1522 50%, #2A0F18 100%)",
        }}
      >
        <SidebarContent />
      </aside>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: "#7B1C2B" }}
          >
            <Menu size={22} />
          </button>
          <span
            className="font-bold text-sm tracking-wider"
            style={{ color: "#7B1C2B" }}
          >
            CENTURY ROOMS
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={() => setSidebarOpen(false)}
            className="ml-auto p-2 hidden"
            style={{ color: "#7B1C2B" }}
          >
            <X size={22} />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto p-6">{renderTab()}</main>
      </div>
    </div>
  );
}
