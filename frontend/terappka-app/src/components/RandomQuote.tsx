"use client";

import { useState, useEffect } from "react";
import quotes from "@/public/data/quotes.json";

const randomNum = Math.random();

export default function RandomQuote() {
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(
    null,
  );
  const randomIndex = Math.floor(randomNum * quotes.length);
  useEffect(() => {
    setQuote(quotes[randomIndex]);
  }, [randomIndex]);

  if (!quote) return <div className="h-12 mt-12"></div>;

  return (
    <div className="mt-12 max-w-md mx-auto px-3 py-2 backdrop-blur-sm rounded-xl transition-opacity duration-500">
      <p className="text-gray-600 italic text-lg text-center">
        &bdquo;{quote.text}&rdquo;
      </p>
      <p className="translate-x-20">&mdash; {quote.author}</p>
    </div>
  );
}
