import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak"

const handler = NextAuth({
    providers: [
        KeycloakProvider({
        clientId: process.env.KEYCLOAK_CLIENT_ID!,
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
        issuer: process.env.KEYCLOAK_ISSUER!,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                token.id = user.id
            }
            return token
        },

        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
});

export { handler as GET, handler as POST };