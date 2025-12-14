import { useState } from "react";
import axios from "axios";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

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
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-main">Issue New Ticket</h1>
        <p className="text-text-muted max-w-xl mx-auto">
          Generate a secure visual cryptography share for a new user. The system will split the secret into two shares.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="h-fit border-slate-700/50 bg-surface/50">
          <form onSubmit={submitCreate} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Alice Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="alice@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={creating}
              size="lg"
            >
              {creating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Keys...
                </span>
              ) : "Generate Ticket"}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          {shareA ? (
            <div className="space-y-6 animate-slide-up">
              <Card className="bg-surface border-primary/20 shadow-lg shadow-primary/5">
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-text-main">Ticket Generated Successfully</h3>
                    <p className="text-sm text-text-muted">
                      Share A has been created. Share B is stored securely on the server.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-xl inline-block shadow-inner">
                    <img 
                      src={`data:image/png;base64,${shareA}`} 
                      alt="Share A" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  <div className="space-y-3">
                    <Button onClick={downloadShareA} variant="primary" className="w-full">
                      Download Share A
                    </Button>
                    <p className="text-xs text-text-muted">
                      Please save this image. It is required for verification.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-2xl text-center">
              <div className="space-y-4 max-w-xs">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-text-muted">No Ticket Generated</h3>
                <p className="text-sm text-slate-600">
                  Fill out the form to generate a new secure ticket and visual share.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
