import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import BuyPage from "./pages/BuyPage";
import VerifyPage from "./pages/VerifyPage";
import HomePage from "./pages/HomePage";

const navLinkClass = (active) =>
  `px-4 py-2 rounded-full text-sm font-semibold transition ${
    active ? "bg-emerald-500 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
  }`;

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Visual Cryptography Scheme</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Secure QR Ticketing Lab</h1>
            <p className="text-sm text-slate-300 mt-1">
              2-out-of-2 secret sharing with automatic OpenCV homography alignment. Generate a ticket, then verify by
              uploading the public share.
            </p>
          </div>
          <nav className="flex gap-2 flex-wrap">
            <Link to="/" className={navLinkClass(pathname === "/")}>
              Home
            </Link>
            <Link to="/buy" className={navLinkClass(pathname === "/buy")}>
              Buy
            </Link>
            <Link to="/verify" className={navLinkClass(pathname === "/verify")}>
              Verify
            </Link>
          </nav>
        </header>
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur shadow-2xl shadow-emerald-900/40">
          {children}
        </div>
        <footer className="mt-8 text-sm text-slate-400">
          OpenCV ORB + Homography aligns the uploaded share against the server copy before stacking via XOR/threshold,
          improving robustness against rotation, skew, and minor scale differences.
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/buy" element={<BuyPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
