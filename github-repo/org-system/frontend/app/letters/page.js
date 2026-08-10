"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { api } from "../../lib/api";

const STATUS_FLOW = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SIGNED", "SENT", "ARCHIVED"];

export default function LettersPage() {
  const [letters, setLetters] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [direction, setDirection] = useState("OUTGOING");
  const [error, setError] = useState("");

  function load() {
    api.getLetters().then(setLetters).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createLetter({ subject, body, direction });
      setSubject("");
      setBody("");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function advance(letter) {
    const idx = STATUS_FLOW.indexOf(letter.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    try {
      await api.updateLetterStatus(letter.id, next);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Letter Management" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <form onSubmit={handleCreate} className="bg-white rounded-xl border border-forest-800/10 p-5 mb-6 max-w-xl">
              <h2 className="font-display text-lg text-forest-950 mb-3">Create letter</h2>
              <div className="flex gap-2 mb-3">
                <select
                  className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                >
                  <option value="OUTGOING">Outgoing</option>
                  <option value="INCOMING">Incoming</option>
                </select>
                <input
                  className="flex-1 px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <textarea
                className="w-full mb-3 px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                placeholder="Letter body…"
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button className="px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                Create letter
              </button>
            </form>

            <div className="space-y-3">
              {letters.map((l) => (
                <div key={l.id} className="bg-white rounded-xl border border-forest-800/10 p-5 flex justify-between items-start">
                  <div>
                    <p className="text-xs text-slate-600">{l.referenceNo} · {l.direction}</p>
                    <h3 className="font-display text-base text-forest-950">{l.subject}</h3>
                    <p className="text-xs text-slate-600 mt-2">By {l.creator?.fullName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-forest-800/10 text-forest-800 font-medium">
                      {l.status.replace("_", " ")}
                    </span>
                    {l.status !== "ARCHIVED" && (
                      <button
                        onClick={() => advance(l)}
                        className="text-xs px-3 py-1 rounded-md bg-amber-600 text-wheat-50 hover:bg-amber-500 focus-ring"
                      >
                        Move to {STATUS_FLOW[STATUS_FLOW.indexOf(l.status) + 1].replace("_", " ")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {letters.length === 0 && <p className="text-slate-600">No letters yet.</p>}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
