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
      setError("Please upload Share A image first.");
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
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-text-main">Verify Ticket</h1>
        <p className="text-text-muted max-w-2xl mx-auto">
          Upload Share A to validate against the server's Share B. The system performs ArUco detection, rotation alignment, and XOR stacking.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="space-y-6 h-fit">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${verifyFile ? 'border-primary bg-primary/5' : 'border-slate-700 hover:border-slate-600'}
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
                <img
                  src={uploadedPreview}
                  alt="Share A Preview"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <p className="text-sm text-primary">{verifyFile.name}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <svg className="w-12 h-12 mx-auto text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
            {verifying ? "Verifying..." : "Verify Ticket"}
          </Button>

          {error && (
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}
        </Card>

        {/* Results Section */}
        <div>
          {verifyResult ? (
            <div className="space-y-6">
              <Card className={verifyResult.valid ? 'border-l-4 border-l-success' : 'border-l-4 border-l-danger'}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${verifyResult.valid ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
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
                      <h3 className={`text-xl font-bold ${verifyResult.valid ? 'text-success' : 'text-danger'}`}>
                        {verifyResult.valid ? "Valid Ticket" : "Invalid Ticket"}
                      </h3>
                      <p className="text-text-muted text-sm mt-1">{verifyResult.message}</p>
                    </div>
                  </div>

                  {verifyResult.decoded_payload && (
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-text-muted">Name</p>
                          <p className="font-medium text-text-main">{verifyResult.decoded_payload.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">Email</p>
                          <p className="font-medium text-text-main truncate">{verifyResult.decoded_payload.email}</p>
                        </div>
                      </div>
                      {(verifyResult.decoded_payload.user_uuid || verifyResult.decoded_payload.uuid) && (
                        <div>
                          <p className="text-xs text-text-muted">Ticket ID</p>
                          <p className="font-mono text-sm text-primary">
                            {verifyResult.decoded_payload.user_uuid || verifyResult.decoded_payload.uuid}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {(verifyResult.debug_image || verifyResult.aligned_share_a) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {verifyResult.debug_image && (
                    <Card>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-text-main">Reconstructed QR</p>
                        <div className="p-4 bg-white rounded-lg">
                          <img
                            src={`data:image/png;base64,${verifyResult.debug_image}`}
                            alt="Reconstructed QR"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                  {verifyResult.aligned_share_a && (
                    <Card>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-text-main">Aligned Share A</p>
                        <div className="p-4 bg-white rounded-lg">
                          <img
                            src={`data:image/png;base64,${verifyResult.aligned_share_a}`}
                            alt="Aligned Share A"
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center p-12 border-dashed">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-lg bg-surface mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-text-main">Ready to Verify</h3>
                  <p className="text-sm text-text-muted">
                    Upload a Share A image to see verification results.
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

export default VerifyPage;
