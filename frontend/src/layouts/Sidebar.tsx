import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, MessageSquare, Database, Video } from 'lucide-react';

import { useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const match = location.pathname.match(/\/projects\/([^\/]+)/);
  const projectId = match ? match[1] : null;

  const getPath = (feature: string) => {
    return projectId ? `/projects/${projectId}/${feature}` : `/${feature}`;
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Tasks', icon: CheckSquare, path: getPath('tasks') },
    { name: 'Chat', icon: MessageSquare, path: getPath('chat') },
    { name: 'Knowledge', icon: Database, path: getPath('knowledge') },
    { name: 'Meetings', icon: Video, path: getPath('meetings') },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
          ReflexOS
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
