import LoginButton from "../components/LoginButton";
import RandomQuote from "../components/RandomQuote";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 md:p-24">
      <div className="text-center w-full max-w-2xl">
        {/* Główny napis na środku */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
          Witaj w Terappka
        </h1>

        {/* Losowy cytat bezpośrednio pod napisem */}
        <RandomQuote />

        {/* Przycisk logowania pod cytatem */}
        <div className="flex justify-center mt-12">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
