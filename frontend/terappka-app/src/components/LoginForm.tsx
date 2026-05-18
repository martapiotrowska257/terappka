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
            firstName: Yup.string().required("Podaj imię"),
            lastName: Yup.string().required("Podaj nazwisko"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password")], "Hasła muszą być identyczne")
                .required("Potwierdź hasło"),
            role: Yup.string().oneOf(["patient", "therapist"]).required("Wybierz rolę"),
        }),
    });

    return (
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
                    className="text-emerald-600 font-medium hover:underline"
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
                initialValues={{ email: "", password: "", firstName: "", lastName: "", confirmPassword: "", role: "patient" }}
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
                                    firstName: values.firstName,
                                    lastName: values.lastName,
                                    role: values.role,
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
                            
                            router.push("/router-roli");
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
                            router.push("/router-roli");
                            router.refresh();
                        }
                    }
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className="flex flex-col gap-4">
                        
                        {/* WYBÓR ROLI (Tylko rejestracja) */}
                        {isRegister && (
                            <div className="mb-2">
                                <label className="text-sm font-medium text-gray-700 block mb-2">Chcę dołączyć jako:</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFieldValue("role", "patient")}
                                        className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                                            values.role === "patient" 
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                                            : "border-gray-200 text-gray-500 hover:border-emerald-200"
                                        }`}
                                    >
                                        🧑‍⚕️ Pacjent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFieldValue("role", "therapist")}
                                        className={`py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                                            values.role === "therapist" 
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                                            : "border-gray-200 text-gray-500 hover:border-emerald-200"
                                        }`}
                                    >
                                        🛋️ Terapeuta
                                    </button>
                                </div>
                            </div>
                        )}

                        {isRegister && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Imię</label>
                                    <Field type="text" name="firstName" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    <ErrorMessage name="firstName" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nazwisko</label>
                                    <Field type="text" name="lastName" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    <ErrorMessage name="lastName" component="div" className="text-xs text-red-500 mt-1" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-medium text-gray-700">E-mail</label>
                            <Field type="email" name="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                            <ErrorMessage name="email" component="div" className="text-xs text-red-500 mt-1" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Hasło</label>
                            <Field type="password" name="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                            <ErrorMessage name="password" component="div" className="text-xs text-red-500 mt-1" />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Potwierdź hasło</label>
                                <Field type="password" name="confirmPassword" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                <ErrorMessage name="confirmPassword" component="div" className="text-xs text-red-500 mt-1" />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 mt-4 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-md font-medium"
                        >
                            {isSubmitting ? "Przetwarzanie..." : (isRegister ? "Utwórz konto" : "Zaloguj się")}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}