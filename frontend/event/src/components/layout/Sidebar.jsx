import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import sidebarConfig from '../../config/sidebarConfig';
import { removeToken } from '../../utils/tokenHandler';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = sidebarConfig[role] || [];
  const basePath = `/${role}`;

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-gray-900 text-gray-300 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        {!collapsed && (
          <h1 className="text-lg font-bold text-white tracking-wide truncate">
            {role.charAt(0).toUpperCase() + role.slice(1)} Panel
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path === '' ? basePath : `${basePath}/${item.path}`}
            end={item.path === ''}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 flex-shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-600/10 hover:text-red-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
