import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import sidebarConfig from '../../config/sidebarConfig';
import { removeToken } from '../../utils/tokenHandler';
import { PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const menuItems = sidebarConfig[role] || [];
  const basePath = `/${role}`;

  const handleLogout = () => {
    removeToken();
    const loginRoutes = { admin: '/admin/login', faculty: '/faculty/login', student: '/login' };
    navigate(loginRoutes[role] || '/login');
  };

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col bg-white border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 z-50 ${
        collapsed ? 'w-24' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8 border-b border-gray-50 bg-gray-50/30">
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

      {/* Navigation Links */}
      <nav className="flex-1 py-8 px-5 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path === '' ? basePath : `${basePath}/${item.path}`}
            end={item.path === ''}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgb(37,99,235,0.25)] -translate-y-0.5'
                  : 'text-gray-500 hover:bg-blue-50/80 hover:text-blue-600'
              }`
            }
          >
            {({ isActive }) => {
               const Icon = item.icon;
               return (
               <>
                <div className={`transition-transform duration-300 flex items-center justify-center ${!isActive && 'group-hover:scale-110'} ${collapsed ? 'mx-auto' : ''}`}>
                    <Icon className="w-6 h-6 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {!collapsed && <span className="truncate tracking-wide">{item.label}</span>}
               </>
               );
            }}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-5 border-t border-gray-50 bg-gray-50/30">
        <button
          onClick={handleLogout}
          className={`flex items-center justify-center gap-3 w-full px-4 py-4 rounded-2xl text-sm font-bold text-gray-500 bg-white border border-gray-100 hover:border-red-100 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all duration-300 group`}
        >
          <LogOut className={`w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform ${collapsed ? 'mx-auto' : ''}`} />
          {!collapsed && <span className="tracking-wide text-base">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
