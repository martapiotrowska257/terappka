import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      roles?: string[]; // <--- Dodajemy role do sesji
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    roles?: string[]; // <--- Dodajemy role do użytkownika
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
    roles?: string[]; // <--- Dodajemy role do tokena
  }
}