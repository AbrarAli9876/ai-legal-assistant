import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Menu, LogOut, Settings, User } from 'lucide-react'; 

function Navbar({ pageTitle }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // --- 1. State for dynamic user data ---
  const [user, setUser] = useState({ name: 'User', email: 'user@example.com' });
  
  const profileRef = useRef(null);
  const navigate = useNavigate(); 

  // --- 2. Load user from LocalStorage on mount ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to load user data");
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const handleLogout = () => {
    // Clear storage and redirect
    localStorage.removeItem('user');
    navigate('/');
    setIsProfileOpen(false); 
  };

  return (
    <header className="flex h-20 w-full items-center justify-between bg-white px-8 shadow-sm">
      <h1 className="text-2xl font-bold text-legal-text-primary">
        {pageTitle || "Dashboard"}
      </h1>

      <div className="relative" ref={profileRef}>
        
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center focus:outline-none"
        >
          {/* Using a generic user icon or the one from storage if you have it */}
          <div className="h-10 w-10 rounded-full border-2 border-legal-blue-primary bg-gray-100 flex items-center justify-center text-legal-blue-primary">
             <User size={24} />
          </div>
        </button>

        {isProfileOpen && (
          <div 
            className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            role="menu"
          >
            <div className="py-1">
              
              <div className="px-4 py-2 border-b border-gray-200">
                {/* --- 3. Display Dynamic Data --- */}
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user.email}
                </p>
              </div>

              <Link 
                to="/dashboard/settings" 
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings size={16} />
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-100"
                role="menuitem"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;