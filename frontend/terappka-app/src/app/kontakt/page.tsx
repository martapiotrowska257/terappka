import React from "react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Nagłówek strony */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Skontaktuj się z nami
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Jesteśmy tutaj, aby Ci pomóc. Wybierz najwygodniejszą dla Ciebie
            formę kontaktu.
          </p>
        </div>

        {/* Główna siatka Grid: 2 kolumny na większych ekranach */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kwadrat: Lewy górny róg */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[250px]">
            <p className="text-gray-400 italic">Lorem ipsum (Lewy górny)</p>
          </div>

          {/* Kwadrat: Prawy górny róg */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[250px]">
            <p className="text-gray-400 italic">Lorem ipsum (Prawy górny)</p>
          </div>

          {/* Dolny prostokąt: Formularz i dane kontaktowe rozciągnięte na 2 kolumny */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            {/* Wewnętrzna siatka dla sekcji kontaktowej (układ oryginalny z poprzedniej wersji) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Sekcja Informacyjna (Dane Kontaktowe) */}
              <div className="xl:col-span-1 space-y-6">
                {/* Karta: Infolinia */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Infolinia
                    </h3>
                    <p className="text-blue-600 font-medium text-sm">
                      +48 123 456 789
                    </p>
                    <p className="text-xs text-gray-500">Pn-Pt: 8:00 - 18:00</p>
                  </div>
                </div>

                {/* Karta: Email */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg text-green-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Email
                    </h3>
                    <p className="text-green-600 font-medium text-sm">
                      kontakt@terappka.pl
                    </p>
                    <p className="text-xs text-gray-500">
                      Odpowiadamy w ciągu 24h
                    </p>
                  </div>
                </div>

                {/* Karta: Adres */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg text-purple-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Biuro
                    </h3>
                    <p className="text-gray-600 font-medium text-sm">
                      ul. Terapeutyczna 15
                    </p>
                    <p className="text-xs text-gray-500">00-001 Gdańsk</p>
                  </div>
                </div>
              </div>

              {/* Formularz Kontaktowy */}
              <div className="xl:col-span-2 bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Imię i nazwisko
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Twój adres e-mail
                    </label>
                    <input
                      type="email"
                      className="border border-gray-300 p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="jan@przyklad.pl"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Temat
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="W czym możemy pomóc?"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col">
                    <label className="text-xs font-medium text-gray-700 mb-1">
                      Wiadomość
                    </label>
                    <textarea
                      rows={4}
                      className="border border-gray-300 p-2 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Opisz swoją sprawę..."
                    ></textarea>
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white text-sm font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      Wyślij wiadomość
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
