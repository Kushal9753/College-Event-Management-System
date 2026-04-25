import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getUserData } from '../../utils/tokenHandler';

const loginRoutes = {
  admin: '/admin/login',
  faculty: '/faculty/login',
  student: '/login',
};

const DashboardLayout = ({ role }) => {
  const userData = getUserData();

  if (!userData || !userData.token) {
    const loginPath = loginRoutes[role] || '/login';
    return <Navigate to={loginPath} replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar role={role} />
      <main className="flex-1 p-4 md:p-8 overflow-auto h-screen relative z-0">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-10"></div>
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
