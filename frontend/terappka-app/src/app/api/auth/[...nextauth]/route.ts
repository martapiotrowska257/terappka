import { User } from "@/src/types/user";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const payload = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: payload,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Błąd podczas odświeżania tokenu:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const decodeJwt = (token: string) => {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  } catch (e) {
    return null;
  }
};

export const authOptions: NextAuthOptions = {
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
          const res = await fetch(
            `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: payload,
            },
          );

          const data = await res.json();

          if (!res.ok) {
            console.error("Błąd logowania Keycloak:", data);
            throw new Error(data.error_description || "Błąd logowania");
          }

          const decodedToken = decodeJwt(data.access_token);
          const roles = decodedToken?.realm_access?.roles || [];

          return {
            id: decodedToken?.sub || data.session_state || "unknown",
            name: decodedToken?.given_name || credentials.email,
            email: credentials.email,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in,
            roles: roles,

            firstName: decodedToken?.given_name || "",
            lastName: decodedToken?.family_name || "",
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
        token.roles = user.roles;
        token.firstName = (user as User).firstName || "";
        token.lastName = (user as User).lastName || "";
        return token;
      }
      if (Date.now() < (token.expiresAt as number) - 10000) {
        return token;
      }

      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (session.user) {
        session.user.roles = token.roles;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
