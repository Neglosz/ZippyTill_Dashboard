import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X, Printer, ArrowRight } from "lucide-react";
import { useBranch } from "../../contexts/BranchContext";

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
    zIndex: 2000,
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "black",
    margin: 0,
    color: "#000",
    letterSpacing: "-0.5px",
  },
  closeButton: {
    position: "absolute",
    right: -5,
    top: -5,
    background: "none",
    border: "none",
    padding: 8,
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
    width: 60,
    height: 60,
    borderRadius: "50%",
    border: "2px solid #35E0AD",
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
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    margin: "0 0 3px 0",
    color: "#333",
  },
  storeAddress: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    margin: 0,
  },
  storePhone: {
    fontSize: 14,
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
    fontSize: 14,
    color: "#333",
    width: 100,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  itemsContainer: {
    maxHeight: 250,
    marginBottom: 15,
    overflowY: "auto",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
  },
  itemHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    paddingBottom: 8,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 10,
  },
  itemNameCol: {
    flex: "1 1 0%",
    fontSize: 14,
    color: "#333",
    lineHeight: "1.2",
  },
  itemPriceCol: {
    width: 60,
    textAlign: "right",
    fontSize: 14,
    color: "#666",
  },
  itemTotalCol: {
    width: 80,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
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
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "black",
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
  const [mounted, setMounted] = useState(false);

  const {
    activeBranchName,
    activeBranchAddress,
    activeBranchPhone,
  } = useBranch();

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
    store: providedStore,
  } = safeTransaction;

  // Store display logic:
  // If not credit sale and name is "ลูกค้าทั่วไป", use branch name.
  const isCreditSale =
    paymentMethod === "เครดิต" || paymentMethod === "credit_sale";
  const rawStoreName = providedStore?.name || "ลูกค้าทั่วไป";

  const displayStoreName =
    !isCreditSale && (rawStoreName === "ลูกค้าทั่วไป" || !providedStore?.name)
      ? activeBranchName || "Goody"
      : rawStoreName;

  const displayAddress =
    providedStore?.address && providedStore?.address !== "-"
      ? providedStore.address
      : activeBranchAddress && activeBranchAddress !== "-"
        ? activeBranchAddress
        : "Kasetsart";

  const displayPhone =
    providedStore?.phone && providedStore?.phone !== "-"
      ? providedStore.phone
      : activeBranchPhone && activeBranchPhone !== "-"
        ? activeBranchPhone
        : "0950527411";

  const store = {
    name: displayStoreName,
    address: displayAddress,
    phone: displayPhone,
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!shouldRender || !mounted) return null;

  const modalContent = (
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
            <Check size={32} color="#35E0AD" strokeWidth={3} />
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
          <div style={styles.itemHeader}>
            <span style={{ flex: "1" }}>ชื่อสินค้า</span>
            <span style={{ width: "60px", textAlign: "right" }}>ราคา</span>
            <span style={{ width: "80px", textAlign: "right" }}>รวม</span>
          </div>
          <div style={styles.itemsList}>
            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <span style={styles.itemName}>
                  {item.name}{" "}
                  {item.unit && item.unit !== "ชิ้น"
                    ? `${item.quantity}${item.unit}`
                    : item.quantity !== 0 && `x${item.quantity}`}
                  {item.price && item.quantity > 0 && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#888",
                        marginLeft: "4px",
                      }}
                    >
                      ({item.unit || "ชิ้น"}ละ {item.price.toLocaleString()})
                    </span>
                  )}
                </span>
                <span style={styles.itemPrice}>
                  ฿
                  {(item.subtotal || item.price * item.quantity).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={styles.totalsContainer}>
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>รวมทั้งหมด</span>
            <span style={styles.totalValue}>฿{total.toLocaleString()}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.totalLabelSmall}>รับเงิน</span>
            <span style={styles.totalValueSmall}>฿{received.toLocaleString()}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={{ ...styles.totalLabelSmall, ...styles.changeColor }}>
              เงินทอน
            </span>
            <span style={{ ...styles.totalValueSmall, ...styles.changeColor }}>
              ฿{change.toLocaleString()}
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

  return createPortal(modalContent, document.body);
}
