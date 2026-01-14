import { withAuth } from "next-auth/middleware"

export default withAuth({
    // Tutaj można dodać opcjonalną konfigurację
    callbacks: {
        authorized: ({ token }) => !!token,
    },
});

export const config = {
    // Tutaj wpisywać ścieżki, które wymagają logowania
    matcher: ["/dashboard/:path*", "/profile"]
}