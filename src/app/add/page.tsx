'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SponsorCategory, PostStatus, SponsorshipInput } from '@/types';
import { useRouter } from 'next/navigation';

const CATEGORIES: SponsorCategory[] = ['뷰티', '식당', '매장', '제품', '기타'];
const STATUSES: PostStatus[] = ['작성예정', '작성중', '작성완료'];
const INPUT = 'w-full border border-[#E8DDD0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A882] bg-white text-[#3D2B1F]';

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function AddPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    company: '', category: '뷰티' as SponsorCategory,
    amount: '', sponsor_date: today,
    post_status: '작성예정' as PostStatus,
    post_url: '', satisfaction: 3, memo: '',
  });
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState('');

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
    setWarn('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim()) { setWarn('업체명을 입력해주세요.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setWarn('금액을 입력해주세요.'); return; }

    setSaving(true);
    const data: SponsorshipInput = {
      company: form.company,
      category: form.category,
      amount: Number(form.amount),
      sponsor_date: form.sponsor_date,
      post_status: form.post_status,
      post_url: form.post_url,
      satisfaction: form.satisfaction,
      memo: form.memo,
      month: getMonthKey(form.sponsor_date),
    };

    const { error } = await supabase.from('sponsorships').insert(data as never);
    setSaving(false);
    if (error) { setWarn('저장 오류: ' + error.message); return; }
    alert('등록되었습니다!');
    router.push('/');
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-[#3D2B1F] mb-5">협찬 등록</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8DDD0] p-5 flex flex-col gap-4 shadow-sm">

        <Field label="업체명 *">
          <input className={INPUT} placeholder="업체명 입력" value={form.company} onChange={e => set('company', e.target.value)} />
        </Field>

        <Field label="카테고리 *">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => set('category', c)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  form.category === c
                    ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                    : 'bg-[#FAF7F2] text-[#8B5E3C] border-[#E8DDD0] hover:bg-[#EDE5D8]'
                }`}>{c}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="협찬 금액 (원) *">
            <input type="number" min="0" className={INPUT} placeholder="0"
              value={form.amount} onChange={e => set('amount', e.target.value)} />
          </Field>
          <Field label="협찬 날짜 *">
            <input type="date" className={INPUT} value={form.sponsor_date} onChange={e => set('sponsor_date', e.target.value)} />
          </Field>
        </div>

        <Field label="포스팅 상태">
          <div className="flex gap-2">
            {STATUSES.map(s => (
              <button key={s} type="button" onClick={() => set('post_status', s)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  form.post_status === s
                    ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                    : 'bg-[#FAF7F2] text-[#8B5E3C] border-[#E8DDD0]'
                }`}>{s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="포스팅 링크">
          <input className={INPUT} placeholder="https://..." value={form.post_url} onChange={e => set('post_url', e.target.value)} />
        </Field>

        <Field label={`만족도 ${'⭐'.repeat(form.satisfaction)}${'☆'.repeat(5 - form.satisfaction)}`}>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => set('satisfaction', n)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  form.satisfaction === n ? 'bg-amber-400 text-white border-amber-400' : 'bg-white text-gray-500 border-[#E8DDD0]'
                }`}>{n}점
              </button>
            ))}
          </div>
        </Field>

        <Field label="메모">
          <textarea className={`${INPUT} min-h-[80px]`} placeholder="자유롭게 메모를 남겨보세요"
            value={form.memo} onChange={e => set('memo', e.target.value)} />
        </Field>

        {warn && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">⚠ {warn}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="flex-1 bg-[#8B5E3C] text-white py-3 rounded-xl font-bold hover:bg-[#3D2B1F] disabled:opacity-50 transition-colors">
            {saving ? '저장 중...' : '등록하기'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-3 rounded-xl border border-[#E8DDD0] text-[#A07850] hover:bg-[#FAF7F2]">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#3D2B1F] mb-1.5">{label}</label>
      {children}
    </div>
  );
}
