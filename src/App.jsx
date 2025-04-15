import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Transact from "./pages/Transact";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Invest from "./pages/Invest";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";
import AddInvestmentProduct from "./pages/addinvestment";
import Footer from "./components/component/Footer";
import FloatingBackground from "./components/component/FloatingBackground";
import InvestProductPage from "./pages/InvestProductPage";

const AppContent = () => {
  const location = useLocation();

  // Routes where Footer should NOT show
  const hideFooterRoutes = ['/', '/sign-in', '/sign-up', '/transact/withdraw', '/transact/deposit'];

  const showFooter = !hideFooterRoutes.includes(location.pathname);

  // Define active page key for Footer highlight
  const getPageKey = (path) => {
    if (path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/invest')) return 'invest';
    if (path.startsWith('/transact')) return 'transact';
    if (path.startsWith('/profile')) return 'profile';
    return '';
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/transact" element={<Transact />} />
        <Route path="/transact/deposit" element={<Deposit />} />
        <Route path="/transact/withdraw" element={<Withdraw />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/invest/product/:id" element={<InvestProductPage />} />
        <Route path="/add" element={<AddInvestmentProduct />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Conditionally render Footer */}
      {showFooter && <Footer page={getPageKey(location.pathname)} />}
      <FloatingBackground />
      {/* <FloatingBackground /> */}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
