// src/components/LoginForm.tsx
"use client";

import { signIn } from "next-auth/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const Schema = Yup.object().shape({
        email: Yup.string().email("Nieprawidłowy adres e-mail").required("Wymagane"),
        password: Yup.string().min(4, "Min. 4 znaki").required("Wymagane"),
        ...(isRegister && {
            name: Yup.string().required("Podaj imię i nazwisko"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Hasła muszą być identyczne")
                .required("Potwierdź hasło"),
        }),
    });

    return (
        // Usunięto fixed inset-0 i tło modala. Zostawiamy sam biały kontener.
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
            <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">
                {isRegister ? "Załóż konto" : "Zaloguj się"}
            </h2>
            
            <p className="mb-6 text-center text-sm text-gray-500">
                {isRegister ? "Już masz konto? " : "Nie masz konta? "}
                <button
                    type="button"
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setError("");
                    }}
                    className="text-blue-600 font-medium hover:underline"
                >
                    {isRegister ? "Zaloguj się" : "Zarejestruj się"}
                </button>
            </p>

            {error && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            <Formik
                initialValues={{ email: "", password: "", name: "", confirmPassword: "" }}
                validationSchema={Schema}
                onSubmit={async (values, { setSubmitting }) => {
                    setError("");

                    if (isRegister) {
                        try {
                            const res = await fetch("/api/auth/register", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    email: values.email,
                                    password: values.password,
                                    name: values.name,
                                }),
                            });
                            
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || "Błąd rejestracji");

                            const loginRes = await signIn("credentials", {
                                email: values.email,
                                password: values.password,
                                redirect: false,
                            });

                            if (loginRes?.error) throw new Error("Konto utworzone, ale błąd logowania.");
                            
                            // Przekierowanie na stronę główną po sukcesie
                            router.push("/");
                            router.refresh();

                        } catch (err: any) {
                            setError(err.message);
                        }
                    } else {
                        const result = await signIn("credentials", {
                            email: values.email,
                            password: values.password,
                            redirect: false,
                        });

                        if (result?.error) {
                            setError("Nieprawidłowy login lub hasło");
                        } else {
                            // Przekierowanie na stronę główną po zalogowaniu
                            router.push("/");
                            router.refresh();
                        }
                    }
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="flex flex-col gap-4">
                        {isRegister && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Imię i nazwisko</label>
                                <Field type="text" name="name" className="w-full px-4 py-2 border rounded-lg" />
                                <ErrorMessage name="name" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-gray-700">E-mail</label>
                            <Field type="email" name="email" className="w-full px-4 py-2 border rounded-lg" />
                            <ErrorMessage name="email" component="div" className="text-xs text-red-500 mt-1" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Hasło</label>
                            <Field type="password" name="password" className="w-full px-4 py-2 border rounded-lg" />
                            <ErrorMessage name="password" component="div" className="text-xs text-red-500 mt-1" />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Potwierdź hasło</label>
                                <Field type="password" name="confirmPassword" className="w-full px-4 py-2 border rounded-lg" />
                                <ErrorMessage name="confirmPassword" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2 mt-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                        >
                            {isSubmitting ? "Przetwarzanie..." : (isRegister ? "Zarejestruj się" : "Zaloguj się")}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}