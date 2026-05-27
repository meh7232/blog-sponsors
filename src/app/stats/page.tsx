'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Sponsorship, SponsorCategory } from '@/types';

const CATEGORIES: SponsorCategory[] = ['뷰티', '식당', '매장', '제품', '기타'];
const CAT_COLOR: Record<string, string> = {
  뷰티: 'bg-rose-300',
  식당: 'bg-amber-300',
  매장: 'bg-stone-400',
  제품: 'bg-[#C8A882]',
  기타: 'bg-[#A07850]',
};

function getMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function StatsPage() {
  const [items, setItems] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());

  useEffect(() => {
    supabase.from('sponsorships').select('*').then(({ data }) => {
      setItems((data as Sponsorship[]) ?? []);
      setLoading(false);
    });
  }, []);

  const months = useMemo(() =>
    Array.from(new Set(items.map(i => i.month))).sort().reverse(), [items]);

  const monthItems = useMemo(() =>
    items.filter(i => i.month === selectedMonth), [items, selectedMonth]);

  const total = monthItems.reduce((s, i) => s + i.amount, 0);
  const completed = monthItems.filter(i => i.post_status === '작성완료').length;
  const completionRate = monthItems.length > 0 ? Math.round((completed / monthItems.length) * 100) : 0;
  const avgSatisfaction = monthItems.length > 0
    ? (monthItems.reduce((s, i) => s + i.satisfaction, 0) / monthItems.length).toFixed(1) : '0';

  const byCat = CATEGORIES.map(cat => ({
    cat,
    amount: monthItems.filter(i => i.category === cat).reduce((s, i) => s + i.amount, 0),
    count: monthItems.filter(i => i.category === cat).length,
  })).filter(c => c.count > 0);

  const yearTotal = items.filter(i => i.month.startsWith(selectedMonth.slice(0, 4)))
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-xl font-bold text-[#3D2B1F]">📊 통계</h1>
        <select
          className="border border-[#E8DDD0] rounded-lg px-3 py-1.5 text-sm bg-white text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#C8A882]"
          value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {months.length === 0
            ? <option value={selectedMonth}>{selectedMonth}</option>
            : months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {loading ? <p className="text-[#A07850] text-sm">불러오는 중...</p> : (
        <>
          {/* 핵심 지표 */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#3D2B1F] text-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-[#C8A882]">이번 달 협찬금액</p>
              <p className="text-2xl font-bold mt-1 text-[#FAF7F2]">{total.toLocaleString()}원</p>
              <p className="text-xs text-[#A07850] mt-1">{monthItems.length}건</p>
            </div>
            <div className="bg-[#8B5E3C] text-white rounded-2xl p-4 shadow-sm">
              <p className="text-sm text-[#EDE5D8]">{selectedMonth.slice(0, 4)}년 누적</p>
              <p className="text-2xl font-bold mt-1 text-[#FAF7F2]">{yearTotal.toLocaleString()}원</p>
              <p className="text-xs text-[#C8A882] mt-1">연간 합계</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatBox label="포스팅 완료율" value={`${completionRate}%`} />
            <StatBox label="완료" value={`${completed}건`} />
            <StatBox label="평균 만족도" value={`⭐${avgSatisfaction}`} />
          </div>

          {/* 카테고리별 */}
          {byCat.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 mb-4 shadow-sm">
              <h2 className="font-bold text-[#3D2B1F] mb-4">카테고리별 금액</h2>
              <div className="flex flex-col gap-3">
                {byCat.sort((a, b) => b.amount - a.amount).map(({ cat, amount, count }) => {
                  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#3D2B1F]">{cat} <span className="text-[#A07850] text-xs">({count}건)</span></span>
                        <span className="font-bold text-[#8B5E3C]">{amount.toLocaleString()}원 <span className="text-[#A07850] font-normal">{pct}%</span></span>
                      </div>
                      <div className="h-2 bg-[#EDE5D8] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${CAT_COLOR[cat]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 미포스팅 목록 */}
          {monthItems.filter(i => i.post_status !== '작성완료').length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 shadow-sm">
              <h2 className="font-bold text-[#3D2B1F] mb-3">⏳ 포스팅 대기 중</h2>
              <div className="flex flex-col gap-2">
                {monthItems.filter(i => i.post_status !== '작성완료').map(i => (
                  <div key={i.id} className="flex justify-between items-center p-3 bg-[#FAF7F2] rounded-xl text-sm border border-[#E8DDD0]">
                    <span className="font-medium text-[#3D2B1F]">{i.company}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#A07850]">{i.post_status}</span>
                      <span className="text-[#8B5E3C] font-bold">{i.amount.toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthItems.length === 0 && (
            <p className="text-center text-[#A07850] py-10">{selectedMonth} 기록이 없습니다.</p>
          )}
        </>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8DDD0] p-3 text-center shadow-sm">
      <p className="font-bold text-[#3D2B1F]">{value}</p>
      <p className="text-xs text-[#A07850] mt-0.5">{label}</p>
    </div>
  );
}
