import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userDetails = sessionStorage.getItem('userdetails');
    if (userDetails) {
      try {
        setUser(JSON.parse(userDetails));
      } catch (error) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userdetails');
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0]?.toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <header className="bg-gradient-to-r from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] px-3 py-2 shadow-md sticky top-0 z-50 border-b border-primary-200">
      <div className="max-w-8xl mx-auto flex justify-between items-center">
        {/* Brand */}
        <img
            src="/assets/ramboll.png"
            alt="Ramboll"
            className="h-8 bg-[#fff] w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/project')}
          />
         

        {/* Optional: Center navigation links */}
        {/* <nav className="hidden md:flex gap-6 text-sm font-semibold text-gray-600">
          <Link to="/dashboard" className="hover:text-primary-500">Dashboard</Link>
          <Link to="/projects" className="hover:text-primary-500">Projects</Link>
        </nav> */}

        {/* User */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-white rounded-full px-2 py-1 border border-primary-200 shadow-sm hover:shadow-md transition-all"
            >
              <span className="font-semibold text-primary-700">Hi, {user.name.split(' ')[0]}</span>
              {user.avatar ? (
                <img
                  src={user.avatar.startsWith('/uploads/') ? `http://localhost:4000${user.avatar}` : user.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-primary-300"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-400 text-white flex items-center justify-center text-sm font-bold">
                  {getInitials(user.name)}
                </div>
              )}
              <svg
                className={`w-4 h-4 text-primary-500 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white text-primary-700 border border-primary-200 rounded-xl shadow-xl py-2 z-50 animate-fade-in">
    <Link
      to="/profile"
      className="block px-4 py-2 hover:bg-primary-100 transition-all font-medium"
    >
      View Profile
    </Link>
    <Link
      to="/settings"
      className="block px-4 py-2 hover:bg-primary-100 transition-all font-medium"
    >
      Settings
    </Link>
    <button
      onClick={handleSignOut}
      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 flex items-center gap-2 transition-all font-medium"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
      </svg>
      Sign Out
    </button>
  </div>
)}
          </div>
        )}
      </div>
    </header>
  );
}
