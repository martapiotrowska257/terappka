import { Appointment } from "./appointment";
import { Diary } from "./diary";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  appointmentsAsPatient: Appointment[];
  diaries: Diary[];
  createdAt: string;
  updatedAt: string;
};
