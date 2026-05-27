'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sponsorship, SponsorCategory, PostStatus } from '@/types';
import SponsorCard from '@/components/SponsorCard';

const CATEGORIES: (SponsorCategory | '전체')[] = ['전체', '뷰티', '식당', '매장', '제품', '기타'];
const STATUSES: (PostStatus | '전체')[] = ['전체', '작성예정', '작성중', '작성완료'];

export default function ListPage() {
  const [items, setItems] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<SponsorCategory | '전체'>('전체');
  const [filterStatus, setFilterStatus] = useState<PostStatus | '전체'>('전체');
  const [filterMonth, setFilterMonth] = useState('전체');

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

  const months = ['전체', ...Array.from(new Set(items.map(i => i.month))).sort().reverse()];

  const filtered = items.filter(i => {
    if (filterCat !== '전체' && i.category !== filterCat) return false;
    if (filterStatus !== '전체' && i.post_status !== filterStatus) return false;
    if (filterMonth !== '전체' && i.month !== filterMonth) return false;
    if (search) {
      const q = search.toLowerCase();
      return i.company.toLowerCase().includes(q) || i.memo.toLowerCase().includes(q);
    }
    return true;
  });

  const total = filtered.reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <h1 className="text-xl font-bold text-[#3D2B1F] mb-4">전체 목록</h1>

      <input
        className="w-full border border-[#E8DDD0] rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#C8A882] bg-white text-[#3D2B1F] placeholder-[#C8A882]"
        placeholder="업체명, 메모 검색..."
        value={search} onChange={e => setSearch(e.target.value)}
      />

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 flex-wrap mb-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c as SponsorCategory | '전체')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterCat === c
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-white text-[#8B5E3C] border-[#E8DDD0] hover:bg-[#FAF7F2]'
            }`}>{c}
          </button>
        ))}
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-1.5 flex-wrap mb-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilterStatus(s as PostStatus | '전체')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === s
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-white text-[#8B5E3C] border-[#E8DDD0] hover:bg-[#FAF7F2]'
            }`}>{s}
          </button>
        ))}
      </div>

      {/* 월 필터 */}
      <div className="mb-4">
        <select
          className="border border-[#E8DDD0] rounded-lg px-3 py-1.5 text-xs bg-white text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#C8A882]"
          value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          {months.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <p className="text-xs text-[#A07850] mb-3">
        {filtered.length}건 · 합계 <span className="text-[#8B5E3C] font-bold">{total.toLocaleString()}원</span>
      </p>

      {loading ? (
        <p className="text-[#A07850] text-sm">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-[#A07850] text-sm">결과가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => <SponsorCard key={item.id} item={item} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
