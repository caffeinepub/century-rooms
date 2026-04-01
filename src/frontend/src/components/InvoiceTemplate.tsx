import { forwardRef } from "react";
import { formatCurrency, formatDate } from "../store";
import type { AppData, Sale } from "../types";

interface Props {
  sale: Sale;
  data: AppData;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, Props>(
  function InvoiceTemplate({ sale, data }, ref) {
    const taxAmt = Math.round((sale.totalAmount * data.settings.taxRate) / 100);
    const grandTotal = sale.totalAmount + taxAmt;
    const invoiceNo = String(sale.invoiceNumber).padStart(4, "0");
    const room = data.rooms.find((r) => r.id === sale.roomId);
    const roomDesc = room
      ? `Room ${sale.roomNumber} (${room.type})`
      : `Room ${sale.roomNumber}`;

    // 5 rows for the table
    const tableRows = [
      {
        sl: 1,
        desc: roomDesc,
        price: formatCurrency(sale.rate),
        qty: `${sale.days} day${sale.days > 1 ? "s" : ""}`,
        total: formatCurrency(sale.totalAmount),
      },
      { sl: 2, desc: "", price: "", qty: "", total: "" },
      { sl: 3, desc: "", price: "", qty: "", total: "" },
      { sl: 4, desc: "", price: "", qty: "", total: "" },
      { sl: 5, desc: "", price: "", qty: "", total: "" },
    ];

    return (
      <div
        ref={ref}
        style={{
          background: "#fff",
          fontFamily: "Arial, sans-serif",
          maxWidth: 580,
          margin: "0 auto",
          border: "1px solid #ddd",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        {data.settings.estimateHeaderImage ? (
          <img
            src={data.settings.estimateHeaderImage}
            alt="Header"
            style={{ width: "100%", maxHeight: 130, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              background: "#7B1C2B",
              padding: "22px 20px 18px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: 4,
                fontFamily: "Georgia, serif",
                textTransform: "uppercase",
              }}
            >
              CENTURY ROOMS
            </div>
            <div
              style={{
                display: "inline-block",
                border: "1.5px solid #fff",
                borderRadius: 4,
                padding: "2px 14px",
                marginTop: 6,
                color: "#fff",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              WHERE COMFORT MEETS CONVENIENCE
            </div>
          </div>
        )}

        {/* Address + INVOICE */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "14px 20px 8px",
          }}
        >
          <div
            style={{
              border: "1.5px solid #333",
              borderRadius: 4,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: "bold",
              lineHeight: 1.6,
            }}
          >
            Ernakulam, SRM ROAD
            <br />
            9605660217
            <br />
            <span style={{ fontWeight: "normal", fontSize: 11, color: "#555" }}>
              For queries: 7907012515
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: "900",
                color: "#222",
                letterSpacing: 1,
              }}
            >
              INVOICE
            </div>
            <div
              style={{
                background: "#7B1C2B",
                color: "#fff",
                borderRadius: 5,
                padding: "3px 14px",
                fontSize: 13,
                fontWeight: "bold",
                marginTop: 4,
              }}
            >
              Date: {formatDate(sale.checkInDate)}
            </div>
          </div>
        </div>

        {/* Invoice No */}
        <div
          style={{
            padding: "4px 20px 8px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontWeight: "bold", fontSize: 13 }}>Invoice No:</span>
          <span
            style={{
              background: "#7B1C2B",
              color: "#fff",
              borderRadius: 4,
              padding: "2px 12px",
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            #{invoiceNo}
          </span>
        </div>

        {/* Bill To */}
        <div style={{ padding: "0 20px 4px" }}>
          <div
            style={{
              background: "#7B1C2B",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 13,
              padding: "3px 12px",
              borderRadius: 3,
              display: "inline-block",
              marginBottom: 4,
            }}
          >
            Bill To:
          </div>
          <div
            style={{
              borderBottom: "1.5px solid #333",
              padding: "2px 0 4px",
              fontSize: 14,
              fontWeight: "600",
              minHeight: 22,
            }}
          >
            {sale.customerName}
          </div>
        </div>

        {/* Phone */}
        <div
          style={{
            padding: "4px 20px 10px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              background: "#C9A84C",
              color: "#1A0A10",
              borderRadius: 3,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: "bold",
            }}
          >
            Phone number
          </span>
          <span style={{ fontSize: 13 }}>{sale.customerPhone}</span>
        </div>

        {/* Table */}
        <div style={{ padding: "0 20px 12px" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <thead>
              <tr style={{ background: "#4A0E1E", color: "#fff" }}>
                {["SL", "ROOM DESCRIPTION", "PRICE", "QTY", "TOTAL"].map(
                  (h, idx) => (
                    <th
                      key={h}
                      style={{
                        padding: "7px 10px",
                        textAlign:
                          idx === 0 ? "center" : idx >= 2 ? "right" : "left",
                        fontWeight: "bold",
                        letterSpacing: 0.5,
                        borderRight: idx < 4 ? "1px solid #C9A84C" : "none",
                      }}
                    >
                      {idx > 0 ? "| " : ""}
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr
                  key={row.sl}
                  style={{ background: i % 2 === 0 ? "#fff" : "#f0f0f0" }}
                >
                  <td
                    style={{
                      padding: "8px 10px",
                      textAlign: "center",
                      borderRight: "1px solid #C9A84C",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {row.sl}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      borderRight: "1px solid #C9A84C",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {row.desc}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      textAlign: "right",
                      borderRight: "1px solid #C9A84C",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {row.price}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      textAlign: "right",
                      borderRight: "1px solid #C9A84C",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {row.qty}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      textAlign: "right",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom: QR + Payment + Totals */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "0 20px 12px",
            gap: 16,
          }}
        >
          {/* Left: QR + Payment */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "#7B1C2B",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                letterSpacing: 1,
                flexShrink: 0,
              }}
            >
              QR
            </div>
            <div>
              <div
                style={{ fontWeight: "bold", fontSize: 13, marginBottom: 4 }}
              >
                Cash Recived US
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                <div>{sale.paymentMethod === "Cash" ? "●" : "○"} Cash</div>
                <div>{sale.paymentMethod === "GPay" ? "●" : "○"} GPay</div>
              </div>
            </div>
          </div>

          {/* Right: Totals */}
          <table
            style={{ fontSize: 12, borderCollapse: "collapse", minWidth: 180 }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "4px 12px",
                    fontWeight: "bold",
                    borderBottom: "1px solid #ddd",
                    background: "#f5f5f5",
                  }}
                >
                  SUB TOTAL:
                </td>
                <td
                  style={{
                    padding: "4px 12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    borderBottom: "1px solid #ddd",
                    background: "#f5f5f5",
                  }}
                >
                  {formatCurrency(sale.totalAmount)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "4px 12px",
                    borderBottom: "1px solid #ddd",
                    background: "#f5f5f5",
                  }}
                >
                  TAX:
                </td>
                <td
                  style={{
                    padding: "4px 12px",
                    textAlign: "right",
                    borderBottom: "1px solid #ddd",
                    background: "#f5f5f5",
                  }}
                >
                  {data.settings.taxRate}%
                </td>
              </tr>
              <tr style={{ background: "#7B1C2B" }}>
                <td
                  style={{
                    padding: "6px 12px",
                    fontWeight: "bold",
                    color: "#fff",
                    fontSize: 13,
                  }}
                >
                  TOTAL:
                </td>
                <td
                  style={{
                    padding: "6px 12px",
                    textAlign: "right",
                    fontWeight: "bold",
                    color: "#fff",
                    fontSize: 13,
                  }}
                >
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "8px 24px 20px",
            borderTop: "1px solid #eee",
          }}
        >
          <div
            style={{
              fontFamily: "cursive",
              fontSize: 28,
              color: "#333",
              fontStyle: "italic",
            }}
          >
            Thank You
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#555",
              fontStyle: "italic",
              textAlign: "right",
            }}
          >
            Authorised Signatory
          </div>
        </div>
      </div>
    );
  },
);

export default InvoiceTemplate;
