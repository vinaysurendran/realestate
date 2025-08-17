import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Listings from "./pages/Listings.jsx";
import Property from "./pages/Property.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AddProperty from "./pages/AddProperty.jsx";

export default function App() {
  const navigate = useNavigate();
  const logout = () => { localStorage.removeItem("token"); navigate("/"); };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Link to="/">Listings</Link>
        <Link to="/add">Add Property</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <button onClick={logout}>Logout</button>
      </nav>
      <Routes>
        <Route path="/" element={<Listings/>} />
        <Route path="/p/:id" element={<Property/>} />
        <Route path="/add" element={<AddProperty/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
      </Routes>
    </div>
  );
}
