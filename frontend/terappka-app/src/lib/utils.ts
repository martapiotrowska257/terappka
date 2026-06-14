import { io } from "socket.io-client";

export const getAppointmentsLabel = (count: number) => {
  if (count === 1) return "wizytę";

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return "wizyty";
  }
  return "wizyt";
};

export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export const socket = io(apiUrl, { transports: ["websocket"] });
