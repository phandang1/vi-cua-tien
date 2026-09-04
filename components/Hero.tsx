interface HeroProps {
  siteName?: string;
}

export default function Hero({ siteName = "Vị Của Tiên" }: HeroProps) {
  return (
    <div className="w-full pt-4 pb-3 px-4 text-center select-none">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#27351E] tracking-tight">
        {siteName}
      </h1>
    </div>
  );
}
