import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, MessageCircle, Printer, Send } from "lucide-react";
import { useRef, useState } from "react";
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
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const resendInvoiceRef = useRef<HTMLDivElement>(null);

  const completedSales = data.sales.filter((s) => s.status === "Completed");

  const openBill = (s: Sale) => {
    setViewSale(s);
    setOpen(true);
  };

  const handleDownloadAndWhatsApp = async (s: Sale) => {
    if (!invoiceRef.current) return;
    // Open blank window immediately (synchronous, direct user gesture)
    const waWindow = window.open("", "_blank");
    setPdfGenerating(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPos =
        imgHeight < pageHeight - 20 ? (pageHeight - imgHeight) / 2 : 10;
      pdf.addImage(
        imgData,
        "PNG",
        10,
        yPos,
        imgWidth,
        Math.min(imgHeight, pageHeight - 20),
      );
      const invoiceNo = String(s.invoiceNumber).padStart(4, "0");
      pdf.save(`invoice-${invoiceNo}.pdf`);
      const phone = s.customerPhone.replace(/\D/g, "");
      const msg = `Dear ${s.customerName}, please find your Century Rooms invoice #${invoiceNo} attached. Total: ₹${s.totalAmount}. For queries call 7907012515. Thank you for your stay!`;
      if (waWindow) {
        waWindow.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      }
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleResendBill = async (s: Sale) => {
    // Open blank window immediately (synchronous, direct user gesture)
    const waWindow = window.open("", "_blank");
    setResendingId(s.id);
    // Wait a tick for the hidden InvoiceTemplate to render
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
      if (!resendInvoiceRef.current) return;
      const canvas = await html2canvas(resendInvoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPos =
        imgHeight < pageHeight - 20 ? (pageHeight - imgHeight) / 2 : 10;
      pdf.addImage(
        imgData,
        "PNG",
        10,
        yPos,
        imgWidth,
        Math.min(imgHeight, pageHeight - 20),
      );
      const invoiceNo = String(s.invoiceNumber).padStart(4, "0");
      pdf.save(`invoice-${invoiceNo}.pdf`);
      const phone = s.customerPhone.replace(/\D/g, "");
      const msg = `Dear ${s.customerName}, please find your Century Rooms invoice #${invoiceNo} attached. Total: ₹${s.totalAmount}. For queries call 7907012515. Thank you for your stay!`;
      if (waWindow) {
        waWindow.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      }
    } finally {
      setResendingId(null);
    }
  };

  // The sale being resent (for the hidden off-screen render)
  const resendSale = resendingId
    ? (completedSales.find((s) => s.id === resendingId) ?? null)
    : null;

  return (
    <div className="space-y-6">
      {/* Hidden off-screen invoice for resend PDF generation */}
      {resendSale && (
        <div
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: "794px",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <InvoiceTemplate
            ref={resendInvoiceRef}
            sale={resendSale}
            data={data}
          />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#7B1C2B" }}>
          Bills
        </h1>
        <p className="text-gray-500 text-sm">
          Checked-out customers — print or send bills here
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
            {completedSales.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-gray-400"
                  data-ocid="bills.empty_state"
                >
                  No checked-out customers yet
                </td>
              </tr>
            )}
            {completedSales.map((s, i) => (
              <tr
                key={s.id}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                data-ocid={`bills.item.${i + 1}`}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openBill(s)}
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
                      style={{ background: "#7B1C2B", color: "#fff" }}
                      data-ocid={`bills.view_bill.button.${i + 1}`}
                    >
                      <Printer size={12} /> View Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResendBill(s)}
                      disabled={resendingId === s.id}
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded disabled:opacity-60"
                      style={{ background: "#25D366", color: "#fff" }}
                      data-ocid={`bills.resend_bill.button.${i + 1}`}
                    >
                      {resendingId === s.id ? (
                        <>
                          <Send size={12} className="animate-pulse" />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={12} /> Resend Bill
                        </>
                      )}
                    </button>
                  </div>
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
              <InvoiceTemplate ref={invoiceRef} sale={viewSale} data={data} />
              <div className="flex justify-end gap-2 mt-4 flex-wrap">
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
                <Button
                  onClick={() => handleDownloadAndWhatsApp(viewSale)}
                  disabled={pdfGenerating}
                  className="gap-2"
                  style={{ background: "#25D366", color: "white" }}
                  data-ocid="bills.finish_whatsapp.button"
                >
                  <Download size={16} />
                  <MessageCircle size={16} />
                  {pdfGenerating
                    ? "Generating..."
                    : "Download PDF & Send WhatsApp"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
