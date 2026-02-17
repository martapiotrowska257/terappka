import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Funkcja pomocnicza do dekodowania tokena JWT bez zewnętrznych bibliotek
const decodeJwt = (token: string) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  } catch (e) {
    return null;
  }
};

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Keycloak",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const payload = new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          grant_type: "password",
          username: credentials.email,
          password: credentials.password,
          scope: "openid profile email",
        });

        try {
          const res = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload,
          });

          const data = await res.json();

          if (!res.ok) {
            console.error("Błąd logowania Keycloak:", data);
            throw new Error(data.error_description || "Błąd logowania");
          }

          // Dekodujemy access_token, aby wyciągnąć role
          const decodedToken = decodeJwt(data.access_token);
          // Keycloak domyślnie trzyma role realmowe w: realm_access.roles
          const roles = decodedToken?.realm_access?.roles || [];

          return {
            id: data.session_state || "unknown",
            name: credentials.email, 
            email: credentials.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            roles: roles, // <--- Przekazujemy role dalej
          };

        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = Date.now() + (user.expiresIn as number) * 1000;
        token.roles = user.roles; // <--- Zapisujemy role w tokenie NextAuth
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      // <--- Przepisujemy role do widocznego obiektu sesji
      if (session.user) {
        session.user.roles = token.roles; 
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };