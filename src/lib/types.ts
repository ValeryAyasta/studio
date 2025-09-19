export interface Participant {
  id: string;
  name: string;
  email: string;
  attendance: {
    day1: 'Attended' | 'Not Attended';
    day2: 'Attended' | 'Not Attended';
  };
}
export interface AttendanceSummary {
  day1: number;
  day2: number;
}
