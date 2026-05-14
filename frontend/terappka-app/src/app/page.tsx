import LoginButton from "../components/LoginButton";
import Image from "next/image";
import RandomQuote from "../components/RandomQuote";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Lewa strona - Zmieniono justify-center na justify-start oraz dodano pt-32 */}
      <div className="relative z-10 flex w-full lg:w-[50%] flex-col items-center justify-start p-8 pt-24 lg:pt-48 lg:p-24 min-h-screen lg:min-h-0">
        <div className="text-center w-full">
          {/* Napis "Terappka" teraz znacznie wyżej */}
          <h1 className="text-5xl font-bold mb-6 text-gray-800">
            Witaj w Terappka
          </h1>

          {/* Cytat pod napisem */}
          <RandomQuote />

          {/* Przycisk logowania pod cytatem */}
          <div className="flex justify-center mt-12">
            <LoginButton />
          </div>
        </div>
      </div>

      {/* Prawa strona - Kontener przycięty do trapezu */}
      <div className="relative w-full h-[300px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-full lg:[clip-path:polygon(55%_0,100%_0,100%_100%,35%_100%)] bg-gray-200">
        <Image
          src="/images/main_hands.jpg"
          alt="Tło logowania"
          fill
          className="object-cover translate-x-75"
          priority
        />
      </div>
    </main>
  );
}
