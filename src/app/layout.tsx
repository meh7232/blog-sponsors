import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '협찬 기록부',
  description: '블로그 협찬 기록 및 통계 관리',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-[#FAF7F2] min-h-screen">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
