import { BrowserRouter, Route, Routes } from "react-router-dom";
import BuyPage from "./pages/BuyPage";
import VerifyPage from "./pages/VerifyPage";
import HomePage from "./pages/HomePage";
import Layout from "./components/Layout";

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
