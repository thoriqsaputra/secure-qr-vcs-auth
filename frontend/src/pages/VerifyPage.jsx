import { useMemo, useRef, useState } from "react";
import axios from "axios";

const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

const pill = "px-3 py-1 rounded-full text-xs font-semibold";

const VerifyPage = () => {
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const uploadedPreview = useMemo(
    () => (verifyFile ? URL.createObjectURL(verifyFile) : null),
    [verifyFile],
  );

  const submitVerify = async (e) => {
    e.preventDefault();
    if (!verifyFile) {
      setError("Upload or capture Share A first.");
      return;
    }
    setError("");
    setVerifying(true);
    const form = new FormData();
    form.append("file", verifyFile);
    try {
      const res = await axios.post(`${API_BASE}/api/tickets/verify`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVerifyResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      setVerifyResult(null);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <form className="grid gap-4 md:grid-cols-[2fr,1fr]" onSubmit={submitVerify}>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-slate-300">Upload Share A Image</span>
            <input
              required
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setVerifyFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm text-slate-200"
            />
          </label>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={verifying}
            className="w-full h-10 rounded-lg bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-900/40 disabled:opacity-60"
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>

      {verifyResult && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span
              className={`${pill} ${
                verifyResult.valid
                  ? "bg-emerald-600/60 border border-emerald-400/60"
                  : "bg-red-600/50 border border-red-400/60"
              }`}
            >
              {verifyResult.valid ? "Valid Ticket" : "Invalid"}
            </span>
            <span className={`${pill} bg-slate-800 border border-slate-700`}>
              Status: {verifyResult.status || "unknown"}
            </span>
            {verifyResult.original_data && (
              <span className="text-xs text-slate-300">
                Decoded: <span className="font-mono text-emerald-200">{verifyResult.original_data}</span>
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Uploaded/Captured Share A</p>
              {uploadedPreview ? (
                <img src={uploadedPreview} alt="Uploaded" className="w-full rounded-lg bg-white p-3" />
              ) : (
                <Placeholder />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Aligned Share A (Homography)</p>
              {verifyResult.aligned_share_a ? (
                <img
                  src={`data:image/png;base64,${verifyResult.aligned_share_a}`}
                  alt="Aligned share"
                  className="w-full rounded-lg bg-white p-3"
                />
              ) : (
                <Placeholder />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Final Decrypted QR</p>
              {verifyResult.debug_image ? (
                <img
                  src={`data:image/png;base64,${verifyResult.debug_image}`}
                  alt="Decrypted QR"
                  className="w-full rounded-lg bg-white p-3"
                />
              ) : (
                <Placeholder />
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-300 bg-red-900/30 border border-red-700/40 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
};

const Placeholder = () => (
  <div className="w-full aspect-square rounded-lg border border-dashed border-slate-700 bg-slate-800/40 flex items-center justify-center text-slate-500 text-xs">
    No image
  </div>
);

export default VerifyPage;
