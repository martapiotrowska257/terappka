export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  therapistId: string;
  createdAt: string;
  updatedAt?: string;
};

export type Role = "PATIENT" | "THERAPIST" | "ADMIN";
