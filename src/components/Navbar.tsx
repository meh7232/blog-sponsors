'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: '홈' },
  { href: '/add', label: '+ 등록' },
  { href: '/list', label: '목록' },
  { href: '/stats', label: '통계' },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="bg-[#3D2B1F] sticky top-0 z-10 shadow-md">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center h-14 gap-1">
          <span className="font-bold text-[#C8A882] mr-4 tracking-wide text-sm">✦ 협찬 노트</span>
          {links.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                path === href
                  ? 'bg-[#8B5E3C] text-[#FAF7F2]'
                  : 'text-[#C8A882] hover:text-[#FAF7F2] hover:bg-white/10'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
