import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Users, UserPlus, UserMinus, LayoutGrid, List,
  Search, ChevronLeft, ChevronRight, ChevronDown, Trash2, Edit2,
} from 'lucide-react';
import { useProjectsStore } from '../store/projectsStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Avatar, Spinner, StatusBadge, RoleBadge, EmptyState } from '../components/ui/Badge';
import { TaskCard } from '../components/tasks/TaskCard';
import type { TaskStatus } from '../types';

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'BACKLOG',     label: 'Backlog',     color: '#9ca3af' },
  { status: 'TODO',        label: 'To Do',       color: '#3b82f6' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#8b5cf6' },
  { status: 'IN_REVIEW',   label: 'In Review',   color: '#f59e0b' },
  { status: 'QA',          label: 'QA',          color: '#06b6d4' },
  { status: 'DONE',        label: 'Done',        color: '#10b981' },
  { status: 'REOPENED',    label: 'Reopened',    color: '#ef4444' },
];

const LIST_LIMIT = 10;
const KANBAN_LIMIT = 200;

const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  BACKLOG:     ['TODO'],
  TODO:        ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW'],
  IN_REVIEW:   ['QA'],
  QA:          ['DONE'],
  DONE:        ['REOPENED'],
  REOPENED:    ['IN_PROGRESS'],
};

const ALL_STATUSES: TaskStatus[] = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'QA', 'DONE', 'REOPENED'];

const TaskListRow: React.FC<{ task: any; projectId: string; isLast: boolean; members: any[] }> = ({ task, projectId, isLast, members }) => {
  const { user } = useAuthStore();
  const { updateTaskStatus, assignTask, updateTask, deleteTask } = useProjectsStore();
  const [showMenu, setShowMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ title: task.title, description: task.description || '' });
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isPM = user?.role === 'PROJECT_MANAGER';
  const isAssignee = task.assignee?.id === user?.id;
  const isCreator = task.createdBy?.id === user?.id;

  const getAllowedStatuses = (): TaskStatus[] => {
    if (isAdmin || isPM) return ALL_STATUSES.filter((s) => s !== task.status);
    if (isAssignee || isCreator) return STATUS_TRANSITIONS[task.status as TaskStatus] || [];
    return [];
  };

  const allowedStatuses = getAllowedStatuses();

  const handleStatusChange = async (status: TaskStatus) => {
    setShowMenu(false);
    await updateTaskStatus(projectId, task.id, status);
  };

  const handleEdit = async () => {
    setIsLoading(true);
    await updateTask(projectId, task.id, { title: form.title, description: form.description });
    setIsLoading(false);
    setEditOpen(false);
  };

  const handleDelete = async () => {
    await deleteTask(projectId, task.id);
  };

  return (
    <>
    <div
      style={{
        display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 140px 60px',
        padding: '14px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        borderBottomLeftRadius: isLast ? 'calc(var(--radius-lg) - 1px)' : 0,
        borderBottomRightRadius: isLast ? 'calc(var(--radius-lg) - 1px)' : 0,
        alignItems: 'center',
        transition: 'background var(--transition)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{task.title}</span>
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => allowedStatuses.length > 0 && setShowMenu(!showMenu)}
          style={{ cursor: allowedStatuses.length > 0 ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <StatusBadge status={task.status} size="sm" />
          {allowedStatuses.length > 0 && <ChevronDown size={11} style={{ color: 'var(--text-3)' }} />}
        </div>
        {showMenu && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, zIndex: 50,
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '4px', marginTop: '4px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            minWidth: '140px',
          }}>
            {allowedStatuses.map((s) => (
              <div
                key={s}
                onClick={() => handleStatusChange(s)}
                style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'background var(--transition)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
              >
                <StatusBadge status={s} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        {(isAdmin || isPM) ? (
          <select
            onChange={(e) => { 
              if (e.target.value) {
                assignTask(projectId, task.id, e.target.value); 
                e.target.value = '';
              }
            }}
            value=""
            style={{
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-2)',
              fontSize: '10px', cursor: 'pointer', outline: 'none',
              padding: '2px 4px', width: '76px', textOverflow: 'ellipsis',
            }}
          >
            <option value="">Re-assign</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
            ))}
          </select>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>-</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', overflow: 'hidden' }}>
        {task.assignee ? (
          <>
            <div style={{ flexShrink: 0 }}>
              <Avatar firstName={task.assignee.firstName} lastName={task.assignee.lastName} size={22} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
              {task.assignee.firstName}
            </span>
          </>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>Unassigned</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Avatar firstName={task.createdBy.firstName} lastName={task.createdBy.lastName} size={22} />
        <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{task.createdBy.firstName}</span>
      </div>
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
        {(isAdmin || isPM) && (
          <>
            <button
              onClick={() => { setForm({ title: task.title, description: task.description || '' }); setEditOpen(true); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(91,84,232,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={handleDelete}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
    <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button isLoading={isLoading} onClick={handleEdit}>Save Changes</Button>
        </div>
      </div>
    </Modal>
    </>
  );
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentProject, tasks, taskTotal, isLoading,
    fetchProject, fetchTasks, createTask, addMember, removeMember,
  } = useProjectsStore();

  const [view, setView] = useState<'kanban' | 'list'>('list');
  const [tab, setTab] = useState<'tasks' | 'members'>('tasks');
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [taskErrors, setTaskErrors] = useState<Record<string, string>>({});

  // Search & pagination
  const [taskSearch, setTaskSearch] = useState('');
  const [taskPage, setTaskPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(taskTotal / LIST_LIMIT));

  // Kanban horizontal scroll
  const kanbanRef = useRef<HTMLDivElement>(null);

  // Re-fetch when page changes (list view)
  useEffect(() => {
    if (!id || view !== 'list') return;
    const timeoutId = setTimeout(() => {
      fetchTasks(id, { page: taskPage, limit: LIST_LIMIT, search: taskSearch });
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [taskPage, view]);

  // Re-fetch when view switches or on initial load
  useEffect(() => {
    if (!id) return;
    fetchProject(id); // Re-fetch project
    if (view === 'kanban') {
      fetchTasks(id, { page: 1, limit: KANBAN_LIMIT, search: taskSearch });
    } else {
      // Don't refetch here since [taskPage, view] effect will handle it
      if (taskPage === 1) {
          fetchTasks(id, { page: 1, limit: LIST_LIMIT, search: taskSearch });
      } else {
          setTaskPage(1);
      }
    }
  }, [view, id]);

  const handleTaskSearch = (val: string) => {
    setTaskSearch(val);
    setTaskPage(1);
    if (id) {
      if (view === 'kanban') {
        fetchTasks(id, { page: 1, limit: KANBAN_LIMIT, search: val });
      } else {
        fetchTasks(id, { page: 1, limit: LIST_LIMIT, search: val });
      }
    }
  };

  const scrollKanban = (dir: 'left' | 'right') => {
    kanbanRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const canManage = user?.role === 'ADMIN' ||
    (user?.role === 'PROJECT_MANAGER' && currentProject?.owner?.id === user?.id);

  const isMember = currentProject?.members?.some((m) => m.id === user?.id) ||
    currentProject?.owner?.id === user?.id || user?.role === 'ADMIN';

  const canCreateTask = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER' || isMember;

  // All project users (owner + members) for assignee dropdown
  const allMembers = currentProject
    ? [
        currentProject.owner,
        ...currentProject.members.filter((m) => m.id !== currentProject.owner.id),
      ]
    : [];

  const handleCreateTask = async () => {
    const e: Record<string, string> = {};
    if (!taskForm.title.trim()) e.title = 'Title is required';
    if (Object.keys(e).length) { setTaskErrors(e); return; }
    setFormLoading(true);
    await createTask(id!, {
      title: taskForm.title,
      description: taskForm.description || undefined,
      assigneeId: taskForm.assigneeId || undefined,
    });
    setFormLoading(false);
    setCreateTaskOpen(false);
    setTaskForm({ title: '', description: '', assigneeId: '' });
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setFormLoading(true);
    await addMember(id!, memberEmail);
    setFormLoading(false);
    setAddMemberOpen(false);
    setMemberEmail('');
  };

  const handleRemoveMember = async (userId: string) => {
    await removeMember(id!, userId);
  };

  const getColumnTasks = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  if (!currentProject) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            gap: '6px', fontSize: '13px', marginBottom: '16px', padding: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          <ArrowLeft size={14} /> Back to Projects
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: '6px', color: 'var(--text)' }}>
              {currentProject.name}
            </h1>
            {currentProject.description && (
              <p style={{ color: 'var(--text-3)', fontSize: '14px', maxWidth: '600px' }}>
                {currentProject.description}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <Avatar firstName={currentProject.owner.firstName} lastName={currentProject.owner.lastName} size={22} />
              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                {currentProject.owner.firstName} {currentProject.owner.lastName}
              </span>
              <span style={{ color: 'var(--border-2)' }}>·</span>
              <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                {currentProject.members.length} member{currentProject.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {canCreateTask && (
              <Button icon={<Plus size={15} />} onClick={() => setCreateTaskOpen(true)} size="sm">
                Add Task
              </Button>
            )}
            {canManage && (
              <Button icon={<UserPlus size={15} />} variant="secondary" onClick={() => setAddMemberOpen(true)} size="sm">
                Add Member
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--border)' }}>
        {[
          { key: 'tasks',   label: 'Tasks',                                   icon: <LayoutGrid size={14} /> },
          { key: 'members', label: `Members (${currentProject.members.length})`, icon: <Users size={14} /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t.key ? 'var(--accent)' : 'transparent'}`,
              color: tab === t.key ? 'var(--accent)' : 'var(--text-3)',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all var(--transition)',
              marginBottom: '-2px',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}

        {tab === 'tasks' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', padding: '4px 0' }}>
            {(['kanban', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  background: view === v ? 'var(--accent)' : 'transparent',
                  border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
                  color: view === v ? '#fff' : 'var(--text-3)',
                  padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontSize: '12px', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '4px',
                  transition: 'all var(--transition)',
                }}
              >
                {v === 'kanban' ? <LayoutGrid size={13} /> : <List size={13} />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <>
          {/* Search toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: '320px', flex: '1 1 200px' }}>
              <Input
                placeholder="Search tasks by status or assignee .."
                icon={<Search size={14} />}
                value={taskSearch}
                onChange={(e) => handleTaskSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
              {taskTotal} task{taskTotal !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Kanban View */}
          {view === 'kanban' ? (
            <div style={{ position: 'relative' }}>
              {/* Scroll buttons */}
              <button
                onClick={() => scrollKanban('left')}
                style={{
                  position: 'absolute', left: '-16px', top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10, width: '32px', height: '32px',
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-2)', boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <ChevronLeft size={16} />
              </button>

              <div
                ref={kanbanRef}
                style={{
                  display: 'flex', gap: '14px',
                  overflowX: 'auto', paddingBottom: '16px',
                  minHeight: '60vh',
                  scrollbarWidth: 'thin',
                  paddingLeft: '8px', paddingRight: '8px',
                }}
              >
                {COLUMNS.map((col) => {
                  const colTasks = getColumnTasks(col.status);
                  return (
                    <div key={col.status} style={{
                      minWidth: '250px', width: '250px', flexShrink: 0,
                      display: 'flex', flexDirection: 'column', gap: '8px',
                    }}>
                      {/* Column header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        borderLeft: `3px solid ${col.color}`,
                        boxShadow: 'var(--shadow-sm)',
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: col.color, letterSpacing: '0.03em' }}>
                          {col.label}
                        </span>
                        <span style={{
                          background: `${col.color}18`,
                          color: col.color,
                          borderRadius: '999px',
                          padding: '1px 8px',
                          fontSize: '11px', fontWeight: 700,
                        }}>
                          {colTasks.length}
                        </span>
                      </div>

                      {/* Tasks */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        {colTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            projectId={id!}
                            members={allMembers}
                          />
                        ))}
                        {colTasks.length === 0 && (
                          <div style={{
                            border: '1.5px dashed var(--border)', borderRadius: 'var(--radius)',
                            padding: '20px', textAlign: 'center',
                            color: 'var(--text-3)', fontSize: '12px',
                            background: 'var(--bg-3)',
                          }}>
                            No tasks
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => scrollKanban('right')}
                style={{
                  position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10, width: '32px', height: '32px',
                  background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-2)', boxShadow: 'var(--shadow-sm)',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            /* List View */
            <div>
              {tasks.length === 0 ? (
                <EmptyState
                  icon={<LayoutGrid />}
                  title="No tasks found"
                  description={taskSearch ? 'Try a different search term' : 'Add a task to get started'}
                  action={canCreateTask ? <Button icon={<Plus size={15} />} onClick={() => setCreateTaskOpen(true)}>Add Task</Button> : undefined}
                />
              ) : (
                <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                  {/* List header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 140px 140px 140px 140px 60px',
                    padding: '10px 20px', borderBottom: '1px solid var(--border)',
                    fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em',
                    background: 'var(--bg-3)',
                    textTransform: 'uppercase',
                    borderTopLeftRadius: 'calc(var(--radius-lg) - 1px)',
                    borderTopRightRadius: 'calc(var(--radius-lg) - 1px)',
                  }}>
                    <span>Title</span>
                    <span>Status</span>
                    <span>Assignment</span>
                    <span>Assignee</span>
                    <span>Created By</span>
                    <span></span>
                  </div>
                  {tasks.slice(0, LIST_LIMIT).map((task, i, arr) => (
                    <TaskListRow key={task.id} task={task} projectId={id!} isLast={i === arr.length - 1} members={allMembers} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {tasks.length > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: '16px', padding: '0 4px',
                }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-3)' }}>
                    Page {taskPage} of {totalPages}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      disabled={taskPage <= 1}
                      onClick={() => setTaskPage((p) => Math.max(1, p - 1))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 14px', borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)', background: 'var(--bg-2)',
                        color: taskPage <= 1 ? 'var(--text-3)' : 'var(--text)',
                        cursor: taskPage <= 1 ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: 500,
                        transition: 'all var(--transition)',
                      }}
                      onMouseEnter={(e) => { if (taskPage > 1) { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'var(--border-2)'; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      disabled={taskPage >= totalPages}
                      onClick={() => setTaskPage((p) => Math.min(totalPages, p + 1))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 14px', borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)', background: 'var(--bg-2)',
                        color: taskPage >= totalPages ? 'var(--text-3)' : 'var(--text)',
                        cursor: taskPage >= totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: 500,
                        transition: 'all var(--transition)',
                      }}
                      onMouseEnter={(e) => { if (taskPage < totalPages) { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'var(--border-2)'; } }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div style={{ maxWidth: '600px' }}>
          {/* Owner */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '12px', textTransform: 'uppercase' }}>
              Owner
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', background: 'var(--bg-2)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <Avatar firstName={currentProject.owner.firstName} lastName={currentProject.owner.lastName} size={36} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>
                  {currentProject.owner.firstName} {currentProject.owner.lastName}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: '12px' }}>{currentProject.owner.email}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <RoleBadge role={currentProject.owner.role} />
              </div>
            </div>
          </div>

          {/* Members */}
          <div>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '12px', textTransform: 'uppercase' }}>
              Members ({currentProject.members.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentProject.members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: 'var(--bg-2)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <Avatar firstName={m.firstName} lastName={m.lastName} size={34} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '14px' }}>{m.firstName} {m.lastName}</p>
                    <p style={{ color: 'var(--text-3)', fontSize: '12px' }}>{m.email}</p>
                  </div>
                  <RoleBadge role={m.role} />
                  {canManage && m.id !== currentProject.owner.id && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
                      title="Remove member"
                    >
                      <UserMinus size={15} />
                    </button>
                  )}
                </div>
              ))}
              {currentProject.members.length === 0 && (
                <p style={{ color: 'var(--text-3)', fontSize: '14px', textAlign: 'center', padding: '32px' }}>
                  No members added yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} title="New Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Title *"
            placeholder="What needs to be done?"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            error={taskErrors.title}
          />
          <Textarea
            label="Description"
            placeholder="More details..."
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
            <div>
              <label style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Assign To
              </label>
              <select
                value={taskForm.assigneeId}
                onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                style={{
                  width: '100%', padding: '10px 16px',
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)', fontSize: '14px',
                  outline: 'none', height: '44px', cursor: 'pointer',
                  transition: 'border-color var(--transition)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
              >
                <option value="">Unassigned</option>
                {allMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setCreateTaskOpen(false)}>Cancel</Button>
            <Button isLoading={formLoading} onClick={handleCreateTask}>Create Task</Button>
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add Member">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Email Address"
            type="email"
            placeholder="member@company.com"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>
            The user must already have a TaskForge account to be added.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
            <Button isLoading={formLoading} onClick={handleAddMember} icon={<UserPlus size={15} />}>
              Add Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
