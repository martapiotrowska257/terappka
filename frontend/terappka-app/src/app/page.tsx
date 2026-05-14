import LoginButton from "../components/LoginButton";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Lewa strona - Napis i wyśrodkowany przycisk (z-10 zapewnia, że jest nad obrazkiem) */}
      <div className="relative z-10 flex w-full lg:w-[50%] flex-col items-center justify-center p-8 lg:p-24 min-h-screen lg:min-h-0">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">
            Witaj w Terappka
          </h1>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>

      {/* Prawa strona - Kontener przycięty do trapezu */}
      {/* Na mobile to zwykły prostokąt, na desktopie (lg) staje się trapezem za pomocą clip-path */}
      <div className="relative w-full h-[300px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-full lg:[clip-path:polygon(60%_0,100%_0,100%_100%,40%_100%)] bg-gray-200">
        {/* Placeholder - usuń go, gdy dodasz obrazek */}
        {/* <p className="absolute inset-0 flex items-center justify-center text-gray-500 text-center px-4 lg:pl-[45%]">
          Miejsce na Twój obrazek <br /> (Trapez)
        </p> */}

        {/* PRZYKŁAD UŻYCIA OBRAZKA */}
        {/* Dzięki 'object-cover' obrazek ładnie wypełni trapez bez zniekształceń */}

        <Image
          src="/images/main_hands.jpg"
          alt="Tło logowania"
          fill
          className="object-cover translate-y-4 translate-x-75"
          priority
        />
      </div>
    </main>
  );
}
