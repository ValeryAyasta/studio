export interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'Attended' | 'Not Attended';
}
