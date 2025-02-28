export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string | null;
  repeat: 'None' | 'Weekly' | 'Bi-weekly' | 'Monthly';
}

