import LoginButton from "../components/LoginButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          Witaj w TerAppka
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white lg:static lg:h-auto lg:w-auto lg:bg-none">
          <LoginButton />
        </div>
      </div>
      <div className="mt-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">System Rejestracji</h1>
        <p className="text-gray-600 mb-8">Zaloguj się, aby uzyskać dostęp do panelu</p>
      </div>
    </main>
  );
}
