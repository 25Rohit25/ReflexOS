import { create } from 'zustand';

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspace: null,
  setActiveWorkspace: (workspace) => {
    localStorage.setItem('active_workspace', JSON.stringify(workspace));
    set({ activeWorkspace: workspace });
  },
  clearWorkspace: () => {
    localStorage.removeItem('active_workspace');
    set({ activeWorkspace: null });
  }
}));

// Function to initialize workspace from local storage on app load
export const initializeWorkspace = () => {
  const workspaceStr = localStorage.getItem('active_workspace');
  if (workspaceStr) {
    try {
      const workspace = JSON.parse(workspaceStr);
      useWorkspaceStore.getState().setActiveWorkspace(workspace);
    } catch (e) {
      localStorage.removeItem('active_workspace');
    }
  }
};
