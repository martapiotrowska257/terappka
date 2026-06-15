import LoginForm from "../components/utils/LoginForm";
import RandomQuote from "../components/utils/RandomQuote";

export default function Home() {
  return (
    <main className="relative grid flex-1 items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-24 w-full">
        <div className="text-center w-full max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
            Witaj w Terappka
          </h1>
          <RandomQuote />
        </div>
      </div>
      <LoginForm />
    </main>
  );
}
