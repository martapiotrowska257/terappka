import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak"
// import GoogleProvider from "next-auth/providers/google"

const keycloakUrl = process.env.KEYCLOAK_URL;
const keycloakInternalUrl = process.env.KEYCLOAK_INTERNAL_URL || keycloakUrl;
const realm = process.env.KEYCLOAK_REALM;

const handler = NextAuth({
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID!,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
            issuer: `${keycloakUrl}/realms/${realm}`,
            authorization: {
                params: {
                    scope: "openid email profile",
                },
                url: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth`,
            },
            token: `${keycloakInternalUrl}/realms/${realm}/protocol/openid-connect/token`,
            userinfo: `${keycloakInternalUrl}/realms/${realm}/protocol/openid-connect/userinfo`,
        }),
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID!,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // })
    ],
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
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
    debug: true,
});

export { handler as GET, handler as POST };