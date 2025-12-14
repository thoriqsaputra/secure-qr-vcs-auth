import { useMemo, useRef, useState } from "react";
import axios from "axios";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE.trim()) ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000`
    : "http://localhost:8000");

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
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-main">Verify Ticket</h1>
        <p className="text-text-muted max-w-xl mx-auto">
          Upload the user's Share A to validate against the server's Share B. The system will perform homography alignment and XOR stacking.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,1.5fr] gap-8 items-start">
        {/* Upload Section */}
        <Card className="h-fit space-y-6 border-slate-700/50 bg-surface/50">
          <div 
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group
              ${verifyFile ? 'border-primary/50 bg-primary/5' : 'border-slate-700 hover:border-primary/50 hover:bg-surface'}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setVerifyFile(e.target.files[0]);
                  setVerifyResult(null);
                  setError("");
                }
              }}
            />
            
            {uploadedPreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img 
                    src={uploadedPreview} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg shadow-lg" 
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="text-white text-sm font-medium">Change Image</span>
                  </div>
                </div>
                <p className="text-sm text-primary font-medium">{verifyFile.name}</p>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-text-main font-medium">Click to upload Share A</p>
                  <p className="text-text-muted text-sm mt-1">PNG, JPG supported</p>
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={submitVerify} 
            className="w-full" 
            disabled={!verifyFile || verifying}
            size="lg"
          >
            {verifying ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : "Verify Ticket"}
          </Button>

          {error && (
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {verifyResult ? (
            <div className="space-y-6 animate-slide-up">
              <Card className={`border-l-4 ${verifyResult.valid ? 'border-l-accent border-accent/20 bg-accent/5' : 'border-l-danger border-danger/20 bg-danger/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${verifyResult.valid ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'}`}>
                    {verifyResult.valid ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${verifyResult.valid ? 'text-accent' : 'text-danger'}`}>
                      {verifyResult.valid ? "Ticket Valid" : "Verification Failed"}
                    </h3>
                    <p className="text-text-muted text-sm">
                      {verifyResult.message}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6">
                {verifyResult.decoded_payload && (
                  <Card className="bg-surface border-slate-700/50">
                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Decoded Ticket Info</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-background border border-slate-800">
                        <p className="text-xs text-text-muted">Name</p>
                        <p className="font-medium text-text-main">{verifyResult.decoded_payload?.name}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-slate-800">
                        <p className="text-xs text-text-muted">Email</p>
                        <p className="font-medium text-text-main">{verifyResult.decoded_payload?.email}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border border-slate-800 col-span-2">
                        <p className="text-xs text-text-muted">Ticket ID</p>
                        <p className="font-mono text-sm text-primary">
                          {verifyResult.decoded_payload?.user_uuid || verifyResult.decoded_payload?.uuid || "N/A"}
                        </p>
                        {/* Debug: Show raw keys if ID is missing */}
                        {(!verifyResult.decoded_payload?.user_uuid && !verifyResult.decoded_payload?.uuid) && (
                          <pre className="text-[10px] text-text-muted mt-1 overflow-hidden">
                            {JSON.stringify(verifyResult.decoded_payload, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </Card>
                )}

                {(verifyResult.debug_image || verifyResult.aligned_share_a) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {verifyResult.debug_image && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-text-muted text-center">Reconstructed QR</p>
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <img 
                            src={`data:image/png;base64,${verifyResult.debug_image}`} 
                            alt="Reconstructed" 
                            className="w-full h-auto rounded"
                          />
                        </div>
                      </div>
                    )}
                    {verifyResult.aligned_share_a && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-text-muted text-center">Aligned Share A</p>
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <img 
                            src={`data:image/png;base64,${verifyResult.aligned_share_a}`} 
                            alt="Aligned" 
                            className="w-full h-auto rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="max-w-xs">
                <h3 className="text-lg font-medium text-text-muted">Ready to Verify</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Upload a ticket share to see the verification results and reconstructed payload here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
