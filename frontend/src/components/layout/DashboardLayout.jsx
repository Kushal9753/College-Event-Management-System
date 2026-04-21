import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getUserData } from '../../utils/tokenHandler';

/**
 * DashboardLayout
 * ---------------
 * Shared layout for all panels (admin / faculty / student).
 * Renders: Sidebar (left) + page content via <Outlet /> (right).
 *
 * The `role` is determined by the URL prefix (e.g. /admin/*, /faculty/*, /student/*).
 * We pass it via a `role` prop from the route definition in App.jsx.
 *
 * Redirects to the role-appropriate login page if not authenticated.
 */

const loginRoutes = {
 admin: '/admin/login',
 faculty: '/faculty/login',
 student: '/login',
};

const DashboardLayout = ({ role }) => {
 const userData = getUserData();

 // If no user is logged in, redirect to the correct login portal
 if (!userData || !userData.token) {
 const loginPath = loginRoutes[role] || '/login';
 return <Navigate to={loginPath} replace />;
 }

 return (
 <div className="flex min-h-screen bg-gray-100 ">
 <Sidebar role={role} />
 <main className="flex-1 p-6 overflow-auto">
 <Outlet />
 </main>
 </div>
 );
};

export default DashboardLayout;
