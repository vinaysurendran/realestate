import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx"; // NEW: Import Home
import Listings from "./pages/Listings.jsx";
import Property from "./pages/Property.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AddProperty from "./pages/AddProperty.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import EditProperty from "./pages/EditProperty.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* UPDATED: The index route now shows the Home component */}
        <Route index element={<Home />} />
        
        {/* These routes remain the same */}
        <Route path="/buy" element={<Listings listingType="Sale" />} />
        <Route path="/rent" element={<Listings listingType="Rent" />} />
        <Route path="/p/:id" element={<Property />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/add" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/edit-property/:id" element={<ProtectedRoute><EditProperty /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}