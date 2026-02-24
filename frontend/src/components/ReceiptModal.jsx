import React, { useEffect, useState } from "react";
import { Check, X, Printer, ArrowRight } from "lucide-react";

const styles = {
  modalWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    transition: "opacity 0.3s ease",
  },
  modalContent: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
    transition:
      "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 0,
    color: "#333",
  },
  closeButton: {
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "background-color 0.2s ease",
  },
  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 15,
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(53, 224, 173, 0.2) 0%, rgba(53, 224, 173, 0.1) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#35E0AD",
    margin: "0 0 2px 0",
  },
  successSubtitle: {
    fontSize: 14,
    color: "#888",
    margin: 0,
  },
  storeInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottom: "1px dashed #E0E0E0",
  },
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
    margin: "0 0 3px 0",
    color: "#333",
  },
  storeAddress: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    margin: 0,
  },
  storePhone: {
    fontSize: 12,
    color: "#666",
    margin: 0,
  },
  receiptDetails: {
    marginBottom: 15,
  },
  detailRow: {
    display: "flex",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    width: 100,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  itemsContainer: {
    maxHeight: 120,
    marginBottom: 15,
    overflowY: "auto",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
  },
  itemHeader: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    paddingBottom: 8,
    marginBottom: 10,
    borderBottom: "1px dashed #E0E0E0",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#333",
  },
  totalsContainer: {
    borderTop: "1px solid #E0E0E0",
    paddingTop: 15,
    marginBottom: 10,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalLabelSmall: {
    fontSize: 14,
    color: "#666",
  },
  totalValueSmall: {
    fontSize: 14,
    color: "#666",
  },
  changeColor: {
    color: "#35E0AD",
  },
  noteText: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    margin: "0 0 15px 0",
  },
  actionButtons: {
    display: "flex",
    gap: 10,
  },
  printButton: {
    flex: 1,
    backgroundColor: "#4A90D9",
    border: "none",
    borderRadius: 25,
    padding: "12px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
  },
  newTransactionButton: {
    flex: 1,
    backgroundColor: "#35E0AD",
    border: "none",
    borderRadius: 25,
    padding: "12px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
  },
};

export default function ReceiptModal({
  visible,
  transaction,
  onPrint,
  onNewTransaction,
  onClose,
  title = "ใบเสร็จรับเงิน",
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Default transaction data with null safety
  const safeTransaction = transaction || {};
  const {
    receiptNo = "TXHM123456",
    date = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    paymentMethod = "เงินสด",
    items = [],
    total = 0,
    received = 0,
    change = 0,
    store = {
      name: "เจเค ปาร์ค",
      address: "100 ถ.ทุ่งสลา อ.ศรีราชา จ.ชลบุรี",
      phone: "012-xxx-xxxx",
    },
  } = safeTransaction;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose?.();
    }, 250);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <div style={styles.modalWrapper}>
      {/* Embedded CSS for pseudo-classes & scrollbar */}
      <style>{`
        .receipt-close-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
        .receipt-print-button:active,
        .receipt-new-transaction-button:active {
          transform: scale(0.98);
        }
        .receipt-items-container::-webkit-scrollbar {
          width: 4px;
        }
        .receipt-items-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .receipt-items-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        .receipt-items-container::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
        .receipt-modal-content::-webkit-scrollbar {
          width: 6px;
        }
        .receipt-modal-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .receipt-modal-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .receipt-modal-content::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>

      {/* Overlay */}
      <div
        style={{
          ...styles.modalOverlay,
          opacity: isAnimating ? 1 : 0,
        }}
        onClick={handleOverlayClick}
      />

      {/* Content */}
      <div
        className="receipt-modal-content"
        style={{
          ...styles.modalContent,
          transform: isAnimating
            ? "translateY(0) scale(1)"
            : "translateY(100px) scale(0.9)",
          opacity: isAnimating ? 1 : 0,
        }}
      >
        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>{title}</h2>
          <button
            className="receipt-close-button"
            onClick={handleClose}
            style={styles.closeButton}
            aria-label="Close"
          >
            <X size={20} color="#000" />
          </button>
        </div>

        {/* Success Icon */}
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>
            <Check size={40} color="#35E0AD" />
          </div>
          <h3 style={styles.successTitle}>ชำระเงินสำเร็จ</h3>
          <p style={styles.successSubtitle}>ขอบคุณที่ใช้บริการ</p>
        </div>

        {/* Store Info */}
        <div style={styles.storeInfo}>
          <h4 style={styles.storeName}>{store.name}</h4>
          <p style={styles.storeAddress}>{store.address}</p>
          <p style={styles.storePhone}>โทร : {store.phone}</p>
        </div>

        {/* Receipt Details */}
        <div style={styles.receiptDetails}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>เลขที่ :</span>
            <span style={styles.detailValue}>{receiptNo}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>วันที่ :</span>
            <span style={styles.detailValue}>{date}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>วิธีชำระเงิน :</span>
            <span style={styles.detailValue}>{paymentMethod}</span>
          </div>
        </div>

        {/* Items */}
        <div className="receipt-items-container" style={styles.itemsContainer}>
          <div style={styles.itemHeader}>รายการสินค้า</div>
          <div style={styles.itemsList}>
            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <span style={styles.itemName}>
                  {item.name} {item.unit && item.unit !== "ชิ้น" ? `${item.quantity}${item.unit}` : item.quantity !== 0 && `x${item.quantity}`}
                  {item.price && item.quantity > 0 && (
                    <span style={{ fontSize: "10px", color: "#888", marginLeft: "4px" }}>
                      ({item.unit || "ชิ้น"}ละ {item.price.toLocaleString()})
                    </span>
                  )}
                </span>
                <span style={styles.itemPrice}>
                  ฿{(item.subtotal || (item.price * item.quantity)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={styles.totalsContainer}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>รวมทั้งหมด</span>
            <span style={styles.totalValue}>฿{total.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabelSmall}>รับเงิน</span>
            <span style={styles.totalValueSmall}>฿{received.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={{ ...styles.totalLabelSmall, ...styles.changeColor }}>
              เงินทอน
            </span>
            <span style={{ ...styles.totalValueSmall, ...styles.changeColor }}>
              ฿{change.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Note */}
        <p style={styles.noteText}>*** กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน ***</p>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button
            className="receipt-print-button"
            style={styles.printButton}
            onClick={onPrint}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#3a7bc0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#4A90D9")
            }
          >
            <Printer size={18} color="#fff" />
            <span>พิมพ์</span>
          </button>
          <button
            className="receipt-new-transaction-button"
            style={styles.newTransactionButton}
            onClick={onNewTransaction}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#2bc99a")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#35E0AD")
            }
          >
            <span>รายการใหม่</span>
            <ArrowRight size={16} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
