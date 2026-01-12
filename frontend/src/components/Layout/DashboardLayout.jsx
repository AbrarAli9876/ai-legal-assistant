import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import { sidebarData } from '../Sidebar/SidebarData';

// --- NEW TITLE LOOKUP MAP ---
// This map helps find titles for pages not in the sidebar, like "Settings"
const pageTitleMap = {
  ...Object.fromEntries(sidebarData.map(item => [item.path, item.title])),
  "/dashboard/settings": "Account Settings"
};

function DashboardLayout() {
  const location = useLocation();

  // --- UPDATED TITLE LOGIC ---
  const pageTitle = pageTitleMap[location.pathname] || "Dashboard";

  return (
    <div className="flex h-screen w-full bg-legal-gray-bg">
      {/* Sidebar (Fixed) */}
      <Sidebar />
      
      {/* --- THIS IS THE FIX --- */}
      {/* We wrap the Navbar and Main content in a new div.
        The parent has `flex-1` and `overflow-hidden`.
        The `<main>` tag has `flex-1` and `overflow-y-auto`.
        This forces the `<main>` tag to fill the remaining space and *only* scroll itself.
      */}
      <div className="flex-1 flex flex-col h-screen">
        
        {/* Top Navbar (Fixed Height) */}
        <Navbar pageTitle={pageTitle} />
        
        {/* Page Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-8">
          {/* Outlet renders the active route component */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;