import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <Router>
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

        <Route path="/add" element={<AddInvestmentProduct />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
