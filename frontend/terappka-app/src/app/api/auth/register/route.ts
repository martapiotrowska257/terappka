// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Dodaliśmy pole "role" z formularza
        const { email, password, name, role } = await request.json();

        // 1. Pobierz token administratora
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
        if (!tokenResponse.ok) throw new Error("Błąd pobierania tokena admina");
        const adminToken = tokenData.access_token;
        const adminUrl = process.env.KEYCLOAK_ISSUER?.replace("/realms/", "/admin/realms/");

        // 2. Utwórz użytkownika
        const [firstName, ...lastNameParts] = (name || "").split(" ");
        const lastName = lastNameParts.join(" ");

        const createUserResponse = await fetch(`${adminUrl}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                username: email,
                email: email,
                firstName: firstName,
                lastName: lastName,
                enabled: true,
                credentials: [{ type: "password", value: password, temporary: false }],
            }),
        });

        if (!createUserResponse.ok) {
            if (createUserResponse.status === 409) {
                return NextResponse.json({ error: "Użytkownik o takim adresie email już istnieje." }, { status: 409 });
            }
            throw new Error("Nie udało się utworzyć użytkownika.");
        }

        // --- NOWA CZĘŚĆ: PRZYPISYWANIE ROLI ---

        // Mapowanie z frontendu na nazwę roli w Keycloak
        const keycloakRoleName = role === "therapist" ? "therapist" : "user";

        // 3. Pobierz utworzonego użytkownika (aby uzyskać jego ID)
        const usersResponse = await fetch(`${adminUrl}/users?email=${email}&exact=true`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const users = await usersResponse.json();
        const userId = users[0]?.id;

        if (userId) {
            // 4. Pobierz szczegóły roli (aby uzyskać jej ID)
            const roleResponse = await fetch(`${adminUrl}/roles/${keycloakRoleName}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (roleResponse.ok) {
                const roleData = await roleResponse.json();

                // 5. Przypisz rolę do użytkownika
                await fetch(`${adminUrl}/users/${userId}/role-mappings/realm`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${adminToken}`,
                    },
                    body: JSON.stringify([roleData]), // Keycloak wymaga tablicy ról
                });
            } else {
                console.warn(`Nie znaleziono roli ${keycloakRoleName} w Keycloak.`);
            }
        }

        return NextResponse.json({ message: "Użytkownik utworzony pomyślnie" }, { status: 201 });

    } catch (error: any) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: error.message || "Wystąpił błąd serwera." }, { status: 500 });
    }
}