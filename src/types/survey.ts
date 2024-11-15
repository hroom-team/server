export interface Survey {
  id: string;
  status: 'planned' | 'active' | 'processing';
  startDate: string;
  endDate: string;
}