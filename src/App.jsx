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
import QuickInvestPage from "./pages/QuickInvestPage";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";

const AppContent = () => {
  const location = useLocation();

  // Routes where Footer should NOT show
  const hideFooterRoutes = ['/', '/sign-in', '/sign-up', '/transact/withdraw', '/transact/deposit', '/settings'];
  const hideFloatingBackground = ['/profile/edit', '/settings'];

  const showFooter = !hideFooterRoutes.includes(location.pathname);
  const showFloatingBackground = !hideFloatingBackground.includes(location.pathname);

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
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/transact" element={<Transact />} />
        <Route path="/transact/deposit" element={<Deposit />} />
        <Route path="/transact/withdraw" element={<Withdraw />} />
        <Route path="/invest" element={<Invest />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/invest/product/:id" element={<InvestProductPage />} />
        <Route path="/invest/quick-invest/fast-vegetable/:id" element={<QuickInvestPage />} />
        <Route path="/add" element={<AddInvestmentProduct />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Conditionally render Footer */}
      {showFooter && <Footer page={getPageKey(location.pathname)} />}
      {/* <FloatingBackground /> */}
      {showFloatingBackground && <FloatingBackground />}
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
