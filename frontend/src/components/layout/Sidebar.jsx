import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import sidebarConfig from '../../config/sidebarConfig';
import { removeToken } from '../../utils/tokenHandler';
import { PanelLeftClose, PanelLeftOpen, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuItems = sidebarConfig[role] || [];
  const basePath = `/${role}`;

  // Close mobile menu on route change
  useEffect(() => {
    setTimeout(() => {
      setMobileOpen(false);
    }, 0);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    removeToken();
    const loginRoutes = { admin: '/admin/login', faculty: '/faculty/login', student: '/login' };
    navigate(loginRoutes[role] || '/login');
  };

  return (
    <>
      {/* ─── Mobile Top Bar ─── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="text-white font-extrabold text-lg leading-none">{role.charAt(0).toUpperCase()}</span>
          </div>
          <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
            {role.charAt(0).toUpperCase() + role.slice(1)} <span className="text-blue-600">Panel</span>
          </h1>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="w-5 h-5" strokeWidth={2.5} /> : <Menu className="w-5 h-5" strokeWidth={2.5} />}
        </button>
      </div>

      {/* ─── Mobile Overlay ─── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar Panel ─── */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen flex flex-col bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 z-50
          ${collapsed ? 'md:w-24' : 'md:w-72'}
          ${mobileOpen ? 'w-72 translate-x-0' : '-translate-x-full md:translate-x-0 w-72'}
        `}
      >
        {/* Header (hidden on mobile since we have the top bar) */}
        <div className="hidden md:flex items-center justify-between px-6 py-8 border-b border-gray-50 bg-gray-50/30">
          {!collapsed && (
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-[0_4px_12px_rgb(37,99,235,0.3)]">
                  <span className="text-white font-extrabold text-xl leading-none">{role.charAt(0).toUpperCase()}</span>
               </div>
               <h1 className="text-xl font-extrabold text-gray-900 tracking-tight truncate">
                 {role.charAt(0).toUpperCase() + role.slice(1)} <span className="text-blue-600">Panel</span>
               </h1>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2.5 rounded-xl bg-white border border-gray-100 hover:border-blue-200 text-gray-400 hover:text-blue-600 hover:shadow-md transition-all shadow-sm ${collapsed ? 'mx-auto' : ''}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" strokeWidth={2.5} /> : <PanelLeftClose className="w-5 h-5" strokeWidth={2.5} />}
          </button>
        </div>

        {/* Mobile header inside sidebar */}
        <div className="md:hidden flex items-center justify-between px-5 py-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg leading-none">{role.charAt(0).toUpperCase()}</span>
            </div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
              {role.charAt(0).toUpperCase() + role.slice(1)} <span className="text-blue-600">Panel</span>
            </h1>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 md:py-8 px-4 md:px-5 space-y-1.5 md:space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path === '' ? basePath : `${basePath}/${item.path}`}
              end={item.path === ''}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgb(37,99,235,0.25)] -translate-y-0.5'
                    : 'text-gray-500 hover:bg-blue-50/80 hover:text-blue-600 active:bg-blue-100'
                }`
              }
            >
              {({ isActive }) => {
                 const Icon = item.icon;
                 return (
                 <>
                  <div className={`transition-transform duration-300 flex items-center justify-center ${!isActive && 'group-hover:scale-110'} ${collapsed && !mobileOpen ? 'mx-auto' : ''}`}>
                      <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  {(!collapsed || mobileOpen) && <span className="truncate tracking-wide">{item.label}</span>}
                 </>
                 );
              }}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 md:p-5 border-t border-gray-50 bg-gray-50/30">
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-3 w-full px-4 py-3.5 md:py-4 rounded-2xl text-sm font-bold text-gray-500 bg-white border border-gray-100 hover:border-red-100 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all duration-300 group active:scale-[0.97]`}
          >
            <LogOut className={`w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform ${collapsed && !mobileOpen ? 'mx-auto' : ''}`} />
            {(!collapsed || mobileOpen) && <span className="tracking-wide text-base">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
