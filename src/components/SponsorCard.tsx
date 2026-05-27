import Link from 'next/link';
import { Sponsorship } from '@/types';

const CAT_COLOR: Record<string, string> = {
  뷰티: 'bg-rose-100 text-rose-700',
  식당: 'bg-amber-100 text-amber-700',
  매장: 'bg-stone-200 text-stone-700',
  제품: 'bg-[#EDE5D8] text-[#8B5E3C]',
  기타: 'bg-[#F5EFE6] text-[#A07850]',
};

const STATUS_COLOR: Record<string, string> = {
  작성예정: 'bg-amber-50 text-amber-700 border border-amber-200',
  작성중: 'bg-blue-50 text-blue-600 border border-blue-200',
  작성완료: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

function Stars({ n }: { n: number }) {
  return <span className="text-amber-400">{Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')}</span>;
}

interface Props {
  item: Sponsorship;
  onDelete?: (id: number) => void;
}

export default function SponsorCard({ item, onDelete }: Props) {
  return (
    <div className="bg-white border border-[#E8DDD0] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[#3D2B1F] text-base">{item.company}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[item.category]}`}>
            {item.category}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[item.post_status]}`}>
            {item.post_status}
          </span>
        </div>
        <span className="text-sm font-bold text-[#8B5E3C] whitespace-nowrap">
          {item.amount.toLocaleString()}원
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#A07850] mb-2">
        <span>{item.sponsor_date}</span>
        <Stars n={item.satisfaction} />
      </div>

      {item.post_url && (
        <a href={item.post_url} target="_blank" rel="noreferrer"
          className="text-xs text-[#8B5E3C] hover:underline block mb-1 truncate">
          🔗 {item.post_url}
        </a>
      )}

      {item.memo && (
        <p className="text-xs text-[#7A6050] bg-[#FAF7F2] rounded-lg px-3 py-2 mt-1">{item.memo}</p>
      )}

      <div className="flex gap-3 mt-3 pt-3 border-t border-[#EDE5D8]">
        <Link href={`/edit/${item.id}`} className="text-xs text-[#8B5E3C] hover:text-[#6B4423] font-medium">수정</Link>
        {onDelete && (
          <button onClick={() => onDelete(item.id)} className="text-xs text-[#C8A882] hover:text-red-400">
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
