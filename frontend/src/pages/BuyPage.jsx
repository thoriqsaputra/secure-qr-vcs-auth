import { useState } from "react";
import axios from "axios";

const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

const pill = "px-3 py-1 rounded-full text-xs font-semibold";

const BuyPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [shareA, setShareA] = useState(null);
  const [userUuid, setUserUuid] = useState("");
  const [payload, setPayload] = useState("");
  const [checkInCode, setCheckInCode] = useState("");
  const [codeQr, setCodeQr] = useState(null);
  const [error, setError] = useState("");

  const submitCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await axios.post(`${API_BASE}/api/tickets/create`, {
        name,
        email,
      });
      setShareA(res.data.share_a_base64);
      setUserUuid(res.data.user_uuid);
      setPayload(res.data.original_payload);
      setCheckInCode(res.data.check_in_code);
      setCodeQr(res.data.code_qr_base64);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setCreating(false);
    }
  };

  const downloadShareA = () => {
    if (!shareA) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${shareA}`;
    link.download = `shareA-${checkInCode || userUuid || "ticket"}.png`;
    link.click();
  };

  return (
    <>
      <div className="p-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitCreate}>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-slate-300">Name</span>
              <input
                required
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ariana Neural"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-slate-300">Email</span>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-emerald-500 text-slate-950 font-semibold py-2 shadow-lg shadow-emerald-900/40 disabled:opacity-60"
            >
              {creating ? "Generating..." : "Generate Ticket"}
            </button>
            <p className="text-xs text-slate-400 leading-relaxed">
              Each ticket is encoded as a QR, expanded into two visual shares. Keep <strong>Share B</strong> server-side;
              users only receive <strong>Share A</strong>.
            </p>
            {payload && (
              <div className="flex flex-wrap gap-2">
                <div className={`${pill} bg-emerald-700/40 border border-emerald-500/40`}>
                  Code: {checkInCode}
                </div>
                <div className={`${pill} bg-slate-800 border border-slate-700`}>UUID: {userUuid}</div>
              </div>
            )}
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            {shareA ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-emerald-300">Public Share A (Give to user)</p>
                <img
                  className="w-full rounded-lg bg-white p-4"
                  src={`data:image/png;base64,${shareA}`}
                  alt="Share A"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={downloadShareA}
                    className="flex-1 rounded-lg bg-slate-800 text-slate-100 border border-slate-700 py-2 text-sm font-semibold hover:bg-slate-700"
                  >
                    Download PNG
                  </button>
                </div>
                <div className="text-xs text-slate-400">
                  Check-in code: <span className="font-mono text-emerald-200">{checkInCode}</span>
                  <br />
                  UUID: <span className="font-mono text-slate-300">{userUuid}</span>
                  <br />
                  Payload: <span className="font-mono break-all">{payload}</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Generated ticket will appear here.
              </div>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-4 text-sm text-red-300 bg-red-900/30 border border-red-700/40 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    </>
  );
};

export default BuyPage;
