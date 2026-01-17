"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function UserProfile() {
    const {data: session, status } = useSession();

    if (status === "loading") {
        return <p>Ładowanie...</p>;
    }

    if (status === "unauthenticated") {
        return (
            <div>
                <p>Nie jesteś zalogowany</p>
                <button onClick={() => signIn("keycloak")}>Zaloguj się przez KeyCloak</button>
            </div>
        );
    }

    return (
        <div>
            <p>Witaj, {session?.user?.name}</p>
            <p>Email: {session?.user?.email}</p>
            <button onClick={() => signOut()}>Wyloguj</button>
        </div>
    )
}