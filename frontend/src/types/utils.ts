export type Phase = "Wdech" | "Przytrzymaj" | "Wydech" | "Pauza";

export const PHASE_CONFIG: Record<
  Phase,
  { duration: number; next: Phase; scale: number }
> = {
  Wdech: { duration: 4, next: "Przytrzymaj", scale: 1.5 },
  Przytrzymaj: { duration: 4, next: "Wydech", scale: 1.5 },
  Wydech: { duration: 4, next: "Pauza", scale: 1 },
  Pauza: { duration: 4, next: "Wdech", scale: 1 },
};
