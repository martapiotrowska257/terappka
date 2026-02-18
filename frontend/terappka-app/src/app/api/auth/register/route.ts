// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, name } = await request.json();

        // 1. Pobierz token administratora (Service Account)
        // Używamy grant_type=client_credentials aby działać jako "system"
        const tokenResponse = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_CLIENT_ID!,
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
                grant_type: "client_credentials",
            }),
        });

        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok) {
            console.error("Błąd pobierania tokena admina:", tokenData);
            return NextResponse.json({ error: "Błąd konfiguracji serwera" }, { status: 500 });
        }

        const adminToken = tokenData.access_token;

        // 2. Utwórz użytkownika w Keycloak
        // URL Admina zazwyczaj różni się od Issuera (/realms/ vs /admin/realms/)
        // Zakładamy standardową strukturę URL Keycloaka
        const adminUrl = process.env.KEYCLOAK_ISSUER?.replace("/realms/", "/admin/realms/");
        
        // Rozbijamy imię i nazwisko (opcjonalne)
        const [firstName, ...lastNameParts] = (name || "").split(" ");
        const lastName = lastNameParts.join(" ");

        const createUserResponse = await fetch(`${adminUrl}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                username: email, // W Keycloak email często jest username'm
                email: email,
                firstName: firstName,
                lastName: lastName,
                enabled: true, // Ważne: użytkownik od razu aktywny
                emailVerified: false, // Możesz zmienić na true, jeśli nie wymagasz weryfikacji
                credentials: [
                    {
                        type: "password",
                        value: password,
                        temporary: false, // Ważne: hasło jest stałe, nie tymczasowe
                    },
                ],
            }),
        });

        if (!createUserResponse.ok) {
            const errorData = await createUserResponse.json().catch(() => null);
            console.error("Błąd tworzenia użytkownika:", createUserResponse.status, errorData);
            
            if (createUserResponse.status === 409) {
                return NextResponse.json({ error: "Użytkownik o takim adresie email już istnieje." }, { status: 409 });
            }
            return NextResponse.json({ error: "Nie udało się utworzyć użytkownika." }, { status: 500 });
        }

        return NextResponse.json({ message: "Użytkownik utworzony pomyślnie" }, { status: 201 });

    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Wystąpił błąd serwera." }, { status: 500 });
    }
}