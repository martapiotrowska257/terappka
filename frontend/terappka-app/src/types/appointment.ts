export type Appointment = {
  id: string;
  patient_id?: string;
  therapist_id?: string;
  datetime?: string;
  status?: string;
  description?: string;
  cancellation_reason?: string;
  outcome_notes?: string;
  createdAt?: string;
  updatedAt?: string;
};
