import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, LogIn, LogOut, UserCircle, Calendar, PlusCircle, Rss, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      onClick={closeMenu}
      className={`flex items-center space-x-2 px-6 py-2.5 transition-colors ${
        location.pathname === to
          ? 'text-indigo-600 bg-white/25'
          : 'text-gray-700 hover:text-indigo-600 hover:bg-white/20'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );

  return (
    <>
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-20" />
      
      {/* Desktop Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white/25 shadow-lg backdrop-blur-sm' : 'bg-white/25 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 px-2">
                <Compass className="h-8 w-8 text-indigo-600" />
                <span className="text-2xl font-bold text-gray-900">HITCH</span>
              </Link>
            </div>
            
            <div className="hidden md:flex md:items-center md:space-x-1">
              {user ? (
                <>
                  <NavLink to="/dashboard" icon={UserCircle}>Dashboard</NavLink>
                  <NavLink to="/feed" icon={Rss}>Feed</NavLink>
                  <NavLink to="/events" icon={Calendar}>Events</NavLink>
                  <NavLink to="/create-event" icon={PlusCircle}>Create Event</NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 ml-1 px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-md"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-md"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-700 hover:text-indigo-600 hover:bg-white/20 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/25 border-t border-gray-200">
              {user ? (
                <>
                  <NavLink to="/dashboard" icon={UserCircle}>Dashboard</NavLink>
                  <NavLink to="/feed" icon={Rss}>Feed</NavLink>
                  <NavLink to="/events" icon={Calendar}>Events</NavLink>
                  <NavLink to="/create-event" icon={PlusCircle}>Create Event</NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-2.5 mt-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-md"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors rounded-md"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      {user && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/25 backdrop-blur-sm border border-gray-200 z-50 shadow-lg">
          <div className="grid grid-cols-4 gap-1 p-2">
            <Link
              to="/dashboard"
              className={`flex flex-col items-center justify-center p-2 ${
                location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <UserCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link
              to="/feed"
              className={`flex flex-col items-center justify-center p-2 ${
                location.pathname === '/feed' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Rss className="h-6 w-6" />
              <span className="text-xs mt-1">Feed</span>
            </Link>
            <Link
              to="/events"
              className={`flex flex-col items-center justify-center p-2 ${
                location.pathname === '/events' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <Calendar className="h-6 w-6" />
              <span className="text-xs mt-1">Events</span>
            </Link>
            <Link
              to="/create-event"
              className={`flex flex-col items-center justify-center p-2 ${
                location.pathname === '/create-event' ? 'text-indigo-600' : 'text-gray-600'
              }`}
            >
              <PlusCircle className="h-6 w-6" />
              <span className="text-xs mt-1">Create</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}