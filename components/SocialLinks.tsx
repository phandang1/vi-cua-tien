import Link from "next/link";
import { Mail, Youtube, Facebook } from "lucide-react";

interface SocialLinksProps {
  youtubeUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  contactUrl?: string;
}

export default function SocialLinks({
  youtubeUrl = "https://youtube.com/@vicuatien",
  tiktokUrl = "https://tiktok.com/@vicuatien",
  facebookUrl = "https://facebook.com/vicuatien",
  contactUrl = "mailto:vicuatien@gmail.com",
}: SocialLinksProps) {
  const mailHref = contactUrl?.startsWith("mailto:")
    ? contactUrl
    : contactUrl?.includes("@")
    ? `mailto:${contactUrl}`
    : "mailto:vicuatien@gmail.com";

  const items = [
    {
      name: "YouTube",
      href: youtubeUrl,
      bg: "bg-[#FF0000]",
      icon: <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />,
    },
    {
      name: "TikTok",
      href: tiktokUrl,
      bg: "bg-[#000000]",
      icon: (
        <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.86 1.4-.04 2.69-.94 3.14-2.27.24-.62.3-1.3.28-1.97-.01-4.57 0-9.14 0-13.71.01-.39.02-.78.02-1.17z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: facebookUrl,
      bg: "bg-[#1877F2]",
      icon: <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />,
    },
    {
      name: "Email",
      href: mailHref,
      bg: "bg-[#3D522B]",
      icon: <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />,
    },
  ];

  return (
    <div className="w-full max-w-[270px] mx-auto px-4 my-2">
      <div className="flex items-center justify-between">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group transition-all"
            title={item.name}
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${item.bg} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200`}
            >
              {item.icon}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#27351E]/80 group-hover:text-[#27351E] transition-colors">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
