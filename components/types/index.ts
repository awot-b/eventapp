export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string | null;
  repeat: 'None' | 'Weekly' | 'Bi-weekly' | 'Monthly';
}

export type RootStackParamList = {
  Home: undefined; // No parameters for the Home screen
  EditEvent: { event: Event }; // EditEvent screen expects an `event` parameter
  CreateEvent: undefined;
};
