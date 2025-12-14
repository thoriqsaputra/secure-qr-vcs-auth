import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="p-6 space-y-8">
      <section className="grid gap-6 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Secure QR VCS</p>
          <h2 className="text-3xl md:text-4xl font-black leading-tight">
            Split your tickets into unforgeable visual shares. Align, stack, and verify in seconds.
          </h2>
          <p className="text-sm text-slate-300">
            Issue tickets as 2-out-of-2 visual cryptography shares. Users carry Share A; the server keeps Share B. At
            check-in, we auto-align, stack, and validate signature/expiry—no reusable screenshots.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/buy"
              className="px-4 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-900/40"
            >
              Issue a Ticket
            </Link>
            <Link
              to="/verify"
              className="px-4 py-3 rounded-lg bg-white/10 text-slate-100 border border-white/20 font-semibold hover:bg-white/15"
            >
              Verify a Ticket
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-2xl shadow-emerald-900/30">
          <div className="grid gap-3">
            <div className="rounded-lg bg-slate-900/60 border border-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Pipeline</p>
              <ul className="text-sm text-slate-200 space-y-2 list-disc list-inside">
                <li>Generate QR payload + HMAC signature + expiry</li>
                <li>Split into 2×2 VCS shares; user gets Share A</li>
                <li>Verify: auto-align Share A to Share B (ORB + homography)</li>
                <li>Stack via XOR, downsample, decode, validate, redeem</li>
              </ul>
            </div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-400/30 p-4">
              <p className="text-sm font-semibold text-emerald-200">Why?</p>
              <p className="text-sm text-slate-100">
                Share A alone is useless. Tampering fails signature checks. Expired/redeemed tickets are rejected. Great
                for demos, labs, and event prototypes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
