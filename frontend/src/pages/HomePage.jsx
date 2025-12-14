import React from 'react';
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const HomePage = () => {
  return (
    <div className="space-y-24 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Next-Gen Authentication
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-text-main">
          Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Visual Cryptography</span>
        </h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          Issue unforgeable tickets using 2-out-of-2 visual secret sharing. 
          Combine physical and digital shares with OpenCV homography alignment for robust verification.
        </p>
        <div className="flex justify-center gap-4 pt-8">
          <Button to="/buy" size="lg" className="shadow-xl shadow-primary/20">Issue Ticket</Button>
          <Button to="/verify" variant="secondary" size="lg">Verify Ticket</Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card className="space-y-4 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">1</div>
          <h3 className="text-xl font-semibold text-text-main">Generate & Split</h3>
          <p className="text-text-muted text-sm leading-relaxed">
            Create a QR payload with HMAC signature. The system splits it into two visual shares: one for the user, one for the server.
          </p>
        </Card>
        <Card className="space-y-4 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">2</div>
          <h3 className="text-xl font-semibold text-text-main">Auto-Alignment</h3>
          <p className="text-text-muted text-sm leading-relaxed">
            Advanced OpenCV ORB feature matching and homography automatically aligns the user's uploaded share with the server's copy.
          </p>
        </Card>
        <Card className="space-y-4 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">3</div>
          <h3 className="text-xl font-semibold text-text-main">Secure Verification</h3>
          <p className="text-text-muted text-sm leading-relaxed">
            Shares are stacked via XOR. The result is decoded and the digital signature is validated to prevent tampering and replay attacks.
          </p>
        </Card>
      </section>

      {/* Technical Details */}
      <section className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-text-main">How it works</h2>
          <div className="space-y-4">
            {[
              "Payload generation with HMAC-SHA256 signature",
              "2-out-of-2 Visual Cryptography Scheme (VCS) splitting",
              "User receives Share A (PNG image)",
              "Server stores Share B securely",
              "Verification via image upload or camera capture",
              "Real-time homography alignment and XOR stacking"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-text-muted group">
                <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform"></div>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <Card className="relative border-slate-700/50 bg-surface/80 backdrop-blur-xl">
            <div className="space-y-4 font-mono text-sm text-text-muted">
              <div className="flex justify-between border-b border-slate-700/50 pb-3">
                <span>Protocol</span>
                <span className="text-primary">VCS-2-2</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/50 pb-3">
                <span>Encryption</span>
                <span className="text-primary">AES-256</span>
              </div>
              <div className="flex justify-between border-b border-slate-700/50 pb-3">
                <span>Alignment</span>
                <span className="text-primary">ORB + RANSAC</span>
              </div>
              <div className="flex justify-between">
                <span>Signature</span>
                <span className="text-primary">HMAC-SHA256</span>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
