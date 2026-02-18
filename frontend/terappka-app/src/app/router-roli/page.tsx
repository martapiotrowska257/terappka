// src/app/router-roli/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function RoleRouter() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/signIn");
    }

    const roles = session.user?.roles || [];

    // Kolejność ma znaczenie (jeśli ktoś ma kilka ról, na co ma wejść domyślnie)
    if (roles.includes("admin")) {
        redirect("/admin");
    } else if (roles.includes("therapist")) {
        redirect("/terapeuta");
    } else {
        redirect("/pacjent");
    }
}