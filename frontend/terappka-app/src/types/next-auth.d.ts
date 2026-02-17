import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    // dodajemy pole 'id' do użytkownika
    // można dodać więcej, jeśli potrzeba
    interface Session {
        accessToken?: string;
        error?: string;
        user: {
            id?: string | null | undefined
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        error?: string;
    }
}
