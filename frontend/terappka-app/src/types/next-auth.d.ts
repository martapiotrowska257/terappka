import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    // dodajemy pole 'id' do użytkownika
    // można dodać więcej, jeśli potrzeba
    interface Session {
        user: {
            id?: string | null | undefined
        } & DefaultSession["user"]
    }
}
