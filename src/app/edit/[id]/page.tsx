'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sponsorship, SponsorCategory, PostStatus } from '@/types';
import { useRouter, useParams } from 'next/navigation';

const CATEGORIES: SponsorCategory[] = ['뷰티', '식당', '매장', '제품', '기타'];
const STATUSES: PostStatus[] = ['작성예정', '작성중', '작성완료'];
const INPUT = 'w-full border border-[#E8DDD0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A882] bg-white text-[#3D2B1F]';

function getMonthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function EditPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    company: '', category: '뷰티' as SponsorCategory, amount: '',
    sponsor_date: '', post_status: '작성예정' as PostStatus,
    post_url: '', satisfaction: 3, memo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState('');

  useEffect(() => {
    supabase.from('sponsorships').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        const d = data as Sponsorship;
        setForm({
          company: d.company, category: d.category, amount: String(d.amount),
          sponsor_date: d.sponsor_date, post_status: d.post_status,
          post_url: d.post_url, satisfaction: d.satisfaction, memo: d.memo,
        });
      }
      setLoading(false);
    });
  }, [id]);

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
    setWarn('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim()) { setWarn('업체명을 입력해주세요.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setWarn('금액을 입력해주세요.'); return; }

    setSaving(true);
    const { error } = await supabase.from('sponsorships').update({
      company: form.company, category: form.category, amount: Number(form.amount),
      sponsor_date: form.sponsor_date, post_status: form.post_status,
      post_url: form.post_url, satisfaction: form.satisfaction, memo: form.memo,
      month: getMonthKey(form.sponsor_date),
    }).eq('id', id);

    setSaving(false);
    if (error) { setWarn('수정 오류: ' + error.message); return; }
    alert('수정되었습니다!');
    router.push('/list');
  }

  if (loading) return <p className="text-[#A07850] text-sm p-4">불러오는 중...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-[#3D2B1F] mb-5">협찬 수정</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8DDD0] p-5 flex flex-col gap-4 shadow-sm">

        <Field label="업체명 *">
          <input className={INPUT} value={form.company} onChange={e => set('company', e.target.value)} />
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
            <input type="number" min="0" className={INPUT} value={form.amount} onChange={e => set('amount', e.target.value)} />
          </Field>
          <Field label="날짜 *">
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
          <textarea className={`${INPUT} min-h-[80px]`} value={form.memo} onChange={e => set('memo', e.target.value)} />
        </Field>

        {warn && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">⚠ {warn}</p>}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="flex-1 bg-[#8B5E3C] text-white py-3 rounded-xl font-bold hover:bg-[#3D2B1F] disabled:opacity-50 transition-colors">
            {saving ? '저장 중...' : '수정 완료'}
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
