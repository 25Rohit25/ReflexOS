import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/axios';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Folder, Plus } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export const ProjectList: React.FC = () => {
  const { activeWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects', activeWorkspace?.id],
    queryFn: async () => {
      const response = await api.get(`/workspaces/${activeWorkspace?.id}/projects`);
      return response.data;
    },
    enabled: !!activeWorkspace?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/workspaces/${activeWorkspace?.id}/projects`, {
        title: newProjectTitle
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', activeWorkspace?.id] });
      setIsCreating(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
    }
  });

  if (!activeWorkspace) {
    return <div className="text-muted-foreground flex items-center justify-center h-64">Please select a workspace first.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Projects</h2>
          <p className="text-muted-foreground text-sm">Manage your projects in {activeWorkspace.name}</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {isCreating && (
        <div className="bg-card p-6 border border-border rounded-lg shadow-sm space-y-4">
          <h3 className="text-lg font-medium text-foreground">Create New Project</h3>
          <div className="space-y-4">
            <Input
              label="Project Name"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              placeholder="E.g. Website Redesign"
            />
            <Input
              label="Description"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Brief description of the project"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!newProjectTitle.trim()}
                isLoading={createMutation.isPending}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl border border-border"></div>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-xl">
          <Folder className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-lg">No projects found.</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map(project => (
            <Link 
              key={project.id} 
              to={`/projects/${project.id}/tasks`}
              className="group block bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary transform origin-left scale-y-0 group-hover:scale-y-100 transition-transform"></div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary/10 text-primary rounded-lg mr-4">
                  <Folder className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{project.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2">Status: {project.status || 'Active'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
