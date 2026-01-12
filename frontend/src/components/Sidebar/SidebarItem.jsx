import React from 'react';
import { NavLink } from 'react-router-dom';

function SidebarItem({ item }) {
  // Destructure the item prop
  const { title, IconComponent, path } = item;

  return (
    <li>
      <NavLink
        to={path}
        // This 'isActive' property is provided by NavLink
        className={({ isActive }) =>
          `flex items-center gap-4 rounded-lg p-4 text-lg font-medium transition-all duration-200
          ${
            isActive
              ? 'bg-white/10 text-white' // Active link style
              : 'text-white/70 hover:bg-white/5 hover:text-white' // Inactive link style
          }`
        }
      >
        {/* Render the icon component that was passed as a prop */}
        <IconComponent size={24} />
        
        {/* Render the title */}
        <span>{title}</span>
      </NavLink>
    </li>
  );
}

export default SidebarItem;