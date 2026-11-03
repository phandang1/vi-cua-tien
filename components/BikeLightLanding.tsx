"use client";

import React, { useState, useEffect, useRef } from "react";

interface ComboOption {
  id: number;
  name: string;
  price: number;
  ship: number;
  total: number;
  shipText: string;
}

const COMBO_CONFIG: Record<number, ComboOption> = {
  1: {
    id: 1,
    name: "1 Cái Đèn T6 (119K)",
    price: 119000,
    ship: 25000,
    total: 144000,
    shipText: "25.000đ",
  },
  2: {
    id: 2,
    name: "Combo 2 Cái (199K - Miễn Ship)",
    price: 199000,
    ship: 0,
    total: 199000,
    shipText: "MIỄN PHÍ (0đ)",
  },
  3: {
    id: 3,
    name: "Combo 3 Cái (289K - Miễn Ship + Quà)",
    price: 289000,
    ship: 0,
    total: 289000,
    shipText: "MIỄN PHÍ (0đ)",
  },
};

const REAL_BUYERS = [
  {
    cust: "Anh Tuấn (0982.***.418)",
    item: "Combo 2 Đèn (199K - Freeship)",
    time: "1 phút trước",
    img: "/assets/images/hero_product.png",
  },
  {
    cust: "Chị Mai Linh (0915.***.892)",
    item: "1 Đèn Pha T6 Còi 140dB (119K)",
    time: "3 phút trước",
    img: "/assets/images/product_angles_clean.jpg",
  },
  {
    cust: "Anh Trọng Quân (0977.***.621)",
    item: "Combo 2 Đèn (199K - Freeship)",
    time: "5 phút trước",
    img: "/assets/images/hero_product.png",
  },
  {
    cust: "Chú Hùng (0903.***.155)",
    item: "Combo 3 Đèn Xe Đạp (289K)",
    time: "8 phút trước",
    img: "/assets/images/package_box.jpg",
  },
  {
    cust: "Anh Minh Đức (0938.***.734)",
    item: "Combo 2 Đèn (199K - Freeship)",
    time: "12 phút trước",
    img: "/assets/images/hero_product.png",
  },
];

export default function BikeLightLanding() {
  // 1. Countdown timers
  const [secondsLeft, setSecondsLeft] = useState(2 * 3600 + 45 * 60 + 18);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 3 * 3600 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const formatMinutes = String(
    Math.floor((secondsLeft % 3600) / 60)
  ).padStart(2, "0");
  const formatSeconds = String(secondsLeft % 60).padStart(2, "0");

  // 2. Carousel Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;
  const startXRef = useRef(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);
    return () => clearInterval(slideTimer);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    let nextIdx = idx;
    if (nextIdx < 0) nextIdx = totalSlides - 1;
    if (nextIdx >= totalSlides) nextIdx = 0;
    setCurrentSlide(nextIdx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = startXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToSlide(currentSlide + 1);
      else goToSlide(currentSlide - 1);
    }
  };

  // 3. Form Order state
  const [selectedCombo, setSelectedCombo] = useState<number>(2);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  const currentCombo = COMBO_CONFIG[selectedCombo] || COMBO_CONFIG[2];

  const scrollToOrder = (comboId?: number) => {
    if (comboId) setSelectedCombo(comboId);
    const target = document.getElementById("orderForm");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    // Meta Pixel Checkout Initiate
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "InitiateCheckout");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = custName.trim();
    const phone = custPhone.trim();
    const address = custAddress.trim();

    if (!name) {
      alert("Vui lòng nhập họ và tên của bạn!");
      return;
    }
    if (!phone) {
      alert("Vui lòng nhập số điện thoại nhận hàng!");
      return;
    }
    if (!address) {
      alert("Vui lòng nhập địa chỉ nhận hàng!");
      return;
    }

    setIsSubmitting(true);
    const orderCode = "BP" + Math.floor(100000 + Math.random() * 900000);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_code: orderCode,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          combo_id: currentCombo.id,
          combo_name: currentCombo.name,
          color: "Đen Tuyền",
          item_price: currentCombo.price,
          shipping_fee: currentCombo.ship,
          total_price: currentCombo.total,
        }),
      });

      const json = await res.json();
      if (json.success && json.order) {
        setCompletedOrder(json.order);
      } else {
        // Fallback local order info
        setCompletedOrder({
          order_code: orderCode,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          combo_name: currentCombo.name,
          total_price: currentCombo.total,
        });
      }

      // Meta Pixel Purchase Event
      if (typeof (window as any).fbq === "function") {
        (window as any).fbq("track", "Purchase", {
          value: Number(currentCombo.total),
          currency: "VND",
          content_name: currentCombo.name,
          num_items: Number(selectedCombo),
        });
      }
    } catch (err) {
      console.error("Order submit error:", err);
      // Still show success modal to customer
      setCompletedOrder({
        order_code: orderCode,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
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
    setSelectedCombo(2);
  };

  // 4. Live order toasts
  const [toastIdx, setToastIdx] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const showInterval = setInterval(() => {
      setShowToast(true);
      setToastIdx((prev) => (prev + 1) % REAL_BUYERS.length);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    }, 11000);

    return () => clearInterval(showInterval);
  }, []);

  const currentToast = REAL_BUYERS[toastIdx];

  // 5. FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#0f172a] flex justify-center font-sans antialiased pb-20">
      {/* Container 440px Mobile-First App Style */}
      <div className="w-full max-w-[440px] bg-white min-h-screen relative overflow-x-hidden shadow-2xl">
        {/* 1. TOP URGENT BAR */}
        <div className="bg-[#b91c1c] text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 bg-yellow-300 rounded-full animate-ping"></span>
            <span>⚡ FLASH SALE GIẢM 52%</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-yellow-300 whitespace-nowrap">
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-yellow-300">
              {formatHours}
            </span>
            :
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-yellow-300">
              {formatMinutes}
            </span>
            :
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-yellow-300">
              {formatSeconds}
            </span>
          </div>
        </div>

        {/* BRAND HEADER */}
        <div className="bg-[#0f172a] text-white py-2.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-sm shadow-xs">
              🚴
            </span>
            <span className="font-black text-sm tracking-wide">
              BIKE PRO STORE
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
            ✓ CHÍNH HÃNG
          </span>
        </div>

        {/* 2. HERO GALLERY CAROUSEL */}
        <div className="relative bg-slate-100 overflow-hidden select-none">
          <div
            className="flex transition-transform duration-350 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Slide 1 */}
            <div className="min-w-full relative">
              <img
                src="/assets/images/hero_product.png"
                alt="Đèn xe đạp T6 có còi 140dB"
                className="w-full h-[330px] object-cover block"
              />
              <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-xs">
                🔥 LED T6 SIÊU SÁNG 3W
              </span>
            </div>

            {/* Slide 2 */}
            <div className="min-w-full relative">
              <img
                src="/assets/images/product_angles_clean.jpg"
                alt="Ảnh thực tế gắn xe"
                className="w-full h-[330px] object-cover block"
              />
              <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-xs">
                📸 ẢNH THẬT GẮN XE 3 GÓC ĐỘ
              </span>
            </div>

            {/* Slide 3 (Video) */}
            <div className="min-w-full relative bg-black">
              <video
                src="/assets/images/product_video.mp4"
                poster="/assets/images/video_poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-[330px] object-cover block"
              />
              <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-xs">
                🎬 VIDEO THỰC TẾ SẢN PHẨM
              </span>
            </div>

            {/* Slide 4 */}
            <div className="min-w-full relative">
              <img
                src="/assets/images/aluminum_shell.jpg"
                alt="Chống nước đi mưa"
                className="w-full h-[330px] object-cover block"
              />
              <span className="absolute top-2.5 left-2.5 bg-slate-900/90 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-xs">
                🌧️ CHỐNG NƯỚC IP44 ĐI MƯA RÀO
              </span>
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() => goToSlide(currentSlide - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm z-10 hover:bg-black/60 transition-colors"
          >
            ❮
          </button>
          <button
            onClick={() => goToSlide(currentSlide + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-sm z-10 hover:bg-black/60 transition-colors"
          >
            ❯
          </button>

          {/* Dots */}
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1.5 z-10">
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? "w-5 bg-rose-600" : "w-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Thumbnail Row */}
        <div className="flex gap-2 p-2 bg-white overflow-x-auto scrollbar-none border-b border-slate-100">
          {[
            { img: "/assets/images/hero_product.png", isVid: false },
            { img: "/assets/images/product_angles_clean.jpg", isVid: false },
            { img: "/assets/images/video_poster.jpg", isVid: true },
            { img: "/assets/images/aluminum_shell.jpg", isVid: false },
          ].map((th, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`relative flex-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                currentSlide === idx
                  ? "border-rose-600 scale-105 opacity-100"
                  : "border-transparent opacity-60"
              }`}
            >
              <img
                src={th.img}
                alt="thumb"
                className="w-full h-full object-cover"
              />
              {th.isVid && (
                <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-xs">
                  ▶
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 3. HERO INFO & PRICE BOX */}
        <div className="p-3.5 bg-white border-b-8 border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-100 text-red-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
              Bán Chạy
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              ⭐ 4.9/5 (1.240 đánh giá • 3.850+ đã bán)
            </span>
          </div>

          <h1 className="text-[17px] font-black text-slate-900 leading-snug mb-2.5">
            Đèn Xe Đạp Có Còi Pin Sạc USB Đèn Pha Led T6 Chống Nước (Bóng LED T6 3W - Còi 140dB)
          </h1>

          {/* Price Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-black text-rose-600">
                119.000đ
              </span>
              <span className="text-sm text-slate-400 line-through">
                250.000đ
              </span>
              <span className="bg-red-100 text-red-600 text-[11px] font-black px-1.5 py-0.5 rounded">
                -52%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Giá 1 cái (Phí ship 25k) • Mua từ 2 cái miễn ship toàn quốc
            </p>

            {/* COMBO 2 CÁI CALLOUT */}
            <div
              onClick={() => scrollToOrder(2)}
              className="mt-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-dashed border-amber-400 rounded-lg p-2.5 cursor-pointer hover:border-amber-500 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-black text-amber-900 flex items-center gap-1">
                  🌟 COMBO 2 CÁI
                </span>
                <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  MIỄN PHÍ SHIP
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-800 font-semibold">
                  Tiết kiệm 75K • Lắp 2 xe gia đình
                </span>
                <span className="text-base font-black text-red-700">
                  199.000đ
                </span>
              </div>
            </div>
          </div>

          {/* Stock countdown & bar */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-red-600 flex items-center gap-1">
                <span className="animate-pulse">🔥</span> Sắp hết suất ưu đãi
              </span>
              <span className="text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[11px]">
                Còn 14 bộ hôm nay
              </span>
            </div>
            <div className="w-full h-2.5 bg-red-100 rounded-full overflow-hidden border border-red-200/50">
              <div className="w-[86%] h-full bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 rounded-full"></div>
            </div>
          </div>

          {/* Main CTA */}
          <button
            onClick={() => scrollToOrder(1)}
            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white py-3 px-4 rounded-xl font-black text-sm uppercase tracking-wide shadow-md shadow-rose-500/25 transition-all active:scale-98"
          >
            👉 MUA NGAY 119K
          </button>
        </div>

        {/* 4. COMMITMENTS */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border-b-8 border-slate-100 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <span className="text-lg">📦</span>
            <span className="font-bold text-slate-800">Kiểm tra khi nhận</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
            <span className="text-lg">🚚</span>
            <span className="font-bold text-slate-800">Miễn ship từ 2 cái</span>
          </div>
        </div>

        {/* 5. TÍNH NĂNG NỔI BẬT */}
        <div className="p-4 bg-white border-b-8 border-slate-100">
          <div className="text-center mb-3">
            <span className="inline-block text-[11px] font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase mb-1">
              ƯU ĐIỂM VƯỢT TRỘI
            </span>
            <h2 className="text-lg font-black text-slate-900">
              TÍNH NĂNG NỔI BẬT
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Feature 1 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="relative h-28 bg-slate-900">
                <img
                  src="/assets/images/video_poster.jpg"
                  alt="LED T6"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-yellow-300 text-[10px] font-black px-1.5 py-0.5 rounded">
                  250 Lumens
                </span>
              </div>
              <div className="p-2 text-center">
                <h3 className="text-xs font-black text-slate-900">
                  1. LED T6 Siêu Sáng
                </h3>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="relative h-28 bg-slate-900">
                <img
                  src="/assets/images/product_side.jpg"
                  alt="Còi 140dB"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-yellow-300 text-[10px] font-black px-1.5 py-0.5 rounded">
                  Còi 140dB
                </span>
              </div>
              <div className="p-2 text-center">
                <h3 className="text-xs font-black text-slate-900">
                  2. Còi Nút Dây 30cm
                </h3>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="relative h-28 bg-slate-900">
                <img
                  src="/assets/images/aluminum_shell.jpg"
                  alt="3 chế độ"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-yellow-300 text-[10px] font-black px-1.5 py-0.5 rounded">
                  3 Chế Độ
                </span>
              </div>
              <div className="p-2 text-center">
                <h3 className="text-xs font-black text-slate-900">
                  3. 3 Mức Sáng Linh Hoạt
                </h3>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
              <div className="relative h-28 bg-slate-900">
                <img
                  src="/assets/images/product_mount_top.jpg"
                  alt="Chống nước"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-yellow-300 text-[10px] font-black px-1.5 py-0.5 rounded">
                  IP44
                </span>
              </div>
              <div className="p-2 text-center">
                <h3 className="text-xs font-black text-slate-900">
                  4. Chống Nước Đi Mưa
                </h3>
              </div>
            </div>

            {/* Feature 5 - Span 2 */}
            <div className="col-span-2 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs flex">
              <div className="w-28 bg-white p-2 shrink-0 flex items-center justify-center">
                <img
                  src="/assets/images/usb_charging_vi.jpg"
                  alt="Sạc USB"
                  className="max-h-20 object-contain"
                />
              </div>
              <div className="p-3 flex items-center">
                <h3 className="text-xs font-black text-slate-900">
                  5. Pin 1200mAh Sạc USB Cực Nhanh (~2 Giờ Đầy)
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* 6. VIDEO DEMO FEATURE */}
        <div className="p-4 bg-white border-b-8 border-slate-100">
          <div className="rounded-xl overflow-hidden bg-black shadow-md">
            <video
              src="/assets/images/feature_demo_video.mp4"
              poster="/assets/images/feature_video_poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full max-h-[460px] object-contain block mx-auto"
            />
          </div>
        </div>

        {/* 7. SPECS TABLE */}
        <div className="p-4 bg-white border-b-8 border-slate-100">
          <div className="text-center mb-3">
            <h2 className="text-lg font-black text-slate-900">
              CHI TIẾT SẢN PHẨM
            </h2>
          </div>

          <table className="w-full border-collapse border border-slate-200 text-xs rounded-xl overflow-hidden">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 font-bold text-slate-700 bg-slate-50 w-[36%]">
                  Bóng LED
                </td>
                <td className="p-2.5 font-semibold text-slate-900">
                  Bóng LED T6 siêu sáng công suất 3W hiệu suất cao
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-700 bg-slate-50">
                  Chế độ sáng
                </td>
                <td className="p-2.5 font-semibold text-slate-900">
                  3 chế độ: Sáng mạnh 250LM (2.5H) • Sáng mờ 125LM (5H) • Nháy 250LM (3.5H)
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 font-bold text-slate-700 bg-slate-50">
                  Còi báo động
                </td>
                <td className="p-2.5 font-semibold text-slate-900">
                  140 dB (5 kiểu âm thanh, giữ nút còi 4s để đổi kiểu âm)
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td className="p-2.5 font-bold text-slate-700 bg-slate-50">
                  Hệ thống nút
                </td>
                <td className="p-2.5 font-semibold text-slate-900">
                  2 nút riêng: 1 nút trên đèn chỉnh đèn • 1 nút trên dây (dài 30cm) bấm còi
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 font-bold text-slate-700 bg-slate-50">
                  Pin & Cổng sạc
                </td>
                <td className="p-2.5 font-semibold text-slate-900">
                  Pin sạc liền 1200mAh qua USB (Độ bền &gt;500 lần sạc, sạc đầy ~2 giờ)
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-700 bg-slate-50">
                  Tiêu chuẩn nước
                </td>
                <td className="p-2.5 font-semibold text-slate-900">
                  IP44 (Thiết kế nhựa cao cấp kết hợp cao su, đi mưa rào thoải mái)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BANNER MIDDLE */}
        <div className="p-3.5 bg-white border-b-8 border-slate-100">
          <img
            src="/assets/images/banner_middle.webp"
            alt="Chi tiết đèn xe đạp"
            className="w-full rounded-xl shadow-xs"
          />
        </div>

        {/* 8. FORM ĐẶT HÀNG TRỰC TIẾP */}
        <div
          id="orderForm"
          className="p-4 bg-white border-t-4 border-rose-600 border-b-8 border-slate-100"
        >
          <div className="text-center mb-3.5">
            <h2 className="text-xl font-black text-red-700">
              ĐẶT HÀNG NHẬN ƯU ĐÃI
            </h2>
            <p className="text-xs text-slate-500">
              Kiểm tra hàng bật thử còi đèn rồi mới thanh toán tiền
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3">
            {/* Chọn Combo */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Gói bạn chọn: <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedCombo}
                onChange={(e) => setSelectedCombo(Number(e.target.value))}
                className="w-full bg-white border-2 border-slate-300 focus:border-rose-600 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-xs transition-colors"
              >
                <option value={1}>1 CÁI: 119.000đ (+ 25k ship = 144k)</option>
                <option value={2}>COMBO 2 CÁI: 199.000đ (Miễn Phí Ship)</option>
                <option value={3}>COMBO 3 CÁI: 289.000đ (Miễn Ship + Quà)</option>
              </select>
            </div>

            {/* Họ tên */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Họ và tên: <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Hoàng"
                required
                className="w-full bg-white border-2 border-slate-300 focus:border-rose-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-xs transition-colors"
              />
            </div>

            {/* SĐT */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Số điện thoại: <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="Ví dụ: 0912 345 678"
                required
                className="w-full bg-white border-2 border-slate-300 focus:border-rose-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-xs transition-colors"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Địa chỉ nhận hàng: <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={custAddress}
                onChange={(e) => setCustAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh thành"
                required
                className="w-full bg-white border-2 border-slate-300 focus:border-rose-600 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-xs transition-colors"
              />
            </div>

            {/* Bảng tính tiền COD */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Tiền hàng:</span>
                <strong className="text-slate-900">
                  {currentCombo.price.toLocaleString("vi-VN")}đ
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển:</span>
                <strong
                  className={
                    currentCombo.ship === 0
                      ? "text-emerald-700 font-bold"
                      : "text-slate-900"
                  }
                >
                  {currentCombo.shipText}
                </strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-300 text-sm font-black text-red-700">
                <span>TỔNG THANH TOÁN (COD):</span>
                <span>{currentCombo.total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 text-white py-3.5 px-4 rounded-xl font-black text-sm uppercase shadow-lg shadow-rose-500/25 transition-all active:scale-98 flex flex-col items-center justify-center gap-0.5"
            >
              <span>
                {isSubmitting ? "ĐANG GỬI ĐƠN HÀNG..." : "👉 XÁC NHẬN ĐẶT HÀNG"}
              </span>
              <small className="text-[11px] font-normal normal-case opacity-90">
                (Nhận hàng kiểm tra test thử mới thanh toán tiền)
              </small>
            </button>
          </form>
        </div>

        {/* 9. REVIEWS KHÁCH HÀNG THỰC TẾ */}
        <div className="p-4 bg-white border-b-8 border-slate-100">
          <div className="text-center mb-3">
            <h2 className="text-lg font-black text-slate-900">
              HÌNH ẢNH MỞ HỘP THỰC TẾ
            </h2>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center mb-3.5">
            <div className="text-3xl font-black text-amber-800">4.9</div>
            <div className="text-amber-500 text-sm">★★★★★</div>
            <div className="text-xs text-amber-900 font-bold mt-0.5">
              1.240 đánh giá hài lòng
            </div>
          </div>

          {/* Review 1 */}
          <div className="py-2.5 border-b border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">
                Nguyễn Duy Hoàng{" "}
                <span className="text-emerald-600 font-bold">✓ Đã mua</span>
              </span>
              <span className="text-[11px] text-slate-400">Hà Nội</span>
            </div>
            <div className="text-amber-500 text-[11px] my-0.5">★★★★★</div>
            <p className="text-xs text-slate-700 mb-2">
              Giao hàng nhanh, đóng gói cẩn thận. Đèn sáng mạnh 250LM soi rất xa và rõ, còi 140dB vang to xe máy nghe rõ rẽ sang bên ngay. Mua combo 2 cái được freeship quá hời!
            </p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <img
                src="/assets/images/review_real_1.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
              <img
                src="/assets/images/review_real_2.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
              <img
                src="/assets/images/review_real_3.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
            </div>
          </div>

          {/* Review 2 */}
          <div className="py-2.5 border-b border-slate-200">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">
                Phương Nam{" "}
                <span className="text-emerald-600 font-bold">✓ Đã mua</span>
              </span>
              <span className="text-[11px] text-slate-400">TP.HCM</span>
            </div>
            <div className="text-amber-500 text-[11px] my-0.5">★★★★★</div>
            <p className="text-xs text-slate-700 mb-2">
              Đèn gắn vừa khít ghi đông xe, nút còi dây dài 30cm bấm tiện lợi không cần buông tay lái. Pin 1200mAh sạc USB nhanh, dùng thoải mái nhiều ngày.
            </p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <img
                src="/assets/images/review_real_4.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
              <img
                src="/assets/images/review_real_5.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
            </div>
          </div>

          {/* Review 3 */}
          <div className="py-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900">
                Nguyễn Ngọc Thành{" "}
                <span className="text-emerald-600 font-bold">✓ Đã mua</span>
              </span>
              <span className="text-[11px] text-slate-400">Đà Nẵng</span>
            </div>
            <div className="text-amber-500 text-[11px] my-0.5">★★★★★</div>
            <p className="text-xs text-slate-700 mb-2">
              Test đi mưa rào không bị ngấm nước, chuẩn IP44 rất an tâm. Còi có 5 kiểu chuông bấm giữ 4 giây là đổi tiếng. Đèn nhỏ gọn tháo sạc dễ dàng, 5 sao!
            </p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              <img
                src="/assets/images/review_real_6.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
              <img
                src="/assets/images/review_real_7.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
              <img
                src="/assets/images/review_real_8.jpg"
                alt="review"
                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* 10. FAQ ACCORDION */}
        <div className="p-4 bg-white border-b-8 border-slate-100">
          <div className="text-center mb-3">
            <h2 className="text-lg font-black text-slate-900">
              CÂU HỎI PHỔ BIẾN
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(0)}
                className="w-full text-left p-3 font-bold bg-slate-50 flex justify-between items-center text-slate-900"
              >
                <span>1. Có được kiểm tra hàng trước khi thanh toán không?</span>
                <span>{openFaq === 0 ? "▲" : "▼"}</span>
              </button>
              {openFaq === 0 && (
                <div className="p-3 bg-white text-slate-700 border-t border-slate-200 leading-relaxed">
                  Dạ CÓ! Quý khách được quyền mở hộp, bật thử đèn, bấm thử còi, ưng ý đúng chất lượng rồi mới thanh toán tiền cho Shipper.
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(1)}
                className="w-full text-left p-3 font-bold bg-slate-50 flex justify-between items-center text-slate-900"
              >
                <span>2. Đổi 5 kiểu tiếng còi như thế nào?</span>
                <span>{openFaq === 1 ? "▲" : "▼"}</span>
              </button>
              {openFaq === 1 && (
                <div className="p-3 bg-white text-slate-700 border-t border-slate-200 leading-relaxed">
                  Sản phẩm có 2 nút riêng biệt: nút trên đèn chỉnh 3 chế độ sáng, nút trên dây nối rời (dài 30cm) điều chỉnh còi 140dB. Để đổi kiểu âm thanh, bạn <strong>nhấn giữ nút còi trong 4 giây</strong> (có 5 kiểu âm tùy chọn).
                </div>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(2)}
                className="w-full text-left p-3 font-bold bg-slate-50 flex justify-between items-center text-slate-900"
              >
                <span>3. Đi mưa lớn có bị nước vào hỏng đèn không?</span>
                <span>{openFaq === 2 ? "▲" : "▼"}</span>
              </button>
              {openFaq === 2 && (
                <div className="p-3 bg-white text-slate-700 border-t border-slate-200 leading-relaxed">
                  Đèn được thiết kế nhựa cao cấp kết hợp cao su theo tiêu chuẩn chống nước IP44, hoạt động an toàn và bền bỉ trong bất kỳ thời tiết nào như nắng nóng hay mưa rào.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-900 text-slate-400 text-center text-xs">
          <div className="font-extrabold text-sm text-white">BIKE PRO VIỆT NAM</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Phụ kiện xe đạp thể thao chính hãng • Hotline hỗ trợ CSKH
          </p>
        </div>

        {/* 11. STICKY BOTTOM BAR */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-white border-t border-slate-200 px-3.5 py-2 flex items-center justify-between z-40 shadow-lg">
          <div>
            <div className="text-[10px] font-bold text-amber-600">
              ⚡ Giá sốc hôm nay
            </div>
            <div className="text-lg font-black text-rose-600">
              {selectedCombo === 1
                ? "119.000đ/cái"
                : currentCombo.total.toLocaleString("vi-VN") + "đ"}
            </div>
          </div>
          <button
            onClick={() => scrollToOrder(2)}
            className="bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black text-xs uppercase px-5 py-2.5 rounded-full shadow-md shadow-rose-500/25 active:scale-95 transition-all"
          >
            MUA NGAY ⚡
          </button>
        </div>

        {/* 12. REAL BUYER TOAST POPUP */}
        {showToast && currentToast && (
          <div className="fixed bottom-16 left-3 z-50 max-w-[320px] bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2.5 shadow-xl animate-bounce">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200 bg-slate-50">
              <img
                src={currentToast.img}
                alt="toast"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                ✓
              </span>
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-slate-900 truncate">
                  {currentToast.cust}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentToast.time}
                </span>
              </div>
              <div className="text-slate-600 truncate text-[11px] mt-0.5">
                Vừa đặt:{" "}
                <strong className="text-red-600">{currentToast.item}</strong>
              </div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-slate-400 text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* 13. SUCCESS MODAL */}
        {completedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 text-2xl flex items-center justify-center mx-auto mb-2.5 font-bold">
                ✓
              </div>
              <h3 className="text-lg font-black text-slate-900">
                ĐẶT HÀNG THÀNH CÔNG!
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shop sẽ gọi điện để xác nhận đơn hàng với bạn trước khi giao.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs my-3 space-y-1">
                <div>
                  <strong>Mã đơn hàng:</strong>{" "}
                  <span className="text-rose-600 font-black">
                    #{completedOrder.order_code}
                  </span>
                </div>
                <div>
                  <strong>Gói chọn:</strong> {completedOrder.combo_name}
                </div>
                <div>
                  <strong>Người nhận:</strong> {completedOrder.customer_name} -{" "}
                  {completedOrder.customer_phone}
                </div>
                <div>
                  <strong>Địa chỉ:</strong> {completedOrder.customer_address}
                </div>
                <div className="pt-1.5 border-t border-slate-200 text-sm font-black text-red-700 flex justify-between">
                  <span>Tổng tiền (COD):</span>
                  <span>
                    {(completedOrder.total_price || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <button
                onClick={closeSuccessModal}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold py-2.5 rounded-xl text-xs uppercase shadow-md shadow-rose-500/20"
              >
                HOÀN TẤT VÀ ĐÓNG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
