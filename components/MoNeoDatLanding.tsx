"use client";

import React, { useState, useEffect, useRef } from "react";

const comboConfig: Record<
  number,
  {
    id: number;
    name: string;
    label: string;
    price: number;
    oldPrice: number;
    ship: number;
    total: number;
    shipText: string;
    badge?: string;
    reason?: string;
    tagClass?: string;
  }
> = {
  5: {
    id: 5,
    name: "Combo 5 cái NEO-10",
    label: "Gói 5 cái",
    price: 170000,
    oldPrice: 225000,
    ship: 20000,
    total: 190000,
    shipText: "20.000đ",
    reason: "Gói nhỏ dùng thử",
  },
  10: {
    id: 10,
    name: "Combo 10 cái NEO-10",
    label: "Combo 10 cái",
    price: 299000,
    oldPrice: 450000,
    ship: 0,
    total: 299000,
    shipText: "MIỄN PHÍ",
    badge: "Khuyên dùng",
    reason: "Freeship • Vừa đủ cả giàn",
    tagClass: "bestseller",
  },
  20: {
    id: 20,
    name: "Combo 20 cái NEO-10",
    label: "Combo 20 cái",
    price: 499000,
    oldPrice: 900000,
    ship: 0,
    total: 499000,
    shipText: "MIỄN PHÍ",
    badge: "Siêu tiết kiệm",
    reason: "Freeship • Chỉ 24.9k/cái",
    tagClass: "supersaver",
  },
};

type MediaSlide = {
  type: "video" | "image";
  src: string;
  alt: string;
  poster?: string;
};

const slides: MediaSlide[] = [
  {
    type: "video",
    src: "/assets/images_neo/mo_neo_2.mp4",
    alt: "Video thực tế mỏ neo đất NEO-10 chịu tải tới 450kg",
    poster: "/assets/images_neo/hero_neo.jpg",
  },
  {
    type: "image",
    src: "/assets/images_neo/hero_neo.jpg",
    alt: "Mỏ neo đất NEO-10 đúc đặc mạ kẽm",
  },
  {
    type: "image",
    src: "/assets/images_neo/problem_sap_gian.jpg",
    alt: "Hậu quả sập đổ giàn leo khi không neo cáp chịu lực",
  },
  {
    type: "image",
    src: "/assets/images_neo/problem_mai_che_bat.jpg",
    alt: "Tốc lật bạt che mái hiên nhà màng khi giông gió",
  },
  {
    type: "image",
    src: "/assets/images_neo/problem_cay_nghieng.jpg",
    alt: "Nghiêng ngả gãy cành cây ăn trái mùa giông bão",
  },
];

const realOrders = [
  { cust: "Anh Thắng (0982.***.418)", item: "Combo 20 cái NEO-10 (499K - Freeship)", time: "1 phút trước" },
  { cust: "Chú Bảy Nông (0915.***.892)", item: "Combo 10 cái NEO-10 (299K - Freeship)", time: "3 phút trước" },
  { cust: "Anh Lâm - Đắk Nông (0903.***.115)", item: "Combo 20 cái NEO-10 (499K - Freeship)", time: "5 phút trước" },
  { cust: "Anh Hùng - Bình Phước (0974.***.629)", item: "Combo 10 cái NEO-10 (299K - Freeship)", time: "8 phút trước" },
  { cust: "Hợp tác xã Vĩnh Long (0942.***.338)", item: "Combo 20 cái NEO-10 (499K - Freeship)", time: "12 phút trước" },
  { cust: "Bác Ba Vườn Bưởi (0938.***.721)", item: "Combo 10 cái NEO-10 (299K - Freeship)", time: "15 phút trước" },
];

export default function MoNeoDatLanding() {
  // 1. Countdown timer (8 tiếng)
  const [remainingSeconds, setRemainingSeconds] = useState(7 * 3600 + 58 * 60 + 42);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => (prev <= 1 ? 8 * 3600 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(remainingSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((remainingSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

  // 2. Slider & Video state
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Điều khiển phát/dừng video khi chuyển slide
  useEffect(() => {
    if (currentSlide === 0) {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [currentSlide]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Tự động chuyển slide (chỉ chuyển khi không ở slide video)
  useEffect(() => {
    if (currentSlide === 0) return;

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, [currentSlide]);

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

  // 3. Form Order state & Combo selection
  const [selectedCombo, setSelectedCombo] = useState<number>(10);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const currentCombo = comboConfig[selectedCombo] || comboConfig[10];
  const calculatedTotal = currentCombo.price * orderQuantity + (currentCombo.ship > 0 ? currentCombo.ship : 0);

  const scrollToOrder = (comboKey?: number) => {
    if (comboKey) setSelectedCombo(comboKey);
    const target = document.getElementById("order-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "InitiateCheckout");
    }
  };

  // 4. Sticky bar visibility
  const [isStickyHidden, setIsStickyHidden] = useState(false);

  // Meta Pixel Tracking: ViewContent (25% hoặc >6s), Scroll_50, Scroll_90
  const firedScrollEvents = useRef({
    viewContent: false,
    scroll50: false,
    scroll90: false,
  });

  useEffect(() => {
    const timeOnPageTimer = setTimeout(() => {
      if (!firedScrollEvents.current.viewContent && typeof (window as any).fbq === "function") {
        firedScrollEvents.current.viewContent = true;
        (window as any).fbq("track", "ViewContent", {
          content_name: "Mỏ Neo Đất NEO-10",
          content_category: "Nông nghiệp & Nhà vườn",
          content_type: "product",
          value: 299000,
          currency: "VND",
        });
      }
    }, 6000);

    const handleScrollTracking = () => {
      const orderFormEl = document.getElementById("order-section");
      if (orderFormEl) {
        const rect = orderFormEl.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const isViewing = rect.top < vh - 60 && rect.bottom > 80;
        setIsStickyHidden(isViewing);
      }

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const percent = (scrollY / totalHeight) * 100;

      if (percent >= 25 && !firedScrollEvents.current.viewContent) {
        firedScrollEvents.current.viewContent = true;
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("track", "ViewContent", {
            content_name: "Mỏ Neo Đất NEO-10",
            content_category: "Nông nghiệp & Nhà vườn",
            content_type: "product",
            value: 299000,
            currency: "VND",
          });
        }
      }

      if (percent >= 50 && !firedScrollEvents.current.scroll50) {
        firedScrollEvents.current.scroll50 = true;
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("trackCustom", "Scroll_50", {
            content_name: "Mỏ Neo Đất NEO-10",
            percent: 50,
          });
        }
      }

      if (percent >= 80 && !firedScrollEvents.current.scroll90) {
        firedScrollEvents.current.scroll90 = true;
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("trackCustom", "Scroll_90", {
            content_name: "Mỏ Neo Đất NEO-10",
            percent: 90,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScrollTracking, { passive: true });
    window.addEventListener("resize", handleScrollTracking, { passive: true });
    handleScrollTracking();

    return () => {
      clearTimeout(timeOnPageTimer);
      window.removeEventListener("scroll", handleScrollTracking);
      window.removeEventListener("resize", handleScrollTracking);
    };
  }, []);

  // Lưu vết fbclid
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const fbclidParam = urlParams.get("fbclid");
        if (fbclidParam) {
          sessionStorage.setItem("meta_fbclid", fbclidParam);
        }
      } catch {}
    }
  }, []);

  // 5. FAQ Accordion
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true, 1: false, 2: false, 3: false });
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
      }, 9500);

      return () => {
        clearTimeout(hideTimeout);
        clearInterval(interval);
      };
    }, 3000);

    return () => clearTimeout(showTimeout);
  }, []);

  // 7. Form Submission
  const validatePhone = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "Vui lòng nhập số điện thoại nhận hàng!";
    if (clean.length !== 10) return "Vui lòng nhập đúng số điện thoại di động gồm 10 chữ số.";
    if (!/^0(3|5|7|8|9)/.test(clean)) return "Số điện thoại di động không hợp lệ (cần bắt đầu bằng 03, 05, 07, 08, 09).";
    return "";
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!custName.trim()) {
      alert("Vui lòng nhập họ và tên của bạn!");
      return;
    }

    const pErr = validatePhone(custPhone);
    if (pErr) {
      setPhoneError(pErr);
      const phoneInput = document.getElementById("phone-input");
      if (phoneInput) phoneInput.focus();
      return;
    }
    setPhoneError("");

    if (!custAddress.trim()) {
      alert("Vui lòng nhập địa chỉ nhận hàng để shop giao tận nơi!");
      return;
    }

    setIsSubmitting(true);
    const orderCode = "NEO" + Math.floor(100000 + Math.random() * 900000);

    // Meta Pixel CAPI data
    const fbpMatch = typeof document !== "undefined" ? document.cookie.match(/(^|;)\s*_fbp=([^;]+)/) : null;
    const fbcMatch = typeof document !== "undefined" ? document.cookie.match(/(^|;)\s*_fbc=([^;]+)/) : null;
    const fbp = fbpMatch ? decodeURIComponent(fbpMatch[2]) : undefined;
    const fbc = fbcMatch ? decodeURIComponent(fbcMatch[2]) : undefined;

    let fbclid = "";
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        fbclid = urlParams.get("fbclid") || sessionStorage.getItem("meta_fbclid") || "";
      } catch {}
    }

    const payloadTotal = calculatedTotal;

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
          combo_name: `${currentCombo.name} (SL: ${orderQuantity})`,
          product_name: "Mỏ Neo Đất NEO-10 - Thép Hợp Kim Đúc Đặc Chịu Tải Tới 450kg (Tùy Chất Đất)",
          color: "Thép Đúc Mạ Kẽm",
          item_price: currentCombo.price * orderQuantity,
          shipping_fee: currentCombo.ship,
          total_price: payloadTotal,
          note: orderNote.trim(),
          fbp,
          fbc,
          fbclid: fbclid || undefined,
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
          combo_name: `${currentCombo.name} (SL: ${orderQuantity})`,
          total_price: payloadTotal,
          shipping_fee: currentCombo.ship,
        });
      }

      // Meta Pixel Purchase
      if (typeof (window as any).fbq === "function") {
        (window as any).fbq(
          "track",
          "Purchase",
          {
            value: Number(payloadTotal),
            currency: "VND",
            content_type: "product",
            content_name: currentCombo.name,
            num_items: Number(selectedCombo * orderQuantity),
          },
          {
            eventID: orderCode,
          }
        );
      }
    } catch (err) {
      console.error("Order submit error:", err);
      setCompletedOrder({
        order_code: orderCode,
        customer_name: custName.trim(),
        customer_phone: custPhone.trim(),
        customer_address: custAddress.trim(),
        combo_name: `${currentCombo.name} (SL: ${orderQuantity})`,
        total_price: payloadTotal,
        shipping_fee: currentCombo.ship,
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
    setOrderNote("");
    setSelectedCombo(10);
    setOrderQuantity(1);
  };

  const currentToast = realOrders[toastIdx];

  return (
    <div className="neo-page">
      {/* GLOBAL & COMPONENT STYLES INSPIRED BY TINYKA ARCHITECTURE */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --paper: #fffaf5;
          --white: #ffffff;
          --cream: #fbf3ea;
          --orange: #ea580c;
          --orange-dark: #c2410c;
          --cta-start: #dc2626;
          --cta-end: #b91c1c;
          --cta-shadow: #991b1b;
          --green: #15803d;
          --green-dark: #166534;
          --green-bg: #f0fdf4;
          --green-border: #bbf7d0;
          --ink: #1e293b;
          --muted: #64748b;
          --line: rgba(30, 41, 59, 0.12);
          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 18px;
          --radius-full: 9999px;
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
          color: var(--ink);
          display: flex;
          justify-content: center;
          min-height: 100vh;
          line-height: 1.5;
          font-size: 15px;
          -webkit-font-smoothing: antialiased;
        }

        .site-shell {
          width: 100%;
          max-width: 460px;
          background-color: var(--white);
          min-height: 100vh;
          position: relative;
          box-shadow: 0 0 35px rgba(0, 0, 0, 0.08);
          padding-bottom: 76px;
          overflow-x: hidden;
        }

        /* 1. TOPBAR STICKY (CHUYỂN ĐỔI CAO) */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 64px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border-bottom: 1.5px solid #fed7aa;
          box-shadow: 0 3px 14px rgba(234, 88, 12, 0.08);
        }
        .topbar-left {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          cursor: pointer;
          user-select: none;
        }
        .topbar-headline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-weight: 800;
          color: #ea580c;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          line-height: 1;
        }
        .topbar-bolt {
          font-size: 12px;
          display: inline-block;
          animation: bolt-pulse 1.6s ease-in-out infinite;
        }
        @keyframes bolt-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 1px #f97316); }
          50% { transform: scale(1.22); filter: drop-shadow(0 0 5px #ea580c); }
        }
        .topbar-timer-wrap {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-variant-numeric: tabular-nums;
        }
        .topbar-digit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 22px;
          padding: 0 4px;
          background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 900;
          line-height: 1;
          box-shadow: 0 2px 4px rgba(185, 28, 28, 0.25);
        }
        .topbar-colon {
          color: #dc2626;
          font-weight: 900;
          font-size: 13px;
          line-height: 1;
          margin: 0 1px;
        }
        .topbar-cta {
          position: relative;
          overflow: hidden;
          padding: 8px 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          box-shadow: 0 3px 12px rgba(220, 38, 38, 0.35);
          font-size: 12.5px;
          font-weight: 800;
          letter-spacing: 0.2px;
          text-transform: uppercase;
          white-space: nowrap;
          border: none;
          cursor: pointer;
          animation: topbar-attention 2.4s ease-in-out infinite;
        }
        .topbar-cta svg {
          width: 14px;
          height: 14px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .topbar-cta:active {
          transform: scale(0.97);
        }
        .topbar-cta::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transform: skewX(-20deg);
          animation: topbar-shimmer 2.8s infinite;
        }
        @keyframes topbar-shimmer {
          0%, 35% { left: -100%; }
          70%, 100% { left: 160%; }
        }
        @keyframes topbar-attention {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); box-shadow: 0 5px 16px rgba(220, 38, 38, 0.45); }
        }

        /* 2. SECTION ALBUM */
        .album {
          background: #ffffff;
          padding-bottom: 12px;
        }
        .album-stage {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          overflow: hidden;
          user-select: none;
        }
        .album-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .album-slide {
          min-width: 100%;
          height: 100%;
          position: relative;
        }
        .album-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .album-video-wrap {
          width: 100%;
          height: 100%;
          position: relative;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .album-video-el {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #000000;
          display: block;
        }
        .video-sound-prompt {
          position: absolute;
          bottom: 14px;
          left: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(8px);
          color: #ffffff;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          z-index: 8;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
          animation: sound-prompt-pulse 2.2s ease-in-out infinite;
        }
        @keyframes sound-prompt-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); border-color: #ea580c; color: #fed7aa; }
        }
        .video-sound-prompt svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }
        .album-badge-promo {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff;
          font-size: 11.5px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
          z-index: 5;
          letter-spacing: 0.3px;
        }
        .album-badge-right {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: var(--radius-full);
          z-index: 5;
        }
        .album-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(6px);
          color: var(--ink);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          z-index: 6;
          box-shadow: 0 3px 10px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .album-arrow:active {
          transform: translateY(-50%) scale(0.92);
          background: #ffffff;
        }
        .album-arrow.previous { left: 10px; }
        .album-arrow.next { right: 10px; }
        .album-count {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: var(--radius-full);
          z-index: 5;
        }

        .album-thumbs {
          display: flex;
          gap: 8px;
          padding: 10px 14px 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .album-thumbs::-webkit-scrollbar { display: none; }
        .album-thumb {
          flex: 0 0 58px;
          height: 58px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 2px solid #e2e8f0;
          cursor: pointer;
          background: #f8fafc;
          transition: all 0.2s;
        }
        .album-thumb.active {
          border-color: var(--green);
          box-shadow: 0 0 0 2px rgba(21, 128, 61, 0.25);
          transform: scale(1.03);
        }
        .album-thumb.thumb-video {
          position: relative;
        }
        .thumb-video-content {
          width: 100%;
          height: 100%;
          position: relative;
        }
        .thumb-video-badge {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }
        .album-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* 3. SECTION PRODUCT SUMMARY (TINYKA STYLE) */
        .product-summary {
          padding: 18px 18px 26px;
          background: var(--paper);
          border-bottom: 8px solid #f1f5f9;
        }
        .product-title {
          font-size: 21px;
          font-weight: 900;
          line-height: 1.35;
          color: var(--ink);
          margin-bottom: 8px;
        }
        .product-rating-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px 8px;
          margin-bottom: 14px;
          font-size: 13px;
          line-height: 1.3;
        }
        .rating-stars-wrap {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .product-rating-row .stars {
          color: #f59e0b;
          font-size: 14px;
          letter-spacing: 1px;
          line-height: 1;
        }
        .product-rating-row .score {
          font-weight: 800;
          color: #0f172a;
          font-size: 13.5px;
          line-height: 1;
          white-space: nowrap;
        }
        .rating-divider {
          color: #94a3b8;
          font-weight: bold;
          font-size: 12px;
          user-select: none;
        }
        .product-rating-row .sold {
          color: #475569;
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
        }
        @media (max-width: 360px) {
          .product-rating-row {
            gap: 4px 6px;
          }
          .product-rating-row .stars {
            font-size: 13px;
            letter-spacing: 0.5px;
          }
          .product-rating-row .score {
            font-size: 12.5px;
          }
          .product-rating-row .sold {
            font-size: 12px;
          }
        }

        .selling-points {
          margin: 14px 0 18px;
          padding: 14px 16px;
          background: #ffffff;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .selling-points li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.45;
        }
        .selling-points li strong {
          color: var(--ink);
          font-weight: 800;
        }
        .selling-points li span {
          color: var(--green);
          font-size: 16px;
          font-weight: 900;
          line-height: 1.1;
          flex-shrink: 0;
          width: 16px;
        }

        .price-block {
          position: relative;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1.5px solid #fed7aa;
          border-radius: var(--radius-md);
          background: #fff7ed;
          margin-bottom: 18px;
          animation: price-card-pulse 3.2s ease-in-out infinite;
        }
        @keyframes price-card-pulse {
          0%, 100% { border-color: #fed7aa; box-shadow: 0 2px 8px rgba(234, 88, 12, 0.08); }
          50% { border-color: #f97316; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.16); }
        }
        .price-info-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }
        .price-info-left small {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: #475569;
          margin-bottom: 3px;
          line-height: 1.25;
        }
        .price-original {
          font-size: 13.5px;
          color: #94a3b8;
          text-decoration: line-through;
          font-weight: 600;
          line-height: 1.2;
        }
        .price-sale {
          font-size: 27px;
          font-weight: 900;
          color: #dc2626;
          line-height: 1.1;
          margin-top: 1px;
        }
        .price-tag-ship {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          text-align: right;
          flex-shrink: 0;
        }
        .price-tag-ship b {
          background: #15803d;
          color: white;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          letter-spacing: 0.2px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(21, 128, 61, 0.2);
        }
        .price-tag-ship span {
          font-size: 11.5px;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
        }

        /* VARIANT PICKER */
        .variant-picker {
          margin-bottom: 14px;
        }
        .variant-picker-label {
          font-size: 14px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .variant-picker-label span {
          font-size: 12px;
          font-weight: 600;
          color: var(--green);
        }
        .variant-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .variant-card {
          position: relative;
          padding: 10px 6px 10px;
          border: 1.5px solid var(--line);
          border-radius: var(--radius-md);
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .variant-card:hover {
          border-color: #cbd5e1;
        }
        .variant-card.active {
          border-color: var(--green);
          background: #f0fdf4;
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.15);
        }
        .variant-card-badge {
          position: absolute;
          top: -9px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(217, 119, 6, 0.3);
        }
        .variant-card-badge.supersaver {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        .variant-card-name {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
          margin-top: 4px;
          margin-bottom: 3px;
        }
        .variant-card-oldprice {
          font-size: 11.5px;
          color: #94a3b8;
          text-decoration: line-through;
        }
        .variant-card-price {
          font-size: 14.5px;
          font-weight: 900;
          color: #dc2626;
          margin-top: 1px;
        }
        .variant-card-ship {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--green);
          margin-top: 3px;
        }

        /* UPGRADE PROMPT */
        .variant-upgrade-prompt {
          margin: 12px 0 16px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border: 1px solid #f2b28a;
          border-radius: var(--radius-md);
          background: #fff4ec;
          color: var(--ink);
        }
        .variant-upgrade-text {
          font-size: 12px;
          line-height: 1.35;
        }
        .variant-upgrade-text b {
          display: block;
          color: #c2410c;
          font-size: 12.5px;
          font-weight: 800;
        }
        .variant-upgrade-text small {
          color: #64748b;
          font-size: 11px;
        }
        .variant-upgrade-btn {
          padding: 6px 12px;
          background: #ea580c;
          color: white;
          border: none;
          border-radius: var(--radius-full);
          font-size: 11.5px;
          font-weight: 800;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.2s;
        }
        .variant-upgrade-btn:active {
          background: #c2410c;
        }

        /* BUY BUTTON (CTA BIG) */
        .buy-button {
          width: 100%;
          padding: 15px 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff;
          font-size: 16px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
          cursor: pointer;
          transition: all 0.2s ease;
          animation: buy-pulse 2.8s ease-in-out infinite;
        }
        @keyframes buy-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 8px 26px rgba(220, 38, 38, 0.55); }
        }
        .buy-button svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        .offer-trust {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-top: 14px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .offer-trust span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .offer-trust i {
          width: 4px;
          height: 4px;
          background: #cbd5e1;
          border-radius: 50%;
        }

        /* 4. SECTION COMPARISON (CÙNG LÀ MỎ NEO ĐẤT...) */
        .comparison-section {
          padding: 30px 18px 32px;
          background: #ffffff;
          border-bottom: 8px solid #f1f5f9;
        }
        .comparison-title {
          font-size: 19px;
          font-weight: 900;
          line-height: 1.35;
          color: var(--ink);
          text-align: center;
          margin-bottom: 8px;
        }
        .comparison-intro {
          font-size: 13.5px;
          color: var(--muted);
          text-align: center;
          margin-bottom: 20px;
          line-height: 1.45;
        }
        .comparison-pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 22px;
        }
        .comparison-col {
          border-radius: var(--radius-md);
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .comparison-market {
          background: #fef2f2;
          border: 1.5px dashed #fca5a5;
        }
        .comparison-market .tag {
          font-size: 11px;
          font-weight: 800;
          color: #dc2626;
          text-transform: uppercase;
        }
        .comparison-market strong {
          font-size: 14px;
          color: #991b1b;
          font-weight: 800;
        }
        .comparison-market ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .comparison-market li {
          font-size: 12px;
          color: #7f1d1d;
          line-height: 1.35;
          display: flex;
          gap: 5px;
        }
        .comparison-market li::before {
          content: "✕";
          color: #dc2626;
          font-weight: 900;
        }

        .comparison-shop {
          background: #f0fdf4;
          border: 2px solid var(--green);
          box-shadow: 0 4px 14px rgba(21, 128, 61, 0.12);
          position: relative;
        }
        .comparison-shop .tag {
          font-size: 11px;
          font-weight: 900;
          color: var(--green);
          text-transform: uppercase;
        }
        .comparison-shop strong {
          font-size: 14px;
          color: #14532d;
          font-weight: 900;
        }
        .comparison-shop ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .comparison-shop li {
          font-size: 12px;
          color: #166534;
          font-weight: 600;
          line-height: 1.35;
          display: flex;
          gap: 5px;
        }
        .comparison-shop li::before {
          content: "✓";
          color: var(--green);
          font-weight: 900;
        }

        .real-product-box {
          margin-top: 14px;
          padding-top: 16px;
          border-top: 1px solid var(--line);
        }
        .real-product-box h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 4px;
          text-align: center;
        }
        .real-product-box p {
          font-size: 12.5px;
          color: var(--muted);
          text-align: center;
          margin-bottom: 12px;
        }
        .real-photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .real-photo-item {
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          aspect-ratio: 1;
        }
        .real-photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .real-photo-caption {
          font-size: 11px;
          color: #475569;
          text-align: center;
          margin-top: 4px;
          font-weight: 600;
        }

        .comparison-cta-wrap {
          text-align: center;
          margin-top: 14px;
        }
        .btn-sub-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 20px;
          background: var(--green);
          color: white;
          border-radius: var(--radius-full);
          font-size: 13.5px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(21, 128, 61, 0.25);
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-sub-cta:active {
          background: var(--green-dark);
        }

        /* 5. SECTION SPECS & 3 BƯỚC THI CÔNG */
        .specs-section {
          padding: 28px 18px 30px;
          background: #ffffff;
          border-bottom: 8px solid #f1f5f9;
        }
        .mini-promo-banner {
          background: linear-gradient(90deg, #15803d 0%, #16a34a 100%);
          color: white;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 22px;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
        }
        .mini-promo-text {
          font-size: 12px;
          line-height: 1.35;
        }
        .mini-promo-text strong {
          display: block;
          font-size: 13.5px;
          font-weight: 800;
        }
        .mini-promo-btn {
          padding: 7px 13px;
          background: #facc15;
          color: #713f12;
          font-size: 11.5px;
          font-weight: 900;
          border-radius: var(--radius-full);
          text-decoration: none;
          white-space: nowrap;
          cursor: pointer;
        }

        .section-heading-tag {
          font-size: 11.5px;
          font-weight: 800;
          color: var(--green);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          display: block;
        }
        .section-main-title {
          font-size: 19px;
          font-weight: 900;
          color: var(--ink);
          margin-bottom: 14px;
          line-height: 1.3;
        }

        .spec-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-bottom: 24px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--line);
        }
        .spec-table tr:nth-child(even) {
          background: #f8fafc;
        }
        .spec-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--line);
          line-height: 1.4;
        }
        .spec-table td.label {
          width: 35%;
          font-weight: 700;
          color: #475569;
          background: #f1f5f9;
        }
        .spec-table td.val {
          width: 65%;
          font-weight: 600;
          color: var(--ink);
        }

        /* 3 BƯỚC THI CÔNG */
        .step-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .step-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
        }
        .step-num {
          flex: 0 0 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--green);
          color: white;
          font-size: 16px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-content strong {
          display: block;
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 2px;
        }
        .step-content p {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.35;
        }

        /* 6. SECTION COMMITMENTS (4 CAM KẾT VÀNG) */
        .commitments-section {
          padding: 34px 18px 36px;
          background: #0f172a;
          color: white;
          border-bottom: 8px solid #f1f5f9;
        }
        .commitments-label {
          font-size: 11.5px;
          font-weight: 800;
          color: #4ade80;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: block;
        }
        .commitments-title {
          font-size: 20px;
          font-weight: 900;
          line-height: 1.3;
          margin-bottom: 20px;
        }
        .commitment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .commitment-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          padding: 14px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .commitment-card .card-num {
          font-size: 22px;
          font-weight: 900;
          color: #4ade80;
          line-height: 1;
        }
        .commitment-card h3 {
          font-size: 13.5px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.3;
        }
        .commitment-card p {
          font-size: 11.5px;
          color: #cbd5e1;
          line-height: 1.4;
        }

        /* 7. SECTION ORDER FORM (CHUYỂN ĐỔI CAO) */
        .order-section {
          padding: 34px 18px 36px;
          background: linear-gradient(155deg, #fff7ed 0%, #ffedd5 100%);
          border-bottom: 8px solid #f1f5f9;
          scroll-margin-top: 55px;
        }
        .order-section-title {
          font-size: 22px;
          font-weight: 900;
          color: #9a3412;
          text-align: center;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-countdown-box {
          margin: 0 auto 20px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1.5px solid #fed7aa;
          border-radius: var(--radius-md);
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(234, 88, 12, 0.08);
          max-width: 360px;
        }
        .form-countdown-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 800;
          color: #c2410c;
        }
        .form-countdown-timer {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .countdown-time-unit {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          padding: 4px 8px;
          border-radius: 6px;
          min-width: 30px;
          text-align: center;
          font-variant-numeric: tabular-nums;
          box-shadow: 0 2px 6px rgba(220, 38, 38, 0.25);
        }
        .countdown-colon {
          font-size: 15px;
          font-weight: 900;
          color: #dc2626;
        }

        .order-form-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 20px 16px;
          box-shadow: 0 10px 30px rgba(154, 52, 18, 0.1);
          border: 1px solid #fed7aa;
        }
        .form-group {
          margin-bottom: 14px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 6px;
        }
        .form-group label em {
          color: #dc2626;
          font-style: normal;
          margin-left: 3px;
        }
        .input-text {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-md);
          font-size: 14px;
          color: var(--ink);
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .input-text:focus {
          border-color: var(--green);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(21, 128, 61, 0.15);
        }
        .field-error-msg {
          font-size: 12px;
          color: #dc2626;
          margin-top: 4px;
          font-weight: 600;
        }

        /* COMBO SELECTION PILLS INSIDE FORM */
        .form-combo-selector {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .form-combo-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
        }
        .form-combo-option.active {
          border-color: var(--green);
          background: #f0fdf4;
        }
        .form-combo-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }
        .form-combo-radio {
          width: 22px;
          height: 22px;
          min-width: 22px;
          min-height: 22px;
          flex: 0 0 22px;
          flex-shrink: 0;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .form-combo-option.active .form-combo-radio {
          border-color: var(--green);
          background: #ffffff;
        }
        .form-combo-option.active .form-combo-radio::after {
          content: "";
          width: 10px;
          height: 10px;
          min-width: 10px;
          min-height: 10px;
          flex: 0 0 10px;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--green);
          display: block;
          box-sizing: border-box;
        }
        .form-combo-title {
          font-size: 14.5px;
          font-weight: 800;
          color: var(--ink);
          display: block;
        }
        .form-combo-sub {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--muted);
          display: block;
          margin-top: 2px;
        }
        .form-combo-price {
          text-align: right;
          flex-shrink: 0;
        }
        .form-combo-price strong {
          display: block;
          font-size: 15.5px;
          font-weight: 900;
          color: #dc2626;
        }
        .form-combo-price small {
          font-size: 11px;
          font-weight: 800;
          color: var(--green);
        }

        /* QUANTITY SELECTOR */
        .quantity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: var(--radius-md);
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }
        .quantity-label {
          font-size: 13px;
          font-weight: 800;
          color: var(--ink);
        }
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .quantity-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: #ffffff;
          border: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
        }
        .quantity-val {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
          min-width: 20px;
          text-align: center;
        }

        /* ORDER SUMMARY BOX (DYNAMIC) */
        .order-summary-box {
          border: 1.5px dashed #fed7aa;
          border-radius: var(--radius-md);
          padding: 12px 14px;
          background: #fffaf5;
          margin-bottom: 18px;
        }
        .order-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 6px;
          color: #475569;
        }
        .order-summary-row.total-row {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #fed7aa;
          font-size: 15px;
          font-weight: 900;
          color: var(--ink);
        }
        .order-summary-total-price {
          font-size: 21px;
          font-weight: 900;
          color: #dc2626;
        }

        /* FORM SUBMIT BUTTON */
        .btn-submit-order {
          width: 100%;
          padding: 16px 18px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff;
          border: none;
          border-radius: var(--radius-md);
          font-size: 16px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        .btn-submit-order:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-submit-order span.sub-text {
          font-size: 11px;
          font-weight: 600;
          text-transform: none;
          opacity: 0.9;
        }
        .form-trust-footer {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-top: 14px;
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
        }

        /* 8. SECTION REVIEWS (FACEBOOK STYLE) */
        .reviews-section {
          padding: 30px 18px 34px;
          background: #ffffff;
          border-bottom: 8px solid #f1f5f9;
        }
        .social-comments-wrap {
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-lg);
          padding: 16px 14px;
          background: #ffffff;
          box-shadow: 0 4px 18px rgba(0,0,0,0.04);
        }
        .comments-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 14px;
          font-size: 13.5px;
        }
        .comments-toolbar strong {
          color: var(--ink);
          font-weight: 800;
        }
        .comments-filter {
          color: var(--muted);
          font-size: 12.5px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
        }
        .comment-item {
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }
        .comment-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          color: white;
        }
        .comment-bubble {
          background: #f1f5f9;
          padding: 10px 14px;
          border-radius: 6px 16px 16px 16px;
        }
        .comment-user-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
          flex-wrap: wrap;
        }
        .comment-name {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
        }
        .comment-badge-verified {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--green);
          background: #dcfce7;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .comment-stars {
          color: #f59e0b;
          font-size: 12px;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .comment-text {
          font-size: 13px;
          color: #334155;
          line-height: 1.45;
        }
        .comment-photos {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-top: 8px;
        }
        .comment-photos img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: var(--radius-sm);
          display: block;
        }
        .comment-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
          font-size: 11.5px;
          color: var(--muted);
          font-weight: 600;
        }
        .comment-meta span.action {
          cursor: pointer;
        }
        .comment-meta span.action:hover {
          color: var(--ink);
        }
        .comment-meta .likes {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 3px;
          color: #1d4ed8;
        }

        /* 9. SECTION ỨNG DỤNG THỰC TẾ */
        .usage-section {
          padding: 30px 18px 32px;
          background: #ffffff;
          border-bottom: 8px solid #f1f5f9;
        }
        .usage-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .usage-card {
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #ffffff;
        }
        .usage-card img {
          width: 100%;
          height: 190px;
          object-fit: cover;
          display: block;
        }
        .usage-card-body {
          padding: 12px 14px;
        }
        .usage-card-body h3 {
          font-size: 14.5px;
          font-weight: 800;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .usage-card-body p {
          font-size: 12.5px;
          color: var(--muted);
          line-height: 1.4;
        }

        /* 10. SECTION FAQ ACCORDION */
        .faq-section {
          padding: 30px 18px 32px;
          background: #ffffff;
          border-bottom: 8px solid #f1f5f9;
        }
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .faq-item {
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #f8fafc;
        }
        .faq-item.open {
          border-color: var(--green);
          background: #ffffff;
        }
        .faq-q {
          padding: 13px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 800;
          color: var(--ink);
          cursor: pointer;
        }
        .faq-icon {
          font-size: 18px;
          font-weight: 700;
          color: var(--green);
          transition: transform 0.2s;
        }
        .faq-item.open .faq-icon {
          transform: rotate(45deg);
        }
        .faq-a {
          padding: 0 14px 14px;
          font-size: 12.5px;
          color: #475569;
          line-height: 1.5;
          border-top: 1px dashed #e2e8f0;
          padding-top: 10px;
        }

        /* 11. FOOTER */
        .footer-clean {
          padding: 22px 16px 28px;
          text-align: center;
          background: #0f172a;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.5;
        }

        /* 12. STICKY BUY BOTTOM BAR */
        .sticky-buy {
          position: fixed;
          z-index: 90;
          left: 50%;
          bottom: 10px;
          width: calc(min(100%, 460px) - 20px);
          transform: translateX(-50%);
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.95);
          color: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .sticky-buy.hidden {
          transform: translate(-50%, 120%);
          opacity: 0;
          pointer-events: none;
        }
        .sticky-info {
          display: flex;
          flex-direction: column;
        }
        .sticky-label {
          font-size: 11px;
          font-weight: 700;
          color: #cbd5e1;
        }
        .sticky-price {
          font-size: 18px;
          font-weight: 900;
          color: #f87171;
        }
        .sticky-btn {
          padding: 10px 18px;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: white;
          border: none;
          border-radius: var(--radius-full);
          font-size: 13.5px;
          font-weight: 900;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
          animation: sticky-cta-attention 2.5s ease-in-out infinite;
        }
        @keyframes sticky-cta-attention {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        /* 13. REALTIME TOAST */
        .order-toast {
          position: fixed;
          bottom: 86px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          width: calc(min(100%, 460px) - 24px);
          background: rgba(255, 255, 255, 0.98);
          border-radius: var(--radius-md);
          padding: 8px 12px;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 85;
          opacity: 0;
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .order-toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
          pointer-events: auto;
        }
        .order-toast.sticky-hidden {
          bottom: 18px;
        }
        .toast-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          border-radius: 50%;
          background: #dcfce7;
          color: var(--green);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          flex-shrink: 0;
        }
        .toast-content {
          flex: 1;
          min-width: 0;
        }
        .toast-line-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .toast-name {
          font-weight: 800;
          color: var(--ink);
        }
        .toast-time {
          font-size: 10.5px;
          color: var(--muted);
        }
        .toast-line-bottom {
          font-size: 11px;
          color: var(--green);
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* 14. SUCCESS MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .modal-card {
          background: #ffffff;
          width: 100%;
          max-width: 420px;
          border-radius: var(--radius-lg);
          padding: 24px 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modal-pop {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .modal-icon-success {
          width: 58px;
          height: 58px;
          background: #dcfce7;
          color: var(--green);
          font-size: 28px;
          font-weight: 900;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }
        .modal-title {
          font-size: 18px;
          font-weight: 900;
          color: var(--ink);
          margin-bottom: 6px;
        }
        .modal-desc {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 16px;
          line-height: 1.45;
        }
        .modal-bill {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--radius-md);
          padding: 12px 14px;
          font-size: 13px;
          text-align: left;
          margin-bottom: 18px;
        }
        .modal-bill-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .modal-bill-row strong {
          color: var(--ink);
        }
        .btn-modal-close {
          width: 100%;
          padding: 12px;
          background: var(--green);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 14.5px;
          font-weight: 800;
          cursor: pointer;
        }
      `}} />

      <main className="site-shell">
        {/* ================= 1. TOPBAR STICKY (CHUYỂN ĐỔI CAO) ================= */}
        <header className="topbar">
          <div
            className="topbar-left"
            onClick={() => scrollToOrder(selectedCombo)}
            role="button"
            tabIndex={0}
            aria-label="Xem ưu đãi đặt hàng"
          >
            <div className="topbar-headline">
              <span className="topbar-bolt">⚡</span>
              <span>Ưu Đãi Có Hạn Hôm Nay</span>
            </div>
            <div className="topbar-timer-wrap" aria-label={`Thời gian ưu đãi còn lại ${hours} giờ ${minutes} phút ${seconds} giây`}>
              <span className="topbar-digit">{hours}</span>
              <span className="topbar-colon">:</span>
              <span className="topbar-digit">{minutes}</span>
              <span className="topbar-colon">:</span>
              <span className="topbar-digit">{seconds}</span>
            </div>
          </div>
          <button
            className="topbar-cta"
            type="button"
            onClick={() => scrollToOrder(selectedCombo)}
            aria-label="Tôi mua giá ưu đãi"
          >
            <span>Mua Giá Ưu Đãi</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </header>

        {/* ================= 2. SECTION 1: ALBUM SẢN PHẨM ================= */}
        <section className="album" id="top" aria-label="Album ảnh sản phẩm">
          <div
            className="album-stage"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <span className="album-badge-promo">⚡ GIẢM 35% HÔM NAY</span>
            <span className="album-badge-right">Thép Đúc Mạ Kẽm</span>
            
            <div
              className="album-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((s, idx) => (
                <div className="album-slide" key={idx}>
                  {s.type === "video" ? (
                    <div className="album-video-wrap">
                      <video
                        ref={videoRef}
                        src={s.src}
                        poster={s.poster}
                        playsInline
                        autoPlay
                        muted={isMuted}
                        loop
                        preload="metadata"
                        className="album-video-el"
                      />
                      {isMuted && (
                        <button
                          className="video-sound-prompt"
                          type="button"
                          onClick={toggleSound}
                          aria-label="Bật tiếng video"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M11 5 6.7 8.5H3v7h3.7L11 19V5Zm4.2 3.2a5.2 5.2 0 0 1 0 7.6M17.8 5.7a9 9 0 0 1 0 12.6" />
                          </svg>
                          <span>Chạm để bật tiếng</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <img src={s.src} alt={s.alt} loading={idx <= 1 ? "eager" : "lazy"} />
                  )}
                </div>
              ))}
            </div>

            <button className="album-arrow previous" type="button" onClick={prevSlide} aria-label="Ảnh trước">
              ‹
            </button>
            <button className="album-arrow next" type="button" onClick={nextSlide} aria-label="Ảnh kế tiếp">
              ›
            </button>
            <span className="album-count"><b>{currentSlide + 1}</b> / {slides.length}</span>
          </div>

          <div className="album-thumbs" role="list" aria-label="Danh sách ảnh thu nhỏ">
            {slides.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className={`album-thumb ${idx === currentSlide ? "active" : ""} ${s.type === "video" ? "thumb-video" : ""}`}
                onClick={() => goToSlide(idx)}
                aria-label={s.type === "video" ? "Xem video mỏ neo" : `Xem ảnh ${idx}`}
              >
                {s.type === "video" ? (
                  <div className="thumb-video-content">
                    <img src={s.poster || "/assets/images_neo/hero_neo.jpg"} alt="Video" loading="lazy" />
                    <span className="thumb-video-badge">▶ Video</span>
                  </div>
                ) : (
                  <img src={s.src} alt="" loading="lazy" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ================= 3. SECTION 2: TÓM TẮT & BỘ CHỌN PHÂN LOẠI (TINYKA STYLE) ================= */}
        <section className="product-summary" aria-label="Tóm tắt sản phẩm">
          <h1 className="product-title">
            MỎ NEO ĐẤT • TẢI KÉO TỚI 450KG
          </h1>
          <div className="product-rating-row">
            <div className="rating-stars-wrap">
              <span className="stars">★★★★★</span>
              <strong className="score">4.9/5</strong>
            </div>
            <span className="rating-divider">•</span>
            <span className="sold">2.450+ nhà vườn tin dùng</span>
          </div>

          <ul className="selling-points">
            <li><span>✓</span><div><strong>Tải kéo tới 450kg/điểm (tùy loại đất):</strong> Càng giật mạnh cánh neo càng khóa chặt ngậm đất</div></li>
            <li><span>✓</span><div><strong>Tự khóa ngậm đất 90°:</strong> Không sợ bật gốc khi giông bão, lốc xoáy</div></li>
            <li><span>✓</span><div><strong>Thép đúc mạ kẽm siêu bền:</strong> Chống rỉ sét tuyệt đối, tuổi thọ &gt; 10 năm</div></li>
            <li><span>✓</span><div><strong>Thi công 3 phút cực nhàn:</strong> Không đào hố, không tốn công đổ bê tông</div></li>
          </ul>

          {/* KHỐI GIÁ */}
          <div className="price-block">
            <div className="price-info-left">
              <small>{currentCombo.name}</small>
              <del className="price-original">{currentCombo.oldPrice.toLocaleString("vi-VN")}đ</del>
              <strong className="price-sale">{currentCombo.price.toLocaleString("vi-VN")}đ</strong>
            </div>
            <div className="price-tag-ship">
              <b>{currentCombo.ship === 0 ? "MIỄN PHÍ SHIP" : "SHIP 20.000Đ"}</b>
              <span>Thanh toán khi nhận</span>
            </div>
          </div>

          {/* BỘ CHỌN PHÂN LOẠI TRỰC QUAN */}
          <div className="variant-picker">
            <div className="variant-picker-label">
              <span>Chọn gói combo ưu đãi:</span>
            </div>
            <div className="variant-grid" role="radiogroup">
              {Object.values(comboConfig).map((c) => {
                const isActive = selectedCombo === c.id;
                return (
                  <div
                    key={c.id}
                    role="radio"
                    aria-checked={isActive}
                    className={`variant-card ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedCombo(c.id)}
                  >
                    {c.badge && (
                      <span className={`variant-card-badge ${c.tagClass || ""}`}>
                        {c.badge}
                      </span>
                    )}
                    <span className="variant-card-name">{c.label}</span>
                    <span className="variant-card-oldprice">{c.oldPrice.toLocaleString("vi-VN")}đ</span>
                    <strong className="variant-card-price">{c.price.toLocaleString("vi-VN")}đ</strong>
                    <span className="variant-card-ship">
                      {c.ship === 0 ? "Freeship" : "+20k ship"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GỢI Ý NÂNG CẤP THÔNG MINH */}
          {selectedCombo === 5 && (
            <div className="variant-upgrade-prompt">
              <div className="variant-upgrade-text">
                <b>Thêm 109.000đ lên Combo 10 cái</b>
                <small>Được MIỄN PHÍ SHIP và đủ neo cho cả giàn vườn</small>
              </div>
              <button
                type="button"
                className="variant-upgrade-btn"
                onClick={() => setSelectedCombo(10)}
              >
                Chọn 10 cái
              </button>
            </div>
          )}

          {/* NÚT BIG CTA ĐẶT MUA NGAY */}
          <button
            type="button"
            className="buy-button"
            onClick={() => scrollToOrder(selectedCombo)}
          >
            <span>Đặt mua ngay giá ưu đãi</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </button>

          <div className="offer-trust">
            <span>📦 Kiểm tra hàng trước</span>
            <i aria-hidden="true"></i>
            <span>🚚 Thanh toán khi nhận</span>
          </div>
        </section>

        {/* ================= 4. SECTION 3: SO SÁNH MINH BẠCH (TINYKA STYLE) ================= */}
        <section className="comparison-section" id="product-comparison" aria-labelledby="comparison-title">
          <h2 className="comparison-title" id="comparison-title">
            Cùng là mỏ neo đất, mua ở đâu cũng như nhau?
          </h2>
          <p className="comparison-intro">
            Bà con xem rõ điểm khác biệt để tránh mua nhầm hàng mỏng kém chất lượng:
          </p>

          <div className="comparison-pair">
            <div className="comparison-col comparison-market">
              <span className="tag">Hàng giá rẻ trôi nổi</span>
              <strong>Tôn dập mỏng &amp; mạ xi</strong>
              <ul>
                <li>Lưỡi tôn mỏng, dễ quăn mép khi gặp sỏi đá</li>
                <li>Cáp sắt mỏng, dễ rỉ sét và đứt ngầm</li>
                <li>Lực giữ yếu (&lt;50kg), giông gió là bung giàn</li>
              </ul>
            </div>

            <div className="comparison-col comparison-shop">
              <span className="tag">Hàng đúc NEO-10 của Shop</span>
              <strong>Thép đúc đặc mạ kẽm</strong>
              <ul>
                <li>Thép đúc đặc nguyên khối, chống rỉ vĩnh cửu</li>
                <li>Cáp bọc chịu tải cao bấm đầu cos thép dày</li>
                <li>Tự khóa 90° ngậm đất, chịu tải kéo tới 450kg (tùy kết cấu đất)</li>
                <li>Độ bền &gt; 10 năm dầm mưa dãi nắng</li>
              </ul>
            </div>
          </div>

          <div className="real-product-box">
            <h3>Ảnh thật sản phẩm chuẩn tại shop</h3>
            <p>Mỏ neo thép hợp kim đúc đặc mạ kẽm kèm đầu cáp bấm cos chịu tải kéo tới 450kg (tùy nền đất).</p>
            <div style={{ maxWidth: "340px", margin: "0 auto", borderRadius: "var(--radius-md)", overflow: "hidden", border: "2px solid var(--green)", boxShadow: "0 4px 14px rgba(21, 128, 61, 0.15)" }}>
              <img src="/assets/images_neo/hero_neo.jpg" alt="Mỏ neo đất NEO-10 chuẩn tại shop" style={{ width: "100%", display: "block" }} loading="lazy" />
              <div style={{ padding: "8px 12px", background: "#f0fdf4", textAlign: "center", fontSize: "12.5px", fontWeight: "800", color: "var(--green)" }}>
                ✓ Mẫu NEO-10 đúc đặc mạ kẽm nguyên khối
              </div>
            </div>
          </div>

          <div className="comparison-cta-wrap">
            <button
              type="button"
              className="btn-sub-cta"
              onClick={() => scrollToOrder(selectedCombo)}
            >
              Tôi muốn đặt mua mẫu chuẩn shop →
            </button>
          </div>
        </section>

        {/* ================= 5. SECTION 4: THÔNG SỐ & 3 BƯỚC THI CÔNG ================= */}
        <section className="specs-section" id="specs-section" aria-label="Thông số kỹ thuật và thi công">
          <div className="mini-promo-banner">
            <div className="mini-promo-text">
              <strong>ƯU ĐÃI GIAO TẬN NHÀ HÔM NAY</strong>
              <span>Combo 10 cái chỉ 299.000đ • Miễn phí ship • Kiểm tra hàng</span>
            </div>
            <button
              type="button"
              className="mini-promo-btn"
              onClick={() => scrollToOrder(10)}
            >
              Đặt ngay →
            </button>
          </div>

          <span className="section-heading-tag">KỸ THUẬT &amp; KÍCH THƯỚC</span>
          <h2 className="section-main-title">Thông số kỹ thuật mỏ neo đất</h2>

          <table className="spec-table">
            <tbody>
              <tr>
                <td className="label">Khối lượng</td>
                <td className="val">135gr / cái (Thép đúc đặc cầm đầm tay)</td>
              </tr>
              <tr>
                <td className="label">Kích thước</td>
                <td className="val">Dài 10cm x Rộng 1.5cm</td>
              </tr>
              <tr>
                <td className="label">Chất liệu</td>
                <td className="val">Thép hợp kim đúc đặc nguyên khối mạ kẽm</td>
              </tr>
              <tr>
                <td className="label">Lực giữ tải</td>
                <td className="val">Chịu lực kéo nhổ tới 450kg / điểm neo (tùy loại đất thịt, đất đỏ hay đất pha cát)</td>
              </tr>
              <tr>
                <td className="label">Độ bền</td>
                <td className="val">&gt; 10 năm trong mọi loại đất (kể cả đất phèn, mặn)</td>
              </tr>
              <tr>
                <td className="label">Ứng dụng</td>
                <td className="val">Căng giàn leo, giữ bạt mái che, chống bão cây ăn trái</td>
              </tr>
            </tbody>
          </table>

          <span className="section-heading-tag">THI CÔNG DỄ DÀNG</span>
          <h2 className="section-main-title">3 Bước đóng mỏ neo trong 3 phút</h2>

          <div className="step-cards">
            <div className="step-card">
              <span className="step-num">01</span>
              <div className="step-content">
                <strong>Đóng mỏ neo xuống đất</strong>
                <p>Lồng que sắt phi 12-14 vào đuôi neo, đóng thẳng sâu 0.8m – 1m.</p>
              </div>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <div className="step-content">
                <strong>Rút que sắt lên</strong>
                <p>Mỏ neo đã nằm sâu trong lòng đất, rút que đóng lên dễ dàng.</p>
              </div>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <div className="step-content">
                <strong>Kéo cáp khóa ngậm đất</strong>
                <p>Kéo siết mạnh dây cáp, lẫy neo tự xoay 90° ngậm chặt tầng đất nén.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 6. SECTION 5: 4 CAM KẾT VÀNG CỦA SHOP (TINYKA STYLE) ================= */}
        <section className="commitments-section" id="commitments" aria-labelledby="commitments-title">
          <span className="commitments-label">CAM KẾT CỦA SHOP</span>
          <h2 className="commitments-title" id="commitments-title">
            Mua hàng rõ ràng.<br />Nhận hàng an tâm.
          </h2>

          <div className="commitment-grid">
            <article className="commitment-card">
              <span className="card-num">01</span>
              <h3>Đúng mẫu, đúng chất lượng</h3>
              <p>Kiểm tra hàng tận tay. Cầm nặng tay, thép đúc dày dặn đúng mô tả mới nhận.</p>
            </article>

            <article className="commitment-card">
              <span className="card-num">02</span>
              <h3>Đóng gói đủ phụ kiện</h3>
              <p>Đầy đủ dây cáp bấm cos và chốt hãm, bao bọc cẩn thận tránh thất lạc.</p>
            </article>

            <article className="commitment-card">
              <span className="card-num">03</span>
              <h3>Bảo hành lỗi 1 đổi 1</h3>
              <p>Bảo hành độ bền thép mạ kẽm. Đổi mới ngay nếu có lỗi mối đúc hay phụ kiện.</p>
            </article>

            <article className="commitment-card">
              <span className="card-num">04</span>
              <h3>Không cọc, nhận mới trả</h3>
              <p>Giao tận nhà toàn quốc. Nhận hàng ưng ý mới thanh toán tiền mặt (COD).</p>
            </article>
          </div>
        </section>

        {/* ================= 7. SECTION 6: FORM ĐẶT HÀNG TRỰC TIẾP (ORDER SECTION) ================= */}
        <section className="order-section" id="order-section" aria-labelledby="order-section-title">
          <h2 className="order-section-title" id="order-section-title">
            THÔNG TIN ĐƠN HÀNG
          </h2>
          <div className="form-countdown-box">
            <span className="form-countdown-label">
              <span>⚡</span>Ưu đãi kết thúc sau:
            </span>
            <div className="form-countdown-timer">
              <span className="countdown-time-unit">{hours}</span>
              <span className="countdown-colon">:</span>
              <span className="countdown-time-unit">{minutes}</span>
              <span className="countdown-colon">:</span>
              <span className="countdown-time-unit">{seconds}</span>
            </div>
          </div>

          <div className="order-form-card">
            <form onSubmit={handleOrderSubmit}>
              <div className="form-group">
                <label htmlFor="cust-name">Họ và tên người nhận <em>*</em></label>
                <input
                  id="cust-name"
                  type="text"
                  className="input-text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone-input">Số điện thoại <em>*</em></label>
                <input
                  id="phone-input"
                  type="tel"
                  className="input-text"
                  placeholder="Ví dụ: 0912 345 678"
                  value={custPhone}
                  onChange={(e) => {
                    setCustPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  required
                />
                {phoneError && <p className="field-error-msg">{phoneError}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="cust-address">Địa chỉ nhận hàng (Giao tận nơi) <em>*</em></label>
                <input
                  id="cust-address"
                  type="text"
                  className="input-text"
                  placeholder="Số nhà, Thôn/Ấp, Xã/Phường, Huyện/Quận, Tỉnh/TP"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Chọn gói combo mỏ neo</label>
                <div className="form-combo-selector">
                  {Object.values(comboConfig).map((c) => {
                    const isSelected = selectedCombo === c.id;
                    return (
                      <div
                        key={c.id}
                        className={`form-combo-option ${isSelected ? "active" : ""}`}
                        onClick={() => setSelectedCombo(c.id)}
                      >
                        <div className="form-combo-left">
                          <span className="form-combo-radio" />
                          <div>
                            <span className="form-combo-title">{c.name}</span>
                            <span className="form-combo-sub">{c.reason}</span>
                          </div>
                        </div>
                        <div className="form-combo-price">
                          <strong>{c.price.toLocaleString("vi-VN")}đ</strong>
                          <small>{c.ship === 0 ? "Freeship" : "+20k ship"}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CHỌN SỐ LƯỢNG BỘ */}
              <div className="quantity-row">
                <span className="quantity-label">Số lượng bộ:</span>
                <div className="quantity-controls">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="quantity-val">{orderQuantity}</span>
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => setOrderQuantity((q) => Math.min(10, q + 1))}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* TÓM TẮT ĐƠN HÀNG REALTIME */}
              <div className="order-summary-box">
                <div className="order-summary-row">
                  <span>Gói đã chọn:</span>
                  <strong>{currentCombo.label} (x{orderQuantity} bộ)</strong>
                </div>
                <div className="order-summary-row">
                  <span>Đơn giá ưu đãi:</span>
                  <span>{(currentCombo.price * orderQuantity).toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="order-summary-row">
                  <span>Phí vận chuyển:</span>
                  <strong style={{ color: currentCombo.ship === 0 ? "var(--green)" : "var(--ink)" }}>
                    {currentCombo.ship === 0 ? "Miễn phí giao hàng (0đ)" : "20.000đ"}
                  </strong>
                </div>
                <div className="order-summary-row total-row">
                  <span>Tổng thanh toán khi nhận:</span>
                  <strong className="order-summary-total-price">
                    {calculatedTotal.toLocaleString("vi-VN")}đ
                  </strong>
                </div>
              </div>

              {/* GHI CHÚ ĐƠN HÀNG */}
              <div className="form-group">
                <label htmlFor="order-note">Ghi chú cho xưởng (nếu có)</label>
                <input
                  id="order-note"
                  type="text"
                  className="input-text"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="btn-submit-order"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Đang gửi đơn..." : "XÁC NHẬN ĐẶT HÀNG NGAY"}</span>
                <span className="sub-text">Kiểm tra hàng tận tay trước khi thanh toán</span>
              </button>

              <div className="form-trust-footer">
                <span>✓ Thanh toán khi nhận</span>
                <span>✓ Được kiểm tra hàng</span>
              </div>
            </form>
          </div>
        </section>

        {/* ================= 8. SECTION 7: ĐÁNH GIÁ KHÁCH HÀNG (FACEBOOK STYLE) ================= */}
        <section className="reviews-section" aria-label="Bình luận và đánh giá từ nhà vườn">
          <div className="social-comments-wrap">
            <div className="comments-toolbar">
              <strong>128 bình luận &amp; phản hồi</strong>
              <span className="comments-filter">Phù hợp nhất ⌄</span>
            </div>

            {/* COMMENT 1 */}
            <article className="comment-item">
              <div className="comment-avatar" style={{ background: "#0284c7" }}>B</div>
              <div className="comment-body">
                <div className="comment-bubble">
                  <div className="comment-user-row">
                    <span className="comment-name">Chú Bảy Nông</span>
                    <span className="comment-badge-verified">✓ Đã mua 20 cái</span>
                  </div>
                  <div className="comment-stars">★★★★★</div>
                  <p className="comment-text">
                    Mỏ neo rất chắc chắn, thép đúc đặc mạ kẽm cầm nặng tay. Đóng bằng que sắt 14 xuống đất ruộng 1m, kéo thử bằng tời mà giàn chanh dây đứng im phăng phắc. Vừa rồi trận bão giật đùng đùng mà giàn không suy suyển gì.
                  </p>
                  <div className="comment-photos">
                    <img src="/assets/images_neo/hero_neo.jpg" alt="Review 1" loading="lazy" />
                    <img src="/assets/images_neo/review_2.jpg" alt="Review 2" loading="lazy" />
                    <img src="/assets/images_neo/review_3.jpg" alt="Review 3" loading="lazy" />
                  </div>
                </div>
                <div className="comment-meta">
                  <span className="action">Thích</span>
                  <span className="action">Phản hồi</span>
                  <span>2 giờ trước</span>
                  <span className="likes">👍 18</span>
                </div>
              </div>
            </article>

            {/* COMMENT 2 */}
            <article className="comment-item">
              <div className="comment-avatar" style={{ background: "#16a34a" }}>L</div>
              <div className="comment-body">
                <div className="comment-bubble">
                  <div className="comment-user-row">
                    <span className="comment-name">Văn Lâm Farm (Đắk Nông)</span>
                    <span className="comment-badge-verified">✓ Đã mua 20 cái</span>
                  </div>
                  <div className="comment-stars">★★★★★</div>
                  <p className="comment-text">
                    Đất đồi dốc bên mình nhiều sỏi, trước đóng cọc gỗ hay bị bật gốc. Đổi sang mỏ neo này đóng 3 phút là xong 1 hố, lẫy neo tự xoay khóa chặt đất. Tiết kiệm công cán đổ bê tông gấp 10 lần. Đã giới thiệu cho mấy anh em cùng xã.
                  </p>
                  <div className="comment-photos">
                    <img src="/assets/images_neo/review_4.jpg" alt="Review 4" loading="lazy" />
                    <img src="/assets/images_neo/review_5.jpg" alt="Review 5" loading="lazy" />
                    <img src="/assets/images_neo/problem_sap_gian.jpg" alt="Review 6" loading="lazy" />
                  </div>
                </div>
                <div className="comment-meta">
                  <span className="action">Thích</span>
                  <span className="action">Phản hồi</span>
                  <span>5 giờ trước</span>
                  <span className="likes">👍 12</span>
                </div>
              </div>
            </article>

            {/* COMMENT 3 */}
            <article className="comment-item">
              <div className="comment-avatar" style={{ background: "#d97706" }}>H</div>
              <div className="comment-body">
                <div className="comment-bubble">
                  <div className="comment-user-row">
                    <span className="comment-name">Hoàng Thợ Mái Che (Bình Phước)</span>
                    <span className="comment-badge-verified">✓ Đã mua 10 cái</span>
                  </div>
                  <div className="comment-stars">★★★★★</div>
                  <p className="comment-text">
                    Hàng giao nhanh, đóng gói cẩn thận. Mình làm mái che bạt căng cho nhà kho, dùng neo này siết tăng đơ rất căng và cứng cáp. Khuyên anh em làm giàn hay nhà màng nên dùng loại này.
                  </p>
                </div>
                <div className="comment-meta">
                  <span className="action">Thích</span>
                  <span className="action">Phản hồi</span>
                  <span>1 ngày trước</span>
                  <span className="likes">👍 7</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ================= 9. SECTION 8: ỨNG DỤNG THỰC TẾ ================= */}
        <section className="usage-section" id="usage-guide" aria-label="Ứng dụng thực tế mỏ neo">
          <span className="section-heading-tag">ĐA NĂNG TOÀN DIỆN</span>
          <h2 className="section-main-title">Ứng dụng thực tế tại nhà vườn</h2>

          <div className="usage-grid">
            <div className="usage-card">
              <img src="/assets/images_neo/problem_sap_gian.jpg" alt="Căng giàn leo nông nghiệp" loading="lazy" />
              <div className="usage-card-body">
                <h3>Căng giàn leo nông nghiệp</h3>
                <p>Giữ cáp thẳng tắp cho giàn chanh dây, nho, dưa lưới, thanh long... chống chùng giàn khi cây ra trĩu quả.</p>
              </div>
            </div>

            <div className="usage-card">
              <img src="/assets/images_neo/cong_dung_nha_mang.jpg" alt="Neo giữ bạt mái che nhà màng" loading="lazy" />
              <div className="usage-card-body">
                <h3>Giữ mái che &amp; nhà màng</h3>
                <p>Ghim chặt bạt che, màng nilon nhà kính chống gió giật lật mái hiên hoặc rách toạc bạt mùa giông lốc.</p>
              </div>
            </div>

            <div className="usage-card">
              <img src="/assets/images_neo/cong_dung_chong_bao.jpg" alt="Chằng chống cây ăn trái mùa bão" loading="lazy" />
              <div className="usage-card-body">
                <h3>Chống đổ cây ăn trái mùa mưa bão</h3>
                <p>Neo giữ thân cây sầu riêng, mít, bưởi chống nghiêng ngả, bật gốc hoặc gãy cành khi gió lớn.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 10. SECTION 9: CÂU HỎI THƯỜNG GẶP (FAQ ACCORDION) ================= */}
        <section className="faq-section" aria-label="Câu hỏi thường gặp">
          <span className="section-heading-tag">GIẢI ĐÁP NHANH</span>
          <h2 className="section-main-title">Câu hỏi thường gặp</h2>

          <div className="faq-list">
            <div className={`faq-item ${openFaq[0] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(0)}>
                <span>Đất cứng hoặc đất có lẫn sỏi đá có đóng được không?</span>
                <span className="faq-icon">+</span>
              </div>
              {openFaq[0] && (
                <div className="faq-a">
                  Hoàn toàn đóng được. Mỏ neo được đúc bằng thép hợp kim vát mũi nhọn chịu lực cao, khi dùng que sắt đóng cọc lực đầm sẽ dẫn thẳng xuyên qua tầng đất sỏi đá mà không bị cong vênh hay móp méo đầu neo.
                </div>
              )}
            </div>

            <div className={`faq-item ${openFaq[1] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(1)}>
                <span>Dùng que sắt cỡ bao nhiêu để đóng cọc mỏ neo?</span>
                <span className="faq-icon">+</span>
              </div>
              {openFaq[1] && (
                <div className="faq-a">
                  Bà con chỉ cần chuẩn bị một đoạn que sắt xây dựng phi 12 hoặc phi 14 dài khoảng 1m - 1.2m (rất dễ tìm tại mọi cửa hàng vật liệu xây dựng hoặc que sắt tận dụng ở nhà). Đút que vào lỗ đuôi mỏ neo rồi dùng búa đóng xuống.
                </div>
              )}
            </div>

            <div className={`faq-item ${openFaq[2] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(2)}>
                <span>Khi chuyển vườn có nhổ lên tái sử dụng được không?</span>
                <span className="faq-icon">+</span>
              </div>
              {openFaq[2] && (
                <div className="faq-a">
                  Có thể tái sử dụng. Khi muốn dỡ vườn, bà con chỉ cần đào nhẹ một hố đất nhỏ bên cạnh để xoay mỏ neo xuôi lại theo chiều dọc là có thể rút lên dùng lại cho mùa vụ sau, độ bền thép mạ kẽm trên 10 năm không hao mòn.
                </div>
              )}
            </div>

            <div className={`faq-item ${openFaq[3] ? "open" : ""}`}>
              <div className="faq-q" onClick={() => toggleFaq(3)}>
                <span>Thời gian giao hàng bao lâu và có được kiểm tra không?</span>
                <span className="faq-icon">+</span>
              </div>
              {openFaq[3] && (
                <div className="faq-a">
                  Thời gian giao hàng toàn quốc từ 2 - 4 ngày tùy khu vực. Khi shipper tới giao, bà con được mở bọc kiểm tra hàng tận tay, đúng số lượng và thép đúc dày dặn chuẩn mô tả mới thanh toán tiền cho shipper.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= 11. FOOTER ================= */}
        <footer className="footer-clean">
          <div style={{ fontWeight: 900, fontSize: "14.5px", color: "#ffffff", marginBottom: "4px" }}>
            VẬT TƯ NÔNG NGHIỆP &amp; CƠ KHÍ CHÍNH HÃNG
          </div>
          <p>Chuyên cung cấp mỏ neo đất NEO-10, dây cáp, tăng đơ và phụ kiện giàn leo nhà màng cao cấp</p>
        </footer>

        {/* ================= 12. STICKY BUY BOTTOM BAR ================= */}
        <div className={`sticky-buy ${isStickyHidden ? "hidden" : ""}`}>
          <div className="sticky-info">
            <span className="sticky-label">{currentCombo.name}</span>
            <strong className="sticky-price">{currentCombo.price.toLocaleString("vi-VN")}đ</strong>
          </div>
          <button
            type="button"
            className="sticky-btn"
            onClick={() => scrollToOrder(selectedCombo)}
          >
            Đặt mua ngay
          </button>
        </div>

        {/* ================= 13. REALTIME TOAST ================= */}
        <div className={`order-toast ${showToast ? "show" : ""} ${isStickyHidden ? "sticky-hidden" : ""}`}>
          <div className="toast-avatar">✓</div>
          <div className="toast-content">
            <div className="toast-line-top">
              <span className="toast-name">{currentToast.cust}</span>
              <span className="toast-time">{currentToast.time}</span>
            </div>
            <div className="toast-line-bottom">Đã đặt {currentToast.item}</div>
          </div>
        </div>

        {/* ================= 14. MODAL THÀNH CÔNG ================= */}
        {completedOrder && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-icon-success">✓</div>
              <h3 className="modal-title">ĐẶT HÀNG THÀNH CÔNG!</h3>
              <p className="modal-desc">
                Cảm ơn quý khách. Xưởng sẽ liên hệ qua số điện thoại để xác nhận đơn hàng và gửi hàng sớm nhất.
              </p>

              <div className="modal-bill">
                <div className="modal-bill-row">
                  <span>Mã đơn hàng:</span>
                  <strong style={{ color: "var(--green)" }}>{completedOrder.order_code}</strong>
                </div>
                <div className="modal-bill-row">
                  <span>Khách hàng:</span>
                  <strong>{completedOrder.customer_name}</strong>
                </div>
                <div className="modal-bill-row">
                  <span>Số điện thoại:</span>
                  <strong>{completedOrder.customer_phone}</strong>
                </div>
                <div className="modal-bill-row">
                  <span>Địa chỉ:</span>
                  <strong style={{ maxWidth: "200px", textAlign: "right" }}>
                    {completedOrder.customer_address}
                  </strong>
                </div>
                <div className="modal-bill-row">
                  <span>Sản phẩm:</span>
                  <strong>{completedOrder.combo_name}</strong>
                </div>
                <div
                  className="modal-bill-row"
                  style={{
                    borderTop: "1px dashed #cbd5e1",
                    paddingTop: "6px",
                    marginTop: "6px",
                  }}
                >
                  <span style={{ fontWeight: 800 }}>Tổng tiền:</span>
                  <strong style={{ color: "#dc2626", fontSize: "16px" }}>
                    {Number(completedOrder.total_price).toLocaleString("vi-VN")}đ
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="btn-modal-close"
                onClick={closeSuccessModal}
              >
                Hoàn tất &amp; Đóng
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
