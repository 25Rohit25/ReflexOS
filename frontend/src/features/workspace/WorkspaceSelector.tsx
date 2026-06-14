import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Building, Plus, Check, X } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  description: string;
}

export const WorkspaceSelector: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await api.get('/workspaces');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/workspaces', { name });
      return response.data;
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setActiveWorkspace(newWorkspace);
      setIsCreating(false);
      setNewWorkspaceName('');
    }
  });

  // Automatically select the first workspace if none is active
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspace) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, activeWorkspace, setActiveWorkspace]);

  if (isLoading) {
    return <div className="h-9 w-48 animate-pulse bg-muted rounded-md"></div>;
  }

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      createMutation.mutate(newWorkspaceName.trim());
    }
  };

  if (isCreating) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="text"
          className="bg-accent/50 border border-border text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block w-48 p-2"
          placeholder="Workspace Name"
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
            if (e.key === 'Escape') setIsCreating(false);
          }}
        />
        <button onClick={handleCreate} className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          <Check className="h-4 w-4" />
        </button>
        <button onClick={() => setIsCreating(false)} className="p-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm text-muted-foreground">
          <Building className="h-4 w-4 mr-2" />
          No workspaces
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center text-sm text-primary hover:text-primary/80"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <select
          className="appearance-none bg-accent/50 border border-border text-foreground text-sm rounded-md focus:ring-primary focus:border-primary block w-64 p-2.5 pr-8"
          value={activeWorkspace?.id || ''}
          onChange={(e) => {
            const selected = workspaces.find((w) => w.id === e.target.value);
            if (selected) setActiveWorkspace(selected);
          }}
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      <button 
        onClick={() => setIsCreating(true)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        title="Create Workspace"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
};
