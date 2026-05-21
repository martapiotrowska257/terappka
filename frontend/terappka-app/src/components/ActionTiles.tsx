"use client";

import Link from "next/link";

export default function ActionTiles() {
  const tiles = [
    { id: 1, label: "Ćwiczenia na oddychanie", href: "/pacjent/oddychanie" },
    {
      id: 2,
      label: "Nazwij swoje emocje",
      href: "/pacjent/emocje",
    },
    {
      id: 3,
      label: "Pamiętnik",
      href: "/pacjent/pamiętnik",
    },
    { id: 4, label: "Kalendarz", href: "/pacjent/kaledarz" },
    {
      id: 5,
      label: "Afirmacje",
      href: "/afirmacje",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-8">
      {tiles.map((tile) => {
        const tileStyles = `
          flex flex-col items-center justify-center text-center
          bg-white border border-gray-100 rounded-2xl p-4 aspect-square 
          shadow-sm hover:shadow-md hover:border-emerald-500 hover:text-emerald-600 
          transition-all group cursor-pointer
        `;

        const content = (
          <>
            <span className="text-4xl font-black text-gray-200 group-hover:text-emerald-500 transition-colors">
              {tile.id}
            </span>
            <span className="text-sm font-medium text-gray-600 mt-3 block break-words">
              {tile.label}
            </span>
          </>
        );

        if (tile.href) {
          return (
            <Link key={tile.id} href={tile.href} className={tileStyles}>
              {content}
            </Link>
          );
        }
        return (
          <button
            key={tile.id}
            type="button"
            // onClick={tile.onClick}
            className={tileStyles}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
