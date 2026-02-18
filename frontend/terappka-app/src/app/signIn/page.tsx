// src/app/signIn/page.tsx
import LoginForm from "@/src/components/LoginForm";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <LoginForm />
        </div>
    );
}