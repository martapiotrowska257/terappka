"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import io, { Socket } from "socket.io-client";
import api from "@/src/lib/api";
import { Message } from "../../types/messages";

interface ChatProps {
  otherUserId: string;
  otherUserName: string;
}

export default function Chat({ otherUserId, otherUserName }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Funkcja automatycznie przewijająca czat na sam dół
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Inicjalizacja: Pobieranie historii z API
  useEffect(() => {
    const fetchHistory = async () => {
      if (!session?.accessToken || !otherUserId) return;
      try {
        const res = await api.get(`/api/messages/${otherUserId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Błąd pobierania historii wiadomości:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [session, otherUserId]);

  // 2. Obsługa WebSocketów
  useEffect(() => {
    if (!session?.accessToken) return;

    // Połączenie z serwerem Flaska (dostosuj port jeśli jest inny)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    const socket = io(apiUrl, {
      transports: ["websocket"], // Wymuszenie czystych WebSocketów
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // EVENT 1: Użytkownik otwiera czat i się autoryzuje
      socket.emit("authenticate", { token: session.accessToken });
    });

    socket.on("authenticated", (response: { status: string; msg?: string }) => {
      if (response.status === "success") {
        setIsConnected(true);
      } else {
        console.error("Błąd autoryzacji socketu:", response.msg);
      }
    });

    // EVENT 2: Ktoś nam przysłał wiadomość (lub sami wysłaliśmy, w przypadku wielu kart)
    const handleIncomingMessage = (msg: Message) => {
      // Upewniamy się, że wiadomość dotyczy tej konkretnej konwersacji
      if (msg.senderId === otherUserId || msg.receiverId === otherUserId) {
        setMessages((prev) => {
          // Zabezpieczenie przed ewentualnymi duplikatami
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receive_message", handleIncomingMessage);

    // Z backendu dostajemy też "message_sent" z zapisaną w bazie wiadomością
    socket.on("message_sent", handleIncomingMessage);

    // Czyszczenie na odmontowanie komponentu
    return () => {
      socket.disconnect();
    };
  }, [session, otherUserId]);

  // 3. Wysyłanie nowej wiadomości
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || !isConnected) return;

    // Wysyłamy zdarzenie do serwera (socket.py zapisze do bazy i odeśle nam 'message_sent')
    socketRef.current.emit("send_message", {
      token: session?.accessToken,
      receiverId: otherUserId,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center  h-[500px] rounded-xl border border-gray-100">
        <div className="text-emerald-600 font-medium animate-pulse">
          Ładowanie czatu...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Nagłówek czatu */}
      <header className="px-6 py-4 border-b border-gray-100 /50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
            {otherUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-800">{otherUserName}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-red-500"}`}
              ></div>
              <span className="text-xs text-gray-500 font-medium">
                {isConnected ? "Połączono" : "Łączenie..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Główne okno wiadomości */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 /30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-3">💬</span>
            <p>Brak wcześniejszych wiadomości.</p>
            <p className="text-sm">Napisz jako pierwszy!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId !== otherUserId;
            const time = new Date(msg.createdAt).toLocaleTimeString("pl-PL", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                    isMe
                      ? "bg-emerald-500 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span
                    className={`text-[10px] mt-2 block text-right ${isMe ? "text-emerald-100" : "text-gray-400"}`}
                  >
                    {time}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Pole wpisywania */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Wpisz wiadomość..."
            disabled={!isConnected}
            className="flex-1 max-h-32 min-h-[50px] px-4 py-3  border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none text-sm transition-colors disabled:opacity-50"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-6 py-3 h-[50px] bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center shrink-0"
          >
            Wyślij
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Naciśnij Enter aby wysłać, Shift + Enter dla nowej linii.
        </p>
      </div>
    </div>
  );
}
