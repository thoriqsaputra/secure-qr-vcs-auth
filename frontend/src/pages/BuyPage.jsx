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
    link.download = `ticket-${checkInCode || userUuid || "share-a"}.png`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-text-main">Issue Ticket</h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          Generate a secure ticket using Visual Cryptography. The system splits the QR code into two shares.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card className="h-fit">
          <form onSubmit={submitCreate} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={creating}
              size="lg"
            >
              {creating ? "Generating..." : "Generate Ticket"}
            </Button>
          </form>
        </Card>

        {/* Result Section */}
        <div>
          {shareA ? (
            <Card className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text-main">Ticket Generated</h3>
                <p className="text-sm text-text-muted">
                  Share A has been created. Share B is stored on the server.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg">
                <img
                  src={`data:image/png;base64,${shareA}`}
                  alt="Share A"
                  className="w-full h-auto"
                />
              </div>

              <div className="space-y-3">
                {checkInCode && (
                  <div className="p-3 rounded-lg bg-surface border border-white/10">
                    <p className="text-xs text-text-muted mb-1">Ticket Code</p>
                    <p className="font-mono text-sm text-primary">{checkInCode}</p>
                  </div>
                )}

                <Button onClick={downloadShareA} variant="success" className="w-full">
                  Download Share A
                </Button>

                <p className="text-xs text-text-muted text-center">
                  Save this image. You'll need it for verification.
                </p>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 border-dashed">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-lg bg-surface mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-text-main">No Ticket Yet</h3>
                  <p className="text-sm text-text-muted">
                    Fill out the form to generate a secure ticket.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
