import { create } from 'zustand';
import type { Project, Task } from '../types';
import { projectsApi, tasksApi } from '../services/api';
import toast from 'react-hot-toast';

interface ProjectsState {
  projects: Project[];
  projectTotal: number;
  currentProject: Project | null;
  tasks: Task[];
  taskTotal: number;
  isLoading: boolean;
  isTasksLoading: boolean;

  // fetchProjects: () => Promise<void>;
  fetchProjects: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: { name: string; description?: string }) => Promise<Project | null>;
  updateProject: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, email: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;

  fetchTasks: (projectId: string, params?: { page?: number; limit?: number; search?: string }) => Promise<void>;
  createTask: (projectId: string, data: { title: string; description?: string; assigneeId?: string }) => Promise<void>;
  updateTask: (projectId: string, taskId: string, data: { title?: string; description?: string }) => Promise<void>;
  updateTaskStatus: (projectId: string, taskId: string, status: string) => Promise<void>;
  assignTask: (projectId: string, taskId: string, assigneeId: string) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
}

/** Unwrap backend responses that may be either the raw entity or { data: entity } */
function unwrap<T>(raw: any): T {
  if (raw && typeof raw === 'object' && 'id' in raw) return raw as T;
  if (raw?.data && typeof raw.data === 'object' && 'id' in raw.data) return raw.data as T;
  return raw as T;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  projectTotal: 0,
  currentProject: null,
  tasks: [],
  taskTotal: 0,
  isLoading: false,
  isTasksLoading: false,

  fetchProjects: async (params) => {
    set({ isLoading: true });
    try {
       const { data } = await projectsApi.findAll(params);
      let projects: Project[];
      let projectTotal: number;
      if (Array.isArray(data)) {
        projects = data;
        projectTotal = data.length;
      } else {
        projects = data.data ?? [];
        projectTotal = data.total ?? projects.length;
      }
      set({ projects, projectTotal });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load projects');
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProject: async (id) => {
    set({ isLoading: true, currentProject: null }); // clear stale data immediately
    try {
      const { data: raw } = await projectsApi.findOne(id);
      set({ currentProject: unwrap<Project>(raw) });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load project');
    } finally {
      set({ isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      const { data: raw } = await projectsApi.create(data);
      const project = unwrap<Project>(raw);
      set((s) => ({ projects: [project, ...s.projects] }));
      toast.success('Project created!');
      return project;
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create project');
      return null;
    }
  },

  updateProject: async (id, data) => {
    try {
      const { data: raw } = await projectsApi.update(id, data);
      const updated = unwrap<Project>(raw);
      set((s) => ({
        projects: s.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: s.currentProject?.id === id ? updated : s.currentProject,
      }));
      toast.success('Project updated!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update project');
    }
  },

  deleteProject: async (id) => {
    try {
      await projectsApi.remove(id);
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
      toast.success('Project deleted');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete project');
    }
  },

  addMember: async (projectId, email) => {
    try {
      await projectsApi.addMember(projectId, email);
      await get().fetchProject(projectId);
      toast.success('Member added!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add member');
    }
  },

  removeMember: async (projectId, userId) => {
    try {
      await projectsApi.removeMember(projectId, userId);
      await get().fetchProject(projectId);
      toast.success('Member removed');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to remove member');
    }
  },

  fetchTasks: async (projectId, params) => {
    set({ isTasksLoading: true });
    try {
      const { data } = await tasksApi.findAll(projectId, params);
      let tasks: Task[];
      let taskTotal: number;
      if (Array.isArray(data)) {
        tasks = data;
        taskTotal = data.length;
      } else {
        // Backend returns { tasks: [...], count: N }
        tasks = data.tasks ?? data.data ?? [];
        taskTotal = data.count ?? data.total ?? data.meta?.total ?? tasks.length;
      }
      set({ tasks, taskTotal });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load tasks');
    } finally {
      set({ isTasksLoading: false });
    }
  },

  createTask: async (projectId, data) => {
    try {
      const { data: raw } = await tasksApi.create(projectId, data);
      const task = unwrap<Task>(raw);
      set((s) => ({
        tasks: [task, ...s.tasks],
        taskTotal: s.taskTotal + 1,
      }));
      toast.success('Task created!');
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create task');
    }
  },

  updateTask: async (projectId, taskId, data) => {
    try {
      const { data: raw } = await tasksApi.update(projectId, taskId, data);
      const updated = unwrap<Task>(raw);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)) }));
      toast.success('Task updated!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update task');
    }
  },

  updateTaskStatus: async (projectId, taskId, status) => {
    try {
      const { data: raw } = await tasksApi.updateStatus(projectId, taskId, status);
      const updated = unwrap<Task>(raw);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)) }));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Cannot perform this status transition');
    }
  },

  assignTask: async (projectId, taskId, assigneeId) => {
    try {
      const { data: raw } = await tasksApi.assignTask(projectId, taskId, assigneeId);
      const updated = unwrap<Task>(raw);
      set((s) => {
        let finalTask = updated;
        if (!finalTask.assignee && assigneeId) {
          const member = s.currentProject?.members.find((m) => m.id === assigneeId) || 
            (s.currentProject?.owner.id === assigneeId ? s.currentProject?.owner : null);
          if (member) {
            finalTask = { ...finalTask, assignee: member };
          }
        }
        return { tasks: s.tasks.map((t) => (t.id === taskId ? finalTask : t)) };
      });
      toast.success('Task assigned!');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to assign task');
    }
  },

  deleteTask: async (projectId, taskId) => {
    try {
      await tasksApi.deleteTask(projectId, taskId);
      set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== taskId),
        taskTotal: Math.max(0, s.taskTotal - 1),
      }));
      toast.success('Task deleted');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete task');
    }
  },
}));