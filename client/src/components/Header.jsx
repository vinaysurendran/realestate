import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext.jsx';

// A helper for NavLink styling
const navLinkStyles = ({ isActive }) => 
  `pb-1 border-b-2 ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent hover:border-gray-300'}`;

export default function Header() {
  const navigate = useNavigate();
  const { user, logout: contextLogout } = useContext(UserContext);

  const handleLogout = async () => {
    await contextLogout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
            KeralaHomes
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
            <NavLink to="/buy" className={navLinkStyles}>Buy</NavLink>
            <NavLink to="/rent" className={navLinkStyles}>Rent</NavLink>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-4">
                  <NavLink to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-blue-600">My Dashboard</NavLink>
                  <NavLink to="/profile" className="text-sm font-medium text-gray-600 hover:text-blue-600">Profile</NavLink>
                  <button onClick={handleLogout} className="text-sm font-medium text-gray-600 hover:text-blue-600">Logout</button>
                </div>
                <Link to="/add" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors">
                  Post Property
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600">Login</Link>
                <Link to="/register" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
