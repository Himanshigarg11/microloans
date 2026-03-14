import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, User, MessageCircle, LogOut, PlusCircle, Menu, X, TrendingUp, FileText, Repeat, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout, activeRole, setActiveRole } = useAuth();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Shared links visible to all roles
  const sharedLinks = [
    { name: t('dashboard'), path: '/dashboard', icon: <Home className="w-4 h-4" /> },
    { name: t('chat'), path: '/dashboard/chat', icon: <MessageCircle className="w-4 h-4" /> },
    { name: t('profile'), path: '/dashboard/profile', icon: <User className="w-4 h-4" /> },
  ];

  // Role-specific links
  const borrowerLinks = [
    { name: 'My Loans', path: '/dashboard/repayments', icon: <FileText className="w-4 h-4" /> },
  ];

  const lenderLinks = [
    { name: t('loan_marketplace'), path: '/dashboard/marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { name: 'My Investments', path: '/dashboard/investments', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  // Build nav links based on activeRole
  const roleLinks = activeRole === 'lender' ? lenderLinks : borrowerLinks;
  const navLinks = [sharedLinks[0], ...roleLinks, sharedLinks[1], sharedLinks[2]];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchMode = () => {
    const newRole = activeRole === 'lender' ? 'borrower' : 'lender';
    
    // Check if the target role's profile is complete
    if (newRole === 'lender' && !user.lenderProfileComplete) {
      navigate('/complete-lender-profile');
      return;
    }
    if (newRole === 'borrower' && !user.borrowerProfileComplete) {
      navigate('/complete-borrower-profile');
      return;
    }

    setActiveRole(newRole);
    if (newRole === 'lender') {
      navigate('/dashboard/marketplace');
    } else {
      navigate('/dashboard');
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-base font-semibold text-[#174E4F] tracking-tight hover:opacity-80 transition-opacity">
            Lend Sphere
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive ? 'text-[#174E4F]' : 'text-gray-600 hover:text-[#174E4F]'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: User info + actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden lg:flex items-center gap-2 pr-3 border-r border-gray-200">
              <span className="text-xs font-medium text-gray-700">{user.name}</span>
              <span className="text-[10px] bg-teal-50 text-[#174E4F] font-semibold px-1.5 py-0.5 rounded uppercase border border-teal-100">{activeRole}</span>
              <button 
                onClick={handleSwitchMode}
                className="ml-1 p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-[#174E4F] transition-colors"
                title="Switch Mode"
              >
                <Repeat size={14} />
              </button>
            </div>
          )}

          {activeRole === 'borrower' && (
            <Link
              to="/dashboard/create-loan"
              className="hidden md:flex items-center gap-1.5 bg-[#174E4F] hover:bg-[#0f3636] text-white font-medium text-xs px-3 py-1.5 rounded-lg transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Loan
            </Link>
          )}

          <LanguageSwitcher />

          <div className="relative group">
            <button 
              className="p-1.5 text-gray-500 hover:text-[#174E4F] hover:bg-gray-100 rounded-lg transition-all relative"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                if (unreadCount > 0) {
                  markAllRead();
                }
              }}
            >
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1 border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <Bell className="w-5 h-5" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-widest">
                    Notifications
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {notifications.length} total
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 italic">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id || n._id}
                        className={`px-4 py-3 text-xs ${
                          n.isRead ? 'bg-white' : 'bg-teal-50/40'
                        }`}
                      >
                        <p className="font-medium text-gray-800">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={handleLogout}
              className="hidden md:flex text-sm font-medium text-gray-600 hover:text-red-600 items-center gap-1.5 transition-colors px-2 py-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-gray-600 hover:text-[#174E4F] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobile}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-[#174E4F]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#174E4F]'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}

          <button
            onClick={() => { handleSwitchMode(); closeMobile(); }}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full"
          >
            <Repeat className="w-4 h-4" />
            Switch Mode ({activeRole === 'lender' ? 'Borrow' : 'Lend'})
          </button>

          {activeRole === 'borrower' && (
            <Link
              to="/dashboard/create-loan"
              onClick={closeMobile}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium bg-[#174E4F] text-white mt-2"
            >
              <PlusCircle className="w-4 h-4" />
              New Loan
            </Link>
          )}

          {user && (
            <button
              onClick={() => { handleLogout(); closeMobile(); }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full mt-1"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
