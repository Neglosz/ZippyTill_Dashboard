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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(2px)",
    transition: "opacity 0.3s ease",
  },
  modalContent: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: "32px 24px",
    width: "90%",
    maxWidth: 420,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 0,
    color: "#000",
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
  storeInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
    gap: 4,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "800",
    margin: 0,
    color: "#000",
    textAlign: "center",
  },
  storeAddress: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    margin: 0,
    lineHeight: "1.4",
  },
  storePhone: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    margin: 0,
  },
  receiptDetails: {
    marginBottom: 24,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  detailRow: {
    display: "flex",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    width: 100,
    flexShrink: 0,
  },
  detailValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  itemHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    paddingBottom: 12,
    borderBottom: "1px solid #f0f0f0",
    marginBottom: 12,
    display: "flex",
    justifyContent: "space-between",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: "#000",
    lineHeight: "1.4",
  },
  itemPrice: {
    width: 60,
    textAlign: "right",
    fontSize: 14,
    color: "#666",
  },
  itemTotal: {
    width: 80,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  totalsContainer: {
    borderTop: "1px solid #f0f0f0",
    paddingTop: 16,
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  receiveLabel: {
    fontSize: 14,
    color: "#999",
  },
  receiveValue: {
    fontSize: 14,
    color: "#999",
  },
  changeLabel: {
    fontSize: 14,
    color: "#35E0AD",
    fontWeight: "500",
  },
  changeValue: {
    fontSize: 14,
    color: "#35E0AD",
    fontWeight: "bold",
  },
  noteText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    margin: "0 0 24px 0",
    fontWeight: "500",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "center",
  },
  printButton: {
    width: "100%",
    maxWidth: 240,
    backgroundColor: "#6399DD",
    border: "none",
    borderRadius: 30,
    padding: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    transition: "all 0.2s ease",
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

  // Format date to Thai
  const formatDateThai = (inputDate) => {
    const d = new Date(inputDate);
    if (isNaN(d.getTime())) return inputDate;
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return `${day} ${month} ${year} เวลา ${time}`;
  };

  // Map payment method to requested format
  const mapPaymentMethod = (method) => {
    switch (method?.toLowerCase()) {
      case "credit_sale":
      case "เครดิต":
        return "เครดิต (ค้างจ่าย)";
      case "cash":
      case "เงินสด":
        return "เงินสด";
      case "transfer":
      case "โอนเงิน":
        return "โอนเงิน";
      default:
        return method || "เงินสด";
    }
  };

  // Default transaction data with null safety
  const safeTransaction = transaction || {};
  const {
    receiptNo = "ORD-XXXXXXXX",
    date: rawDate = new Date(),
    paymentMethod: rawPaymentMethod = "เงินสด",
    items = [],
    total = 0,
    received = 0,
    change = 0,
    store: providedStore,
  } = safeTransaction;

  const displayDate = formatDateThai(rawDate);
  const displayPaymentMethod = mapPaymentMethod(rawPaymentMethod);

  // Store display logic:
  // If not credit sale and name is "ลูกค้าทั่วไป", use branch name.
  const isCreditSale =
    rawPaymentMethod?.toLowerCase() === "เครดิต" || rawPaymentMethod?.toLowerCase() === "credit_sale";
  const rawStoreName = providedStore?.name || "ลูกค้าทั่วไป";

  const displayStoreName =
    !isCreditSale && (rawStoreName === "ลูกค้าทั่วไป" || !providedStore?.name)
      ? activeBranchName || "ม่าม่านาญ"
      : rawStoreName;

  const displayAddress =
    providedStore?.address && providedStore?.address !== "-"
      ? providedStore.address
      : activeBranchAddress && activeBranchAddress !== "-"
        ? activeBranchAddress
        : "199, Thung Sukhla, Si Racha District, Chon Buri 20230";

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
      <style>{`
        .receipt-action-button:active {
          transform: scale(0.96);
        }
        .receipt-items-container::-webkit-scrollbar {
          width: 0px;
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
            onClick={handleClose}
            style={styles.closeButton}
            aria-label="Close"
          >
            <X size={24} color="#000" />
          </button>
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
            <span style={styles.detailValue}>{displayDate}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>วิธีชำระเงิน :</span>
            <span style={styles.detailValue}>{displayPaymentMethod}</span>
          </div>
        </div>

        {/* Items */}
        <div className="receipt-items-container" style={styles.itemsContainer}>
          <div style={styles.itemHeader}>
            <span>ชื่อสินค้า</span>
            <div style={{ display: "flex" }}>
              <span style={{ width: "60px", textAlign: "right" }}>ราคา</span>
              <span style={{ width: "80px", textAlign: "right" }}>รวม</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <span style={styles.itemName}>
                  {item.name}{" "}
                  {item.unit && item.unit !== "ชิ้น"
                    ? `x${item.quantity}${item.unit}`
                    : item.quantity !== 0 && `x${item.quantity} ชิ้น`}
                </span>
                <span style={styles.itemPrice}>
                  {(item.price || 0).toFixed(1)}
                </span>
                <span style={styles.itemTotal}>
                  {(item.subtotal || (item.price || 0) * (item.quantity || 0)).toFixed(1)}
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
            <span style={styles.receiveLabel}>รับเงิน</span>
            <span style={styles.receiveValue}>฿{received.toLocaleString()}</span>
          </div>
          <div style={styles.totalRow}>
            <span style={styles.changeLabel}>เงินทอน</span>
            <span style={styles.changeValue}>฿{change.toLocaleString()}</span>
          </div>
        </div>

        {/* Note */}
        <p style={styles.noteText}>*** กรุณาเก็บใบเสร็จไว้เป็นหลักฐาน ***</p>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button
            className="receipt-action-button"
            style={styles.printButton}
            onClick={onPrint}
          >
            <Printer size={20} color="#fff" />
            <span>พิมพ์</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
