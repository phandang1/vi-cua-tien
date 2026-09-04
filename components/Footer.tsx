import Link from "next/link";

interface FooterProps {
  footerText?: string;
}

export default function Footer({}: FooterProps) {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 pt-6 pb-12 mt-4 text-center">
      {/* Subtle Copyright */}
      <div className="text-[12px] text-[#27351E]/60 flex items-center justify-center gap-3">
        <span>© {new Date().getFullYear()} Vị Của Tiên. All rights reserved.</span>
      </div>
    </footer>
  );
}
