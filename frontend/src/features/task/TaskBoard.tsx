import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { api } from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, MoreVertical } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
}

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
type Status = typeof STATUSES[number];

export const TaskBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState<Status | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!projectId || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws/chat"),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/projects/${projectId}/tasks`, (message) => {
          if (message.body) {
            // Task Event received! Invalidate the tasks query to fetch the new state.
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [projectId, user, queryClient]);

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await api.get(`/projects/${projectId}/tasks`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: async (status: Status) => {
      const response = await api.post(`/projects/${projectId}/tasks`, {
        title: newTaskTitle,
        description: '',
        status: status
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setIsCreating(null);
      setNewTaskTitle('');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Status }) => {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  });

  const [showAiPlanner, setShowAiPlanner] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const aiPlanMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await api.post(`/projects/${projectId}/ai/plan`, { prompt });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setShowAiPlanner(false);
      setAiPrompt('');
    }
  });

  if (isLoading) {
    return <div className="text-muted-foreground flex items-center justify-center h-64">Loading tasks...</div>;
  }

  const tasksByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = tasks?.filter((task) => task.status === status) || [];
    return acc;
  }, {} as Record<Status, Task[]>);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'TODO': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'REVIEW': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'DONE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatStatus = (status: Status) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Task Board</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAiPlanner(!showAiPlanner)}
          className="border-primary/50 hover:bg-primary/10 transition-colors"
        >
          ✨ AI Sprint Planner
        </Button>
      </div>

      {showAiPlanner && (
        <div className="mb-6 p-4 bg-muted/30 border border-primary/20 rounded-xl flex items-center gap-4">
          <Input 
            autoFocus
            placeholder="Describe what you want to build this sprint..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={aiPlanMutation.isPending}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && aiPrompt.trim()) {
                aiPlanMutation.mutate(aiPrompt);
              }
            }}
          />
          <Button 
            disabled={aiPlanMutation.isPending || !aiPrompt.trim()}
            onClick={() => aiPlanMutation.mutate(aiPrompt)}
          >
            {aiPlanMutation.isPending ? "Generating Tasks..." : "Generate Sprint"}
          </Button>
        </div>
      )}

      <div className="flex-1 flex overflow-x-auto pb-4 space-x-6">
        {STATUSES.map((status) => (
          <div key={status} className="flex flex-col flex-shrink-0 w-80 bg-muted/30 rounded-xl border border-border">
            <div className="p-4 flex items-center justify-between border-b border-border/50">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(status)}`}>
                  {formatStatus(status)}
                </span>
                <span className="text-muted-foreground text-sm font-medium">
                  {tasksByStatus[status].length}
                </span>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {tasksByStatus[status].map((task) => (
                <div key={task.id} className="bg-card p-4 rounded-lg border border-border shadow-sm group hover:border-primary/50 transition-colors">
                  <h4 className="text-sm font-medium text-foreground mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                  )}
                  {/* Basic move buttons for MVP (Drag and drop could be added later) */}
                  <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {STATUSES.filter(s => s !== status).map(s => (
                      <button 
                        key={s}
                        onClick={() => updateStatusMutation.mutate({ taskId: task.id, status: s })}
                        className="text-[10px] px-2 py-1 bg-muted rounded hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        Move to {formatStatus(s)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {isCreating === status ? (
                <div className="bg-card p-3 rounded-lg border border-primary shadow-sm">
                  <Input
                    autoFocus
                    placeholder="What needs to be done?"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="mb-2 h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskTitle.trim()) {
                        createMutation.mutate(status);
                      } else if (e.key === 'Escape') {
                        setIsCreating(null);
                        setNewTaskTitle('');
                      }
                    }}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" className="h-7 text-xs px-2" onClick={() => createMutation.mutate(status)} disabled={!newTaskTitle.trim()}>Add</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => { setIsCreating(null); setNewTaskTitle(''); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(status)}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground w-full p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
