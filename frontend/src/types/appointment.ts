export type Appointment = {
  id: string | number;
  patientId?: string;
  therapistId?: string;
  dateTime: string;
  status: AppointmentStatus;
  description?: string;
  cancellationReason?: string;
  outcomeNotes?: string;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
  therapistName?: string;
};

export type AppointmentStatus =
  | "AVAILABLE"
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
