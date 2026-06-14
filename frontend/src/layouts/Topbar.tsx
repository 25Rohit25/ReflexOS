import React from 'react';
import { WorkspaceSelector } from '@/features/workspace/WorkspaceSelector';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center">
        <WorkspaceSelector />
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <UserIcon className="h-4 w-4" />
          <span>{user?.username}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
};
