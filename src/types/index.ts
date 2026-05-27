export type SponsorCategory = '뷰티' | '식당' | '매장' | '제품' | '기타';
export type PostStatus = '작성예정' | '작성중' | '작성완료';

export interface Sponsorship {
  id: number;
  company: string;
  category: SponsorCategory;
  amount: number;
  sponsor_date: string;
  post_status: PostStatus;
  post_url: string;
  satisfaction: number;  // 1~5
  memo: string;
  month: string;         // YYYY-MM
  inserted_at?: string;
}

export type SponsorshipInput = Omit<Sponsorship, 'id' | 'inserted_at'>;
