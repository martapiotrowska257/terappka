import { Diary } from "./diary";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  diaries: Diary[];
  createdAt: string;
  updatedAt?: string;
};

export type Role = "PATIENT" | "THERAPIST" | "ADMIN";
