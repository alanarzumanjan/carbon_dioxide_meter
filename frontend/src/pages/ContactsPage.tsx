import { useState, type FormEvent } from "react";
import { apiSendContact } from "../api/client";
import type { ContactsDTO } from "../types/api";

export function ContactsPage() {
  const [form, setForm] = useState<ContactsDTO>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);

    const res = await apiSendContact(form);
    setLoading(false);

    if ("error" in res) {
      setError(res.error);
    } else {
      setStatus(res.message ?? "Message sent!");
      setForm({ name: "", email: "", message: "" });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Contact</h1>
        <p className="text-sm text-slate-400 mb-4">
          Have questions about the project or integration? Send a message.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {status && (
            <div className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-800 rounded-lg px-3 py-2">
              {status}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm">Name</label>
            <input
              type="text"
              required
              minLength={2}
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Message</label>
            <textarea
              required
              minLength={5}
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={4}
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-sm font-medium"
          >
            {loading ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
}
