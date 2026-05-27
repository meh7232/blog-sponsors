'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sponsorship } from '@/types';
import Link from 'next/link';
import SponsorCard from '@/components/SponsorCard';

function getMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function HomePage() {
  const [items, setItems] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const thisMonth = getMonthKey();

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('sponsorships').select('*').order('sponsor_date', { ascending: false });
    setItems((data as Sponsorship[]) ?? []);
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm('삭제하시겠습니까?')) return;
    await supabase.from('sponsorships').delete().eq('id', id);
    load();
  }

  useEffect(() => { load(); }, []);

  const monthItems = items.filter(i => i.month === thisMonth);
  const monthTotal = monthItems.reduce((s, i) => s + i.amount, 0);
  const totalAll = items.reduce((s, i) => s + i.amount, 0);
  const pending = items.filter(i => i.post_status !== '작성완료').length;
  const recent = items.slice(0, 5);

  return (
    <div>
      {/* 헤더 */}
      <div className="bg-[#3D2B1F] rounded-2xl p-6 text-white mb-6 shadow-md">
        <p className="text-xs text-[#C8A882] tracking-widest mb-2">✦ 협찬 노트</p>
        <p className="text-sm text-[#A07850] mb-1">{thisMonth} 이달의 협찬</p>
        <p className="text-3xl font-bold text-[#C8A882]">{monthTotal.toLocaleString()}원</p>
        <p className="text-xs text-[#7A6050] mt-1">{monthItems.length}건 협찬</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="전체 협찬" value={`${items.length}건`} />
        <StatCard label="총 금액" value={`${(totalAll / 10000).toFixed(0)}만원`} highlight />
        <StatCard label="포스팅 대기" value={`${pending}건`} warn={pending > 0} />
      </div>

      {/* 최근 협찬 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[#3D2B1F]">최근 협찬</h2>
        <Link href="/list" className="text-xs text-[#8B5E3C] hover:underline">전체보기 →</Link>
      </div>

      {loading ? (
        <p className="text-[#A07850] text-sm">불러오는 중...</p>
      ) : recent.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DDD0]">
          <p className="text-[#A07850] mb-4">아직 등록된 협찬이 없어요</p>
          <Link href="/add" className="bg-[#8B5E3C] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#3D2B1F] transition-colors">
            첫 협찬 등록하기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recent.map(item => <SponsorCard key={item.id} item={item} onDelete={handleDelete} />)}
        </div>
      )}

      {/* 플로팅 버튼 */}
      <Link href="/add"
        className="fixed bottom-6 right-6 bg-[#8B5E3C] text-white w-14 h-14 rounded-full text-2xl flex items-center justify-center shadow-lg hover:bg-[#3D2B1F] transition-colors">
        +
      </Link>
    </div>
  );
}

function StatCard({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-xl p-3 text-center border ${
      highlight ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
      : warn ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-white text-[#3D2B1F] border-[#E8DDD0]'
    }`}>
      <p className="font-bold text-base">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  );
}
