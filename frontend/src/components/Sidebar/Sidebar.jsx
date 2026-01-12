import React from 'react';
import { sidebarData } from './SidebarData';
import SidebarItem from './SidebarItem';
import logo from '../../assets/logo.png'; 

function Sidebar() {
  return (
    <aside className="h-screen w-80 flex-shrink-0 bg-legal-blue-primary p-6 shadow-2xl flex flex-col">
      {/* --- Top Logo Section --- */}
      <div className="flex items-center justify-center pb-6 border-b border-white/20">
        <img 
          src={logo} 
          alt="KannonAI Logo" 
          className="h-10 w-10"
        />
        <span className="ml-3 text-3xl font-bold text-white">
          KannonAI
        </span>
      </div>
      
      {/* --- Navigation Menu --- */}
      <nav className="mt-8 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {sidebarData.map((item, index) => (
            <SidebarItem key={index} item={item} />
          ))}
        </ul>
      </nav>
      
    </aside>
  );
}

export default Sidebar;