"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export default function AddAppointmentModal({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) {
    const { data: session } = useSession();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Pobieranie listy pacjentów po otwarciu modalu
    useEffect(() => {
        const fetchPatients = async () => {
            if (!session?.accessToken) return;
            try {
                const res = await fetch(`${process.env.API_URL || 'http://localhost:5000'}/api/users`, {
                    headers: { Authorization: `Bearer ${session.accessToken}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setPatients(data);
                }
            } catch (err) {
                console.error("Błąd pobierania pacjentów:", err);
            }
        };
        fetchPatients();
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            // Łączenie daty i czasu do formatu ISO
            const dateTimeIso = new Date(`${date}T${time}`).toISOString();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`
                },
                body: JSON.stringify({
                    patientId: selectedPatientId,
                    dateTime: dateTimeIso,
                    description: description
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Nie udało się zapisać wizyty");
            }

            onAdded(); // Odśwież kalendarz
            onClose(); // Zamknij modal
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Zaplanuj nową wizytę</h2>
                
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wybierz pacjenta</label>
                        <select 
                            required
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            <option value="" disabled>-- Wybierz pacjenta --</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.first_name} {p.last_name} ({p.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input 
                                type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Godzina</label>
                            <input 
                                type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Uwagi (opcjonalne)</label>
                        <textarea 
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-20"
                            placeholder="Zanotuj informacje o wizycie..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button 
                            type="button" onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            Anuluj
                        </button>
                        <button 
                            type="submit" disabled={isSubmitting}
                            className="px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
                        >
                            {isSubmitting ? "Zapisywanie..." : "Zaplanuj wizytę"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}