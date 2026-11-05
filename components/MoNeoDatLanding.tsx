"use client";

import React, { useState, useEffect, useRef } from "react";

const comboConfig: Record<
  number,
  {
    name: string;
    label: string;
    price: number;
    ship: number;
    total: number;
    shipText: string;
  }
> = {
  5: {
    name: "Combo 5 Cái Mỏ Neo Đất",
    label: "gói 5 cái",
    price: 170000,
    ship: 20000,
    total: 190000,
    shipText: "20.000đ",
  },
  10: {
    name: "Combo 10 Cái Mỏ Neo Đất (Freeship)",
    label: "combo 10 cái",
    price: 299000,
    ship: 0,
    total: 299000,
    shipText: "MIỄN PHÍ (0đ)",
  },
  20: {
    name: "Combo 20 Cái Mỏ Neo Đất (Freeship)",
    label: "combo 20 cái",
    price: 499000,
    ship: 0,
    total: 499000,
    shipText: "MIỄN PHÍ (0đ)",
  },
};

const slides = [
  { src: "/assets/images_neo/hero_neo.jpg", alt: "Mỏ neo đất NDM-10" },
  { src: "/assets/images_neo/problem_sap_gian.jpg", alt: "Sập đổ giàn leo khi không neo cáp" },
  { src: "/assets/images_neo/problem_mai_che_bat.jpg", alt: "Tốc lật bạt che mái hiên khi không neo cáp" },
  { src: "/assets/images_neo/problem_cay_nghieng.jpg", alt: "Nghiêng ngả gãy cành cây ăn trái mùa giông" },
  { src: "/assets/images_neo/neo_slide_4.jpg", alt: "Cơ chế ngậm đất tự khóa" },
  { src: "/assets/images_neo/neo_slide_2.jpg", alt: "Kích thước và kết cấu thép" },
];

const realOrders = [
  { cust: "Anh Thắng (0982.***.418)", item: "Combo 20 cái NDM-10 (499K - Freeship)", time: "1 phút trước" },
  { cust: "Chú Bảy (0915.***.892)", item: "Combo 10 cái NDM-10 (299K - Freeship)", time: "3 phút trước" },
  { cust: "Anh Lâm - Đắk Nông (0903.***.115)", item: "Combo 20 cái NDM-10 (499K - Freeship)", time: "5 phút trước" },
  { cust: "Anh Hùng - Bình Phước (0974.***.629)", item: "Combo 10 cái NDM-10 (299K - Freeship)", time: "8 phút trước" },
  { cust: "Hợp tác xã Vĩnh Long (0942.***.338)", item: "Combo 20 cái NDM-10 (499K - Freeship)", time: "12 phút trước" },
];

export default function MoNeoDatLanding() {
  // 1. Countdown timer
  const [remainingSeconds, setRemainingSeconds] = useState(2 * 3600 + 45 * 60 + 18);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 3 * 3600 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  // 2. Slider
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, []);

  const goToSlide = (idx: number) => {
    if (idx < 0) idx = slides.length - 1;
    if (idx >= slides.length) idx = 0;
    setCurrentSlide(idx);
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  // 3. Form Order state
  const [selectedCombo, setSelectedCombo] = useState<number>(10);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const currentCombo = comboConfig[selectedCombo] || comboConfig[10];

  const scrollToOrder = (comboKey?: number) => {
    if (comboKey) setSelectedCombo(comboKey);
    const target = document.getElementById("orderForm");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "InitiateCheckout");
    }
  };

  // 4. Sticky bar visibility
  const [isStickyHidden, setIsStickyHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const orderFormEl = document.getElementById("orderForm");
      if (!orderFormEl) return;
      const rect = orderFormEl.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const isViewing = rect.top < vh - 50 && rect.bottom > 80;
      setIsStickyHidden(isViewing);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // 5. FAQ Accordion
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true });
  const toggleFaq = (idx: number) => {
    setOpenFaq((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // 6. Realtime Toasts
  const [toastIdx, setToastIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const showTimeout = setTimeout(() => {
      setShowToast(true);
      const hideTimeout = setTimeout(() => setShowToast(false), 4500);

      const interval = setInterval(() => {
        setToastIdx((prev) => (prev + 1) % realOrders.length);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4500);
      }, 9000);

      return () => {
        clearTimeout(hideTimeout);
        clearInterval(interval);
      };
    }, 3000);

    return () => clearTimeout(showTimeout);
  }, []);

  // 7. Form Submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!custName.trim()) {
      alert("Vui lòng nhập họ và tên của bạn!");
      return;
    }
    if (!custPhone.trim()) {
      alert("Vui lòng nhập số điện thoại nhận hàng!");
      return;
    }
    if (!custAddress.trim()) {
      alert("Vui lòng nhập địa chỉ nhận hàng!");
      return;
    }

    setIsSubmitting(true);
    const orderCode = "NDM" + Math.floor(100000 + Math.random() * 900000);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_code: orderCode,
          customer_name: custName.trim(),
          customer_phone: custPhone.trim(),
          customer_address: custAddress.trim(),
          combo_id: selectedCombo,
          combo_name: currentCombo.name,
          product_name: "Mỏ Neo Đất NDM-10 - Chịu Lực Kéo 450kg",
          color: "Thép Mạ Kẽm",
          item_price: currentCombo.price,
          shipping_fee: currentCombo.ship,
          total_price: currentCombo.total,
          note: "",
        }),
      });

      const json = await res.json();
      if (json.success && json.order) {
        setCompletedOrder(json.order);
      } else {
        setCompletedOrder({
          order_code: orderCode,
          customer_name: custName.trim(),
          customer_phone: custPhone.trim(),
          customer_address: custAddress.trim(),
          combo_name: currentCombo.name,
          total_price: currentCombo.total,
        });
      }

      // Meta Pixel: Bắn duy nhất sự kiện Purchase chuẩn Meta Ads
      if (typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "Purchase", {
          value: Number(currentCombo.total),
          currency: "VND",
          content_type: "product",
          content_name: currentCombo.name,
          num_items: Number(selectedCombo),
        });
      }
    } catch (err) {
      console.error("Order submit error:", err);
      setCompletedOrder({
        order_code: orderCode,
        customer_name: custName.trim(),
        customer_phone: custPhone.trim(),
        customer_address: custAddress.trim(),
        combo_name: currentCombo.name,
        total_price: currentCombo.total,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setCompletedOrder(null);
    setCustName("");
    setCustPhone("");
    setCustAddress("");
    setSelectedCombo(10);
  };

  const currentToast = realOrders[toastIdx];

  return (
    <>
      {/* 100% ORIGINAL STYLES PRESERVED */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: #15803d;
          --primary-hover: #166534;
          --primary-gradient: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          --accent-red: #dc2626;
          --accent-red-hover: #b91c1c;
          --accent-orange: #ea580c;
          --dark: #0f172a;
          --gray-50: #f8fafc;
          --gray-100: #f1f5f9;
          --gray-200: #e2e8f0;
          --gray-300: #cbd5e1;
          --gray-500: #64748b;
          --gray-700: #334155;
          --gray-900: #0f172a;
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-full: 9999px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
          --shadow-md: 0 4px 14px rgba(0,0,0,0.08);
          --shadow-glow: 0 4px 16px rgba(220, 38, 38, 0.35);
        }

        .neo-page * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        .neo-page {
          background-color: #f1f5f9;
          color: var(--gray-900);
          display: flex;
          justify-content: center;
          min-height: 100vh;
          line-height: 1.5;
          font-size: 15px;
          -webkit-font-smoothing: antialiased;
        }

        .mobile-app-wrapper {
          width: 100%;
          max-width: 440px;
          background-color: #ffffff;
          min-height: 100vh;
          position: relative;
          box-shadow: 0 0 35px rgba(0,0,0,0.12);
          padding-bottom: 76px;
          overflow-x: hidden;
        }

        .top-banner {
          background: linear-gradient(90deg, #15803d 0%, #16a34a 100%);
          color: #ffffff;
          text-align: center;
          font-size: 13.5px;
          font-weight: 800;
          padding: 8px 10px;
          letter-spacing: 0.2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
        }
        .top-banner .fire {
          font-size: 15px;
        }

        .hero-slider-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background-color: #f8fafc;
          overflow: hidden;
        }

        .slider-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .slide-item {
          min-width: 100%;
          height: 100%;
          position: relative;
        }

        .slide-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .slider-badge-top-left {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.88);
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .slider-badge-top-right {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--accent-red);
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          padding: 4px 9px;
          border-radius: var(--radius-sm);
          z-index: 5;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
        }

        .slider-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid var(--gray-200);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          color: var(--gray-700);
          cursor: pointer;
          z-index: 6;
          box-shadow: var(--shadow-sm);
          user-select: none;
        }
        .slider-nav-btn.prev { left: 10px; }
        .slider-nav-btn.next { right: 10px; }

        .slider-dots {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 6px;
          z-index: 6;
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.55);
          transition: all 0.25s ease;
          cursor: pointer;
        }
        .dot.active {
          width: 20px;
          border-radius: 4px;
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.35);
        }

        .thumbnails-row {
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          background: #ffffff;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .thumbnails-row::-webkit-scrollbar { display: none; }
        .thumb-btn {
          flex: 0 0 56px;
          height: 56px;
          border-radius: 6px;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          background: #f1f5f9;
        }
        .thumb-btn.active {
          border-color: var(--primary);
        }
        .thumb-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .flashsale-bar {
          background: #fff1f2;
          border-top: 1px solid #ffe4e6;
          border-bottom: 1px solid #ffe4e6;
          padding: 9px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: nowrap;
          gap: 6px;
        }
        .flashsale-left {
          font-weight: 900;
          color: #b91c1c;
          font-size: 14px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .flashsale-timer {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13.5px;
          font-weight: 800;
          color: #991b1b;
          white-space: nowrap;
        }
        .flashsale-timer span {
          font-weight: 600;
          font-size: 12.5px;
          color: #7f1d1d;
        }
        .time-box {
          background: #991b1b;
          color: #ffffff;
          font-weight: 900;
          font-size: 13px;
          padding: 2px 6px;
          border-radius: 4px;
          min-width: 24px;
          text-align: center;
        }

        .stock-meter-wrap {
          padding: 10px 14px 6px;
          background: #ffffff;
        }
        .stock-line-text {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          margin-bottom: 5px;
          white-space: nowrap;
        }
        .stock-bar-bg {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 5px;
          overflow: hidden;
        }
        .stock-bar-fill {
          width: 78%;
          height: 100%;
          background: linear-gradient(90deg, #f97316 0%, #ef4444 100%);
          border-radius: 5px;
        }

        .product-main-info {
          padding: 14px 14px 18px;
          background: #fff;
          border-bottom: 8px solid #f1f5f9;
        }
        .product-title {
          font-size: 19.5px;
          font-weight: 900;
          color: var(--gray-900);
          line-height: 1.35;
          margin-bottom: 6px;
        }
        .product-subtitle {
          font-size: 13px;
          color: #15803d;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          color: var(--gray-700);
          margin-bottom: 12px;
          white-space: nowrap;
        }
        .stars {
          color: #f59e0b;
          letter-spacing: -1px;
          font-size: 14px;
        }
        .rating-score {
          font-weight: 800;
          color: #b45309;
          background: #fef3c7;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 13px;
        }

        .price-box {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1.5px solid #86efac;
          border-radius: var(--radius-md);
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .price-current-wrap {
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .price-current {
          font-size: 26px;
          font-weight: 900;
          color: #b91c1c;
          line-height: 1;
        }
        .price-unit {
          font-size: 14px;
          font-weight: 700;
          color: #15803d;
        }
        .price-old {
          font-size: 15px;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 600;
        }
        .discount-tag {
          background: #dc2626;
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 900;
          padding: 3px 8px;
          border-radius: var(--radius-full);
        }

        .trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .trust-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .trust-icon {
          font-size: 18px;
          flex-shrink: 0;
        }
        .trust-text {
          font-size: 12.5px;
          font-weight: 700;
          color: #334155;
          line-height: 1.25;
        }

        .section-wrap {
          padding: 18px 14px;
          background: #ffffff;
          border-bottom: 8px solid #f1f5f9;
        }
        .section-title-box {
          margin-bottom: 12px;
          text-align: center;
        }
        .section-tag {
          font-size: 12px;
          font-weight: 900;
          padding: 3px 9px;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 5px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .section-title {
          font-size: 18.5px;
          font-weight: 900;
          color: var(--gray-900);
          line-height: 1.3;
        }

        .spec-table {
          width: 100%;
          border-collapse: collapse;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .spec-table tr:nth-child(even) { background-color: #f8fafc; }
        .spec-table tr:nth-child(odd) { background-color: #ffffff; }
        .spec-table td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          line-height: 1.4;
        }
        .spec-table td.label {
          width: 36%;
          color: var(--gray-700);
          font-weight: 700;
          white-space: nowrap;
        }
        .spec-table td.val {
          font-weight: 700;
          color: var(--gray-900);
        }

        .concern-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .concern-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 14px 14px;
          box-shadow: var(--shadow-sm);
        }
        .concern-head {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 6px;
        }
        .concern-icon {
          width: 32px;
          height: 32px;
          background: #dcfce7;
          color: #15803d;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }
        .concern-title {
          font-size: 15.5px;
          font-weight: 900;
          color: var(--gray-900);
          line-height: 1.3;
        }
        .concern-desc {
          font-size: 14.5px;
          color: #334155;
          line-height: 1.5;
        }

        .app-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: var(--shadow-sm);
        }
        .app-card:last-child {
          margin-bottom: 0;
        }
        .app-card-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #f1f5f9;
        }
        .app-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .app-card-body {
          padding: 13px 14px;
        }
        .app-card-title {
          font-size: 16.5px;
          font-weight: 900;
          color: var(--gray-900);
          margin-bottom: 5px;
          line-height: 1.35;
        }
        .app-card-desc {
          font-size: 14.5px;
          color: #334155;
          line-height: 1.5;
        }

        .step-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 12px 14px;
          border-radius: 10px;
        }
        .step-num {
          width: 30px;
          height: 30px;
          background: #15803d;
          color: #fff;
          font-size: 15px;
          font-weight: 900;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-content strong {
          font-size: 15.5px;
          font-weight: 800;
          color: var(--gray-900);
          display: block;
          margin-bottom: 2px;
        }
        .step-content p {
          font-size: 14px;
          color: #334155;
          line-height: 1.45;
        }

        .combo-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
        }
        .combo-card {
          border: 2px solid #cbd5e1;
          border-radius: var(--radius-md);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
          background: #fff;
          transition: all 0.2s ease;
        }
        .combo-card.active {
          border-color: #15803d;
          background: #f0fdf4;
          box-shadow: 0 3px 10px rgba(21, 128, 61, 0.15);
        }
        .combo-badge-hot {
          position: absolute;
          top: -10px;
          right: 12px;
          background: var(--accent-red);
          color: #fff;
          font-size: 11.5px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.35);
          white-space: nowrap;
        }
        .combo-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .combo-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .combo-card.active .combo-radio {
          border-color: #15803d;
        }
        .combo-card.active .combo-radio::after {
          content: '';
          width: 10px;
          height: 10px;
          background: #15803d;
          border-radius: 50%;
        }
        .combo-info {
          min-width: 0;
        }
        .combo-info strong {
          display: block;
          font-size: 15.5px;
          font-weight: 900;
          color: var(--gray-900);
          line-height: 1.25;
          white-space: nowrap;
        }
        .combo-info span {
          font-size: 13.5px;
          color: #15803d;
          font-weight: 700;
          white-space: nowrap;
        }
        .combo-price-right {
          text-align: right;
          flex-shrink: 0;
          padding-left: 8px;
        }
        .combo-price-total {
          font-size: 18px;
          font-weight: 900;
          color: #b91c1c;
          display: block;
          line-height: 1.2;
          white-space: nowrap;
        }
        .combo-price-per {
          font-size: 12.5px;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
        }

        .form-order-wrap {
          background: #ffffff;
          padding: 18px 14px;
          border-bottom: 8px solid #f1f5f9;
        }
        .form-title-badge {
          background: #fee2e2;
          color: #b91c1c;
          font-size: 12.5px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 6px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .form-head-title {
          font-size: 18.5px;
          font-weight: 900;
          color: var(--gray-900);
          margin-bottom: 4px;
          line-height: 1.3;
        }
        .form-head-sub {
          font-size: 14px;
          color: var(--gray-700);
          margin-bottom: 14px;
          white-space: nowrap;
        }

        .input-group {
          margin-bottom: 13px;
        }
        .input-label {
          display: block;
          font-size: 14.5px;
          font-weight: 800;
          color: var(--gray-900);
          margin-bottom: 5px;
        }
        .input-label span.req {
          color: #ef4444;
        }
        .input-field, .select-field, .textarea-field {
          width: 100%;
          padding: 11px 12px;
          font-size: 15.5px;
          border: 2px solid #cbd5e1;
          border-radius: var(--radius-sm);
          outline: none;
          transition: border-color 0.2s ease;
          background: #fff;
          color: var(--gray-900);
        }
        .input-field:focus, .select-field:focus, .textarea-field:focus {
          border-color: #15803d;
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.18);
        }
        .textarea-field {
          resize: none;
          font-family: inherit;
        }

        .summary-bill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 14px;
          margin: 14px 0;
        }
        .bill-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14.5px;
          color: var(--gray-700);
          margin-bottom: 6px;
          white-space: nowrap;
        }
        .bill-row strong {
          font-weight: 800;
          font-size: 15px;
        }
        .bill-row.final {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1.5px dashed #cbd5e1;
          font-size: 15.5px;
          font-weight: 900;
          color: #b91c1c;
          margin-bottom: 0;
        }
        .bill-row.final strong {
          font-size: 19px;
        }

        .btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 14px 12px;
          font-size: 17px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          transition: all 0.2s ease;
        }
        .btn-submit:hover {
          background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
          transform: translateY(-1px);
        }
        .btn-submit small {
          font-size: 13px;
          font-weight: 500;
          text-transform: none;
          opacity: 0.95;
          white-space: nowrap;
        }

        .review-score-banner {
          background: #fefce8;
          border: 1.5px solid #fef08a;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .score-num {
          font-size: 28px;
          font-weight: 900;
          color: #b45309;
          line-height: 1;
        }

        .review-card {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 14px;
          margin-bottom: 14px;
        }
        .review-card:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .reviewer-head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .reviewer-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 15px;
          flex-shrink: 0;
        }
        .reviewer-info {
          flex: 1;
          min-width: 0;
        }
        .reviewer-name-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 2px;
        }
        .reviewer-name {
          font-weight: 800;
          font-size: 15px;
          color: var(--gray-900);
          white-space: nowrap;
        }
        .verified-badge {
          font-size: 11.5px;
          font-weight: 800;
          background: #dcfce7;
          color: #15803d;
          padding: 2px 7px;
          border-radius: 4px;
          white-space: nowrap;
        }
        .reviewer-meta-row {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: #64748b;
          white-space: nowrap;
        }
        .reviewer-meta-row .stars {
          color: #f59e0b;
          font-size: 13px;
          letter-spacing: -1px;
        }
        .review-text {
          font-size: 14.5px;
          color: #334155;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .review-photos-grid {
          display: flex;
          gap: 6px;
        }
        .review-thumb {
          width: 72px;
          height: 72px;
          border-radius: 6px;
          overflow: hidden;
          background: #e2e8f0;
        }
        .review-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .faq-clean-box {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        .faq-q {
          padding: 12px 14px;
          background: #f8fafc;
          font-weight: 800;
          font-size: 15px;
          color: var(--gray-900);
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          line-height: 1.35;
        }
        .faq-a {
          padding: 12px 14px;
          font-size: 14.5px;
          color: #334155;
          background: #ffffff;
          line-height: 1.55;
          display: none;
          border-top: 1px solid #e2e8f0;
        }
        .faq-clean-box.open .faq-a {
          display: block;
        }

        .sticky-bar {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 440px;
          height: 64px;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          box-shadow: 0 -3px 12px rgba(0,0,0,0.06);
          transition: transform 0.35s ease, opacity 0.35s ease;
        }
        .sticky-bar.hidden {
          transform: translateX(-50%) translateY(100%) !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .sticky-left {
          display: flex;
          flex-direction: column;
        }
        .sticky-badge {
          font-size: 12px;
          font-weight: 800;
          color: #ea580c;
          white-space: nowrap;
        }
        .sticky-val {
          font-size: 19px;
          font-weight: 900;
          color: #b91c1c;
          line-height: 1.1;
          white-space: nowrap;
        }
        .btn-sticky {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #fff;
          border: none;
          padding: 11px 20px;
          border-radius: var(--radius-full);
          font-size: 15px;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(220, 38, 38, 0.35);
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }

        .order-toast {
          position: fixed;
          bottom: 70px;
          left: 50%;
          transform: translateX(-50%) translateY(25px);
          width: calc(100% - 24px);
          max-width: 365px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 8px 10px 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 25px -4px rgba(0, 0, 0, 0.16), 0 4px 10px -2px rgba(0, 0, 0, 0.08);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .order-toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .toast-thumb-wrap {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .toast-thumb-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .toast-check-badge {
          position: absolute;
          bottom: -1px;
          right: -1px;
          background: #16a34a;
          color: #fff;
          font-size: 9px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #ffffff;
          font-weight: 900;
        }
        .toast-content {
          flex: 1;
          min-width: 0;
        }
        .toast-line-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 2px;
        }
        .toast-cust-name {
          font-size: 12px;
          font-weight: 700;
          color: var(--gray-900);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }
        .toast-time {
          font-size: 10.5px;
          color: #64748b;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .toast-line-mid {
          font-size: 11.5px;
          color: var(--gray-700);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.25;
        }
        .toast-line-mid strong {
          color: #b91c1c;
          font-weight: 700;
        }
        .toast-close-btn {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .toast-close-btn:hover {
          background: #f1f5f9;
          color: #334155;
        }

        .modal-wrap {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 2000;
        }
        .modal-wrap.show {
          display: flex;
        }
        .modal-content {
          background: #ffffff;
          width: 100%;
          max-width: 360px;
          border-radius: var(--radius-md);
          padding: 22px 18px;
          text-align: center;
          box-shadow: 0 16px 30px rgba(0,0,0,0.2);
          animation: popIn 0.3s ease;
        }
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .modal-icon {
          width: 48px;
          height: 48px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 10px;
        }
        .modal-content h3 {
          font-size: 19px;
          font-weight: 900;
          color: var(--gray-900);
          margin-bottom: 4px;
        }
        .modal-bill-info {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin: 14px 0;
          text-align: left;
          font-size: 14px;
          color: var(--gray-700);
          line-height: 1.5;
        }
        .btn-modal-done {
          width: 100%;
          background: var(--accent-red);
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-weight: 900;
          font-size: 15px;
          cursor: pointer;
        }

        .footer-clean {
          padding: 18px 14px 24px;
          text-align: center;
          background: #0f172a;
          color: #94a3b8;
          font-size: 13.5px;
          line-height: 1.5;
        }
      `}} />

      <div className="neo-page">
        <div className="mobile-app-wrapper">

          {/* Top Flash Announcement Bar - 1 DÒNG GỌN GÀNG */}
          <div className="top-banner">
            <span className="fire">⚡</span>
            <span>GIẢM 35% HÔM NAY • MIỄN SHIP TỪ 10 CÁI</span>
          </div>

          {/* 1. HERO SLIDER */}
          <div
            className="hero-slider-wrap"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="slider-badge-top-left">
              <span>🛡️ THÉP HỢP KIM</span>
              <span>•</span>
              <span>BỀN &gt; 10 NĂM</span>
            </div>
            <div className="slider-badge-top-right">-35% HÔM NAY</div>

            <div
              className="slider-track"
              id="sliderContainer"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((s, idx) => (
                <div className="slide-item" key={idx}>
                  <img src={s.src} alt={s.alt} />
                </div>
              ))}
            </div>

            <div className="slider-nav-btn prev" onClick={prevSlide}>‹</div>
            <div className="slider-nav-btn next" onClick={nextSlide}>›</div>

            <div className="slider-dots">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`dot ${idx === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(idx)}
                />
              ))}
            </div>
          </div>

          {/* Thumbnails row */}
          <div className="thumbnails-row">
            {slides.map((s, idx) => (
              <div
                key={idx}
                className={`thumb-btn ${idx === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(idx)}
              >
                <img src={s.src} alt={`thumb ${idx + 1}`} />
              </div>
            ))}
          </div>

          {/* 2. FLASH SALE COUNTDOWN BAR */}
          <div className="flashsale-bar">
            <div className="flashsale-left">
              <span>🔥 ƯU ĐÃI SẮP HẾT</span>
            </div>
            <div className="flashsale-timer">
              <span>Kết thúc sau:</span>
              <div className="time-box">{hours}</div> :
              <div className="time-box">{minutes}</div> :
              <div className="time-box">{seconds}</div>
            </div>
          </div>

          {/* Thanh tiến trình còn lại */}
          <div className="stock-meter-wrap">
            <div className="stock-line-text">
              <span style={{ fontWeight: 900, color: "#b91c1c" }}>⚡ Suất trợ giá hôm nay</span>
              <span style={{ fontWeight: 800, color: "#0f172a" }}>Chỉ còn 28 bộ</span>
            </div>
            <div className="stock-bar-bg">
              <div className="stock-bar-fill" />
            </div>
          </div>

          {/* 3. MAIN PRODUCT INFO */}
          <div className="product-main-info">
            <h1 className="product-title">
              Mỏ Neo Đất NDM-10 - Chịu Lực Kéo Tới 450kg, Độ Bền Trên 10 Năm
            </h1>

            <div className="product-subtitle">
              <span>✓ Thép hợp kim đúc</span>
              <span>•</span>
              <span>Chống rỉ sét</span>
              <span>•</span>
              <span>0 cần đổ bê tông</span>
            </div>

            <div className="rating-row">
              <div className="stars">★★★★★</div>
              <span className="rating-score">4.9 / 5.0</span>
              <span>(1.840 đã bán • 520 đánh giá)</span>
            </div>

            <div className="price-box">
              <div className="price-current-wrap">
                <span className="price-current">29.900đ</span>
                <span className="price-unit">/ cái</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="price-old">45.000đ</span>
                <span className="discount-tag">-35%</span>
              </div>
            </div>

            {/* 2 Chính Sách Cam Kết */}
            <div className="trust-grid">
              <div className="trust-item">
                <div className="trust-icon">📦</div>
                <div className="trust-text">Kiểm tra hàng khi nhận</div>
              </div>
              <div className="trust-item">
                <div className="trust-icon">🛡️</div>
                <div className="trust-text">Cam kết chuẩn 100% như ảnh sản phẩm</div>
              </div>
            </div>
          </div>

          {/* 4. SPECIFICATION TABLE */}
          <div className="section-wrap">
            <div className="section-title-box">
              <span className="section-tag" style={{ background: "#dcfce7", color: "#15803d" }}>THÔNG SỐ CHUẨN</span>
              <h2 className="section-title">THÔNG SỐ MỎ NEO ĐẤT NDM-10</h2>
            </div>

            <table className="spec-table">
              <tbody>
                <tr>
                  <td className="label">Khối lượng</td>
                  <td className="val">135gr / cái (Thép đúc dày dặn)</td>
                </tr>
                <tr>
                  <td className="label">Kích thước</td>
                  <td className="val">Dài 10cm x Rộng 1.5cm x Cao 1.5cm</td>
                </tr>
                <tr>
                  <td className="label">Chất liệu</td>
                  <td className="val">Thép hợp kim đúc đặc mạ kẽm</td>
                </tr>
                <tr>
                  <td className="label">Lực giữ tải</td>
                  <td className="val">Chịu lực kéo nhổ 250kg – 450kg / điểm</td>
                </tr>
                <tr>
                  <td className="label">Độ bền</td>
                  <td className="val">&gt; 10 năm trong mọi loại thổ nhưỡng</td>
                </tr>
                <tr>
                  <td className="label">Ứng dụng</td>
                  <td className="val">Căng giàn leo, căng mái che, giữ cáp chống bão</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. 4 VẤN ĐỀ KHÁCH HÀNG QUAN TÂM NHẤT */}
          <div className="section-wrap">
            <div className="section-title-box">
              <span className="section-tag" style={{ background: "#dcfce7", color: "#15803d" }}>GIẢI QUYẾT TRIỆT ĐỂ</span>
              <h2 className="section-title">4 LỢI ÍCH CỐT LÕI BẠN CẦN</h2>
            </div>

            <div className="concern-grid">
              <div className="concern-card">
                <div className="concern-head">
                  <div className="concern-icon">⚓</div>
                  <div className="concern-title">Chịu Tải 450kg • Càng Kéo Càng Chặt</div>
                </div>
                <div className="concern-desc">
                  Cơ chế tự khóa thông minh: Khi giật ngược cáp, cánh neo tự động xoay ngang 90° ngậm chặt vào lòng đất nén cứng. Chịu lực kéo đến <strong>450kg/điểm</strong>, gió dông bão cấp 10 không nhổ được!
                </div>
              </div>

              <div className="concern-card">
                <div className="concern-head">
                  <div className="concern-icon">⏱️</div>
                  <div className="concern-title">0 Đào Hố • 0 Đổ Bê Tông • Xong 2 Phút</div>
                </div>
                <div className="concern-desc">
                  Không cần thuê thợ, không cần trộn xi măng tốn kém. Chỉ cần 1 người dùng cây sắt phi 10-12mm đóng thẳng mỏ neo xuống đất trong <strong>2 phút</strong> là có ngay điểm neo siêu chắc chắn!
                </div>
              </div>

              <div className="concern-card">
                <div className="concern-head">
                  <div className="concern-icon">🌱</div>
                  <div className="concern-title">Đóng Ngọt Trên Mọi Loại Thổ Nhưỡng</div>
                </div>
                <div className="concern-desc">
                  Đầu neo vát nhọn khí động học, cắm tốt trên đất thịt, đất đỏ bazan, đất sét, đất cát, đất pha sỏi. Đất khô nén cứng chỉ cần tưới chút nước là đóng êm ru.
                </div>
              </div>

              <div className="concern-card">
                <div className="concern-head">
                  <div className="concern-icon">🛡️</div>
                  <div className="concern-title">Thép Hợp Kim Đúc Đặc • Bền &gt; 10 Năm</div>
                </div>
                <div className="concern-desc">
                  Nặng 135gr, mạ kẽm chống rỉ sét, kháng phèn mặn và chống ăn mòn oxy hóa, chôn sâu trong đất ẩm ướt hàng chục năm không lo gãy mục.
                </div>
              </div>
            </div>
          </div>

          {/* 6. HẬU QUẢ KHI KHÔNG DÙNG MỎ NEO ĐẤT (CẢNH BÁO) */}
          <div className="section-wrap">
            <div className="section-title-box">
              <span className="section-tag" style={{ background: "#fee2e2", color: "#b91c1c" }}>CẢNH BÁO NGUY CƠ</span>
              <h2 className="section-title">HẬU QUẢ NẶNG NỀ KHI THIẾU MỎ NEO ĐẤT</h2>
            </div>

            <div className="app-card">
              <div className="app-card-img-wrap">
                <img src="/assets/images_neo/problem_sap_gian.jpg" alt="Sập đổ giàn leo khi không neo cáp" />
              </div>
              <div className="app-card-body">
                <div className="app-card-title">1. Sập Đổ Rạp Cả Giàn Dưa, Chanh Leo Khi Mưa Giông</div>
                <div className="app-card-desc">
                  Không có mỏ neo đất giữ dây cáp giàn, mưa dông giật mạnh làm nghiêng cột, đứt cáp, cả giàn chanh leo, bầu bí đổ sập rạp xuống bùn đất, thiệt hại nặng nề vụ mùa!
                </div>
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-img-wrap">
                <img src="/assets/images_neo/problem_mai_che_bat.jpg" alt="Tốc lật bạt che mái hiên khi không neo cáp" />
              </div>
              <div className="app-card-body">
                <div className="app-card-title">2. Tốc Lật, Rách Toạc Bạt Che & Mái Hiên Ngoài Trời</div>
                <div className="app-card-desc">
                  Bạt căng che nắng mưa ngoài trời, mái hiên sân vườn không neo ghì chân dây cáp, gặp cơn lốc giật tung cọc, rách toạc bạt và làm gãy cong cả khung chống!
                </div>
              </div>
            </div>

            <div className="app-card">
              <div className="app-card-img-wrap">
                <img src="/assets/images_neo/problem_cay_nghieng.jpg" alt="Nghiêng ngả gãy cành cây ăn trái mùa giông" />
              </div>
              <div className="app-card-body">
                <div className="app-card-title">3. Nghiêng Ngả, Gãy Cành Cây Ăn Trái Trong Vườn Nhà</div>
                <div className="app-card-desc">
                  Cây bưởi, cây ăn trái cỡ vừa trĩu quả không chằng néo bị giông quật nghiêng 50 độ, cành trĩu quả gãy toác chạm đất bùn dập nát, xót xa bao công chăm sóc!
                </div>
              </div>
            </div>
          </div>

          {/* 7. HƯỚNG DẪN THI CÔNG 3 BƯỚC */}
          <div className="section-wrap">
            <div className="section-title-box">
              <span className="section-tag" style={{ background: "#dcfce7", color: "#15803d" }}>NHANH GỌN</span>
              <h2 className="section-title">HƯỚNG DẪN 3 BƯỚC THI CÔNG</h2>
            </div>

            <div className="step-list">
              <div className="step-item">
                <div className="step-num">1</div>
                <div className="step-content">
                  <strong>Xỏ dây cáp vào mỏ neo</strong>
                  <p>Luồn dây cáp bọc nhựa hoặc dây thép qua lỗ khuyên trên thân mỏ neo NDM-10 rồi khóa chặt đầu cáp.</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-num">2</div>
                <div className="step-content">
                  <strong>Đóng neo xuống đất bằng cây sắt</strong>
                  <p>Dùng cây sắt phi 10-12mm lồng vào đuôi neo, dùng búa đóng nghiêng 45-60° sâu từ 40cm đến 80cm.</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-num">3</div>
                <div className="step-content">
                  <strong>Rút cây sắt và giật căng cáp</strong>
                  <p>Rút cây sắt lên, giật mạnh sợi cáp để mỏ neo lật ngang 90° khóa ngậm chặt vào lòng đất. Cố định dây vào giàn hoặc mái che!</p>
                </div>
              </div>
            </div>
          </div>

          {/* 8. GÓI COMBO & FORM ĐẶT HÀNG */}
          <div className="form-order-wrap" id="orderForm">
            <div style={{ textAlign: "center" }}>
              <span className="form-title-badge">ƯU ĐÃI TRỰC TIẾP TỪ KHO</span>
              <h2 className="form-head-title">ĐẶT HÀNG NHẬN ƯU ĐÃI HÔM NAY</h2>
              <p className="form-head-sub">Miễn phí ship từ combo 10 cái • Kiểm tra trước khi trả tiền</p>
            </div>

            {/* DANH SÁCH 3 GÓI COMBO - 1 DÒNG ĐỐI XỨNG GỌN GÀNG */}
            <div className="combo-grid">

              {/* Combo 1: 5 cái */}
              <div
                className={`combo-card ${selectedCombo === 5 ? "active" : ""}`}
                onClick={() => setSelectedCombo(5)}
              >
                <div className="combo-left">
                  <div className="combo-radio" />
                  <div className="combo-info">
                    <strong>GÓI 5 CÁI</strong>
                    <span>170K + 20K ship</span>
                  </div>
                </div>
                <div className="combo-price-right">
                  <span className="combo-price-total">190.000đ</span>
                  <span className="combo-price-per">Đã gồm ship</span>
                </div>
              </div>

              {/* Combo 2: 10 cái (HOT) */}
              <div
                className={`combo-card ${selectedCombo === 10 ? "active" : ""}`}
                onClick={() => setSelectedCombo(10)}
              >
                <span className="combo-badge-hot">🔥 BÁN CHẠY NHẤT</span>
                <div className="combo-left">
                  <div className="combo-radio" />
                  <div className="combo-info">
                    <strong>COMBO 10 CÁI</strong>
                    <span>29.900đ/cái • MIỄN SHIP</span>
                  </div>
                </div>
                <div className="combo-price-right">
                  <span className="combo-price-total">299.000đ</span>
                  <span className="combo-price-per">Tiết kiệm 50K</span>
                </div>
              </div>

              {/* Combo 3: 20 cái (VIP) */}
              <div
                className={`combo-card ${selectedCombo === 20 ? "active" : ""}`}
                onClick={() => setSelectedCombo(20)}
              >
                <span className="combo-badge-hot">🌟 TIẾT KIỆM NHẤT</span>
                <div className="combo-left">
                  <div className="combo-radio" />
                  <div className="combo-info">
                    <strong>COMBO 20 CÁI</strong>
                    <span>24.950đ/cái • MIỄN SHIP</span>
                  </div>
                </div>
                <div className="combo-price-right">
                  <span className="combo-price-total">499.000đ</span>
                  <span className="combo-price-per">Tiết kiệm 150K</span>
                </div>
              </div>

            </div>

            {/* FORM NHẬP THÔNG TIN */}
            <form onSubmit={handleOrderSubmit} style={{ marginTop: "16px" }}>
              <div className="input-group">
                <label className="input-label" htmlFor="custName">
                  Họ và tên người nhận: <span className="req">*</span>
                </label>
                <input
                  type="text"
                  id="custName"
                  className="input-field"
                  placeholder="Ví dụ: Nguyễn Văn Hoàng"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="custPhone">
                  Số điện thoại nhận hàng: <span className="req">*</span>
                </label>
                <input
                  type="tel"
                  id="custPhone"
                  className="input-field"
                  placeholder="Ví dụ: 0912 345 678"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="custAddress">
                  Địa chỉ nhận hàng chi tiết: <span className="req">*</span>
                </label>
                <textarea
                  id="custAddress"
                  className="textarea-field"
                  rows={2}
                  placeholder="Số nhà, thôn/ấp/xã, phường/huyện, tỉnh thành"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  required
                />
              </div>

              <div className="summary-bill">
                <div className="bill-row">
                  <span>Tiền hàng:</span>
                  <strong>{currentCombo.price.toLocaleString("vi-VN")}đ</strong>
                </div>
                <div className="bill-row">
                  <span>Phí vận chuyển:</span>
                  <strong style={{ color: "#15803d" }}>{currentCombo.shipText}</strong>
                </div>
                <div className="bill-row final">
                  <span>TỔNG THANH TOÁN:</span>
                  <strong>{currentCombo.total.toLocaleString("vi-VN")}đ</strong>
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit"
                id="btnSubmitOrder"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "ĐANG XỬ LÝ..." : "👉 XÁC NHẬN ĐẶT HÀNG"}</span>
                <small>(Kiểm tra hàng đúng chất lượng mới thanh toán tiền)</small>
              </button>
            </form>
          </div>

          {/* 9. ĐÁNH GIÁ THỰC TẾ TỪ NHÀ VƯỜN */}
          <div className="section-wrap">
            <div className="section-title-box">
              <span className="section-tag" style={{ background: "#fef3c7", color: "#b45309" }}>NGƯỜI DÙNG THỰC TẾ</span>
              <h2 className="section-title">HÌNH ẢNH SỬ DỤNG TẠI NHÀ VƯỜN</h2>
            </div>

            <div className="review-score-banner">
              <div className="score-num">4.9</div>
              <div>
                <div className="stars" style={{ fontSize: "16px", marginBottom: "2px" }}>★★★★★</div>
                <div style={{ fontSize: "13.5px", color: "#78350f", fontWeight: 800 }}>
                  Hơn 520 nhà vườn đánh giá rất hài lòng
                </div>
              </div>
            </div>

            {/* Review 1 */}
            <div className="review-card">
              <div className="reviewer-head">
                <div className="reviewer-avatar" style={{ background: "#dcfce7", color: "#15803d" }}>T</div>
                <div className="reviewer-info">
                  <div className="reviewer-name-row">
                    <span className="reviewer-name">Anh Hoàng Văn Thắng</span>
                    <span className="verified-badge">✓ Đã mua 20 cái</span>
                  </div>
                  <div className="reviewer-meta-row">
                    <span className="stars">★★★★★</span>
                    <span>•</span>
                    <span>Đắk Lắk (Vườn chanh leo)</span>
                  </div>
                </div>
              </div>
              <div className="review-text">
                Neo này đóng chắc dã man anh em ạ! Vườn chanh leo 2 héc-ta của mình đợt trước mưa gió cứ xô giàn hoài, chuyển qua đóng mỏ neo đất NDM-10 này dây cáp căng cứng ngắc, lấy xe máy kéo thử không hề nhúc nhích. Tiết kiệm biết bao nhiêu tiền thuê thợ đổ bê tông. Đóng gói rất cẩn thận, cho shop 5 sao!
              </div>
              <div className="review-photos-grid">
                <div className="review-thumb"><img src="/assets/images_neo/review_1.jpg" alt="Review 1" /></div>
                <div className="review-thumb"><img src="/assets/images_neo/review_2.jpg" alt="Review 2" /></div>
                <div className="review-thumb"><img src="/assets/images_neo/review_3.jpg" alt="Review 3" /></div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="review-card">
              <div className="reviewer-head">
                <div className="reviewer-avatar" style={{ background: "#e0f2fe", color: "#0284c7" }}>B</div>
                <div className="reviewer-info">
                  <div className="reviewer-name-row">
                    <span className="reviewer-name">Chú Bảy Nông</span>
                    <span className="verified-badge">✓ Đã mua 20 cái</span>
                  </div>
                  <div className="reviewer-meta-row">
                    <span className="stars">★★★★★</span>
                    <span>•</span>
                    <span>Bình Phước (Vườn sầu riêng)</span>
                  </div>
                </div>
              </div>
              <div className="review-text">
                Chằng chống cây sầu riêng mùa mưa bão quá tiện. Lấy cây sắt 12mm đóng sâu 70cm, giật ngược lên là neo tự khóa ngậm đất luôn. Thép đặc nặng tay, mạ nhẵn bóng không lo gỉ sét. Mua combo 20 cái được miễn phí ship giao tận nơi, đóng gói rất cẩn thận, rất hài lòng.
              </div>
              <div className="review-photos-grid">
                <div className="review-thumb"><img src="/assets/images_neo/review_4.jpg" alt="Review 4" /></div>
                <div className="review-thumb"><img src="/assets/images_neo/review_5.jpg" alt="Review 5" /></div>
                <div className="review-thumb"><img src="/assets/images_neo/review_6.jpg" alt="Review 6" /></div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="review-card">
              <div className="reviewer-head">
                <div className="reviewer-avatar" style={{ background: "#fef3c7", color: "#b45309" }}>L</div>
                <div className="reviewer-info">
                  <div className="reviewer-name-row">
                    <span className="reviewer-name">Văn Lâm Farm</span>
                    <span className="verified-badge">✓ Đã mua 10 cái</span>
                  </div>
                  <div className="reviewer-meta-row">
                    <span className="stars">★★★★★</span>
                    <span>•</span>
                    <span>Lâm Đồng (Nhà màng)</span>
                  </div>
                </div>
              </div>
              <div className="review-text">
                Dùng để chằng mép bạt màng nhà kính cực kỳ an tâm. Gió giật mạnh không sợ lật mái. Shop giao hàng nhanh, đúng hẹn, có cho đồng kiểm mở hộp xem mỏ neo trước khi thanh toán. Sẽ tiếp tục ủng hộ thêm cho trại tiếp theo.
              </div>
            </div>
          </div>

          {/* 10. CÂU HỎI PHỔ BIẾN (FAQ) */}
          <div className="section-wrap">
            <div className="section-title-box">
              <span className="section-tag" style={{ background: "#e0f2fe", color: "#0369a1" }}>GIẢI ĐÁP NHANH</span>
              <h2 className="section-title">CÂU HỎI THƯỜNG GẶP</h2>
            </div>

            <div className={`faq-clean-box ${openFaq[0] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(0)}>
                <span>1. Có được kiểm tra hàng trước khi thanh toán không?</span>
                <span>▼</span>
              </div>
              <div className="faq-a">
                Dạ CÓ! Quý khách hoàn toàn được quyền mở hộp kiểm tra đúng mỏ neo đất NDM-10 bằng thép hợp kim đúc đặc, đúng số lượng đã đặt, ưng ý rồi mới thanh toán tiền cho Shipper.
              </div>
            </div>

            <div className={`faq-clean-box ${openFaq[1] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(1)}>
                <span>2. Đóng mỏ neo cần cây sắt phi bao nhiêu?</span>
                <span>▼</span>
              </div>
              <div className="faq-a">
                Đuôi mỏ neo NDM-10 có lỗ tiếp nhận cây sắt đóng đường kính 10mm - 12mm (loại sắt xây dựng phi 10 hoặc phi 12 rất thông dụng ở các tiệm vật liệu xây dựng với giá chỉ vài ngàn đồng, cắt ngắn 70cm - 1m là dùng đóng neo rất tiện lợi!).
              </div>
            </div>

            <div className={`faq-clean-box ${openFaq[2] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(2)}>
                <span>3. Đất cứng, đất sỏi đá có đóng neo được không?</span>
                <span>▼</span>
              </div>
              <div className="faq-a">
                Mỏ neo NDM-10 làm bằng thép hợp kim độ cứng cao, thiết kế vát đầu nên đóng rất tốt trên các loại đất thịt, đất sét, đất cát, đất đỏ bazan. Đối với đất sỏi đá cứng, bạn chỉ cần tưới 1 ca nước vào vị trí cắm hoặc dùng cây xà beng dùi mồi nhẹ trước rồi đóng neo xuống là cực kỳ chắc chắn.
              </div>
            </div>

            <div className={`faq-clean-box ${openFaq[3] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(3)}>
                <span>4. Sau này muốn nhổ lên hoặc chuyển vườn có được không?</span>
                <span>▼</span>
              </div>
              <div className="faq-a">
                Có thể tháo dỡ bằng cách đào sâu theo thân neo để lấy lại mỏ neo tái sử dụng cho mùa vụ sau, hoặc nếu để cố định thì độ bền của thép hợp kim ngậm trong đất trên 10 năm không mục gỉ.
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="footer-clean">
            <div style={{ fontWeight: 900, fontSize: "14.5px", color: "#fff", marginBottom: "4px" }}>
              VẬT TƯ NÔNG NGHIỆP & CƠ KHÍ CHÍNH HÃNG
            </div>
            <p>Chuyên cung cấp mỏ neo đất NDM-10, dây cáp, tăng đơ và phụ kiện giàn leo nhà màng cao cấp</p>
          </div>

          {/* 11. STICKY BOTTOM BAR */}
          <div className={`sticky-bar ${isStickyHidden ? "hidden" : ""}`}>
            <div className="sticky-left">
              <span className="sticky-badge">⚡ Giá ưu đãi hôm nay</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                <span className="sticky-val">{currentCombo.total.toLocaleString("vi-VN")}đ</span>
                <span className="sticky-combo" style={{ fontSize: "13px", fontWeight: 700, color: "#15803d", whiteSpace: "nowrap" }}>
                  / {currentCombo.label}
                </span>
              </div>
            </div>
            <button className="btn-sticky" onClick={() => scrollToOrder(selectedCombo)}>
              <span>MUA NGAY ⚡</span>
            </button>
          </div>

          {/* 12. REALTIME ORDER TOAST */}
          <div className={`order-toast ${showToast ? "show" : ""}`}>
            <div className="toast-thumb-wrap">
              <img src="/assets/images_neo/hero_neo.jpg" alt="Mỏ neo đất" />
              <span className="toast-check-badge">✓</span>
            </div>
            <div className="toast-content">
              <div className="toast-line-top">
                <span className="toast-cust-name">{currentToast.cust}</span>
                <span className="toast-time">{currentToast.time}</span>
              </div>
              <div className="toast-line-mid">
                Vừa đặt: <strong>{currentToast.item}</strong>
              </div>
            </div>
            <div className="toast-close-btn" onClick={(e) => { e.stopPropagation(); setShowToast(false); }}>✕</div>
          </div>

          {/* 13. MODAL ĐẶT HÀNG THÀNH CÔNG */}
          {completedOrder && (
            <div className="modal-wrap show">
              <div className="modal-content">
                <div className="modal-icon">✓</div>
                <h3>ĐẶT HÀNG THÀNH CÔNG!</h3>
                <p style={{ fontSize: "14.5px", color: "#64748b" }}>Shop sẽ gọi để xác nhận đơn hàng với bạn trước khi giao</p>
                
                <div className="modal-bill-info">
                  <div style={{ marginBottom: "5px" }}>
                    <strong>Mã đơn:</strong> <span style={{ color: "#15803d", fontWeight: 900 }}>#{completedOrder.order_code}</span>
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <strong>Gói:</strong> {completedOrder.combo_name || currentCombo.name}
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <strong>Người nhận:</strong> {completedOrder.customer_name} - {completedOrder.customer_phone}
                  </div>
                  <div style={{ marginBottom: "5px" }}>
                    <strong>Địa chỉ:</strong> {completedOrder.customer_address}
                  </div>
                  <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1.5px dashed #cbd5e1" }}>
                    <strong>Tổng thanh toán (COD):</strong>{" "}
                    <span style={{ color: "#b91c1c", fontSize: "18px", fontWeight: 900 }}>
                      {Number(completedOrder.total_price || currentCombo.total).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <button className="btn-modal-done" onClick={closeSuccessModal}>
                  HOÀN TẤT VÀ ĐÓNG
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
