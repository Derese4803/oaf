"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";

const TYPE_BADGES = {
  OFFICIAL: "bg-forest-700/10 text-forest-700",
  MEMO: "bg-blue-100 text-blue-700",
  CIRCULAR: "bg-amber-500/15 text-amber-600",
};

export default function LettersPage() {
  const [letters, setLetters] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("OFFICIAL");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  function load() {
    api
      .getLetters()
      .then(setLetters)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    setIsMounted(true);
    load();
  }, []);

  // Prevent client state execution during SSR / static prerendering
  if (!isMounted) {
    return null;
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.createLetter({ title, content, type, recipient });
      setTitle("");
      setContent("");
      setRecipient("");
      setType("OFFICIAL");
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-wheat-50">
        <Sidebar />
        <div className="flex-1">
          <Navbar title="Letters & Memos" />
          <main className="p-8">
            {error && <p className="text-red-700 mb-4">{error}</p>}

            <form
              onSubmit={handleCreate}
              className="bg-white rounded-xl border border-forest-800/10 p-5 mb-8 max-w-xl"
            >
              <h2 className="font-display text-lg text-forest-950 mb-3">
                Issue letter or memo
              </h2>
              <div className="space-y-3">
                <input
                  className="w-full px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Subject / Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="OFFICIAL">Official Letter</option>
                    <option value="MEMO">Internal Memo</option>
                    <option value="CIRCULAR">Circular Notice</option>
                  </select>
                  <input
                    className="px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                    placeholder="Recipient / Target"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <textarea
                  className="w-full px-3 py-2 rounded-md border border-forest-800/20 focus-ring"
                  placeholder="Letter content details..."
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <button className="mt-4 px-4 py-2 rounded-md bg-forest-800 text-wheat-50 hover:bg-forest-700 focus-ring">
                Issue document
              </button>
            </form>

            <div className="space-y-4">
              {letters.map((l) => (
                <div
                  key={l.id}
                  className="bg-white rounded-xl border border-forest-800/10 p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-base text-forest-950 font-semibold">
                      {l.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        TYPE_BADGES[l.type] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {l.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">
                    {l.content}
                  </p>
                  <div className="text-xs text-slate-500 border-t border-forest-800/5 pt-2 flex justify-between">
                    <span>
                      To: {l.recipient || "All Staff"}
                    </span>
                    <span>
                      Issued: {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                </div>
              ))}
              {letters.length === 0 && (
                <p className="text-slate-600">No letters or memos issued yet.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}