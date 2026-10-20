export type Part = {
  id: string;
  pn: string;
  name: string;
  description: string | null;
  manufacturer: string | null;
  category: string | null;
};

export type QuoteItem = {
  pn: string;
  name: string | null;
  quantity: number;
  partId: string | null;
  isManual: boolean;
};
