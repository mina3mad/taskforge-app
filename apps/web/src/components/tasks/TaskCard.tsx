import React, { useState } from 'react';
import { Trash2, Edit2, User, ChevronDown } from 'lucide-react';
import { StatusBadge, Avatar } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { useProjectsStore } from '../../store/projectsStore';
import { useAuthStore } from '../../store/authStore';
import type { Task, TaskStatus, User as UserType } from '../../types';

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

interface TaskCardProps {
  task: Task;
  projectId: string;
  members: UserType[];
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, projectId, members }) => {
  const { user } = useAuthStore();
  const { updateTask, updateTaskStatus, assignTask, deleteTask } = useProjectsStore();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ title: task.title, description: task.description || '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isPM = user?.role === 'PROJECT_MANAGER';
  const isAssignee = task.assignee?.id === user?.id;
  const isCreator = task.createdBy?.id === user?.id;
  const canManage = isAdmin || isPM;
  const canDelete = canManage;
  const canAssign = canManage;

  const getAllowedStatuses = (): TaskStatus[] => {
    if (isAdmin || isPM) return ALL_STATUSES.filter(s => s !== task.status);
    if (isAssignee || isCreator) return STATUS_TRANSITIONS[task.status] || [];
    return [];
  };

  const allowedStatuses = getAllowedStatuses();

  const handleStatusChange = async (status: TaskStatus) => {
    setShowStatusMenu(false);
    await updateTaskStatus(projectId, task.id, status);
  };

  const handleAssign = async (assigneeId: string) => {
    await assignTask(projectId, task.id, assigneeId);
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
      <div style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '12px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
        cursor: 'default',
        boxShadow: 'var(--shadow-sm)',
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,84,232,0.10)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4, flex: 1, color: 'var(--text)' }}>{task.title}</p>
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            {canManage && (
              <button
                onClick={() => { setForm({ title: task.title, description: task.description || '' }); setEditOpen(true); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '3px', borderRadius: '4px' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(91,84,232,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
              >
                <Edit2 size={12} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '3px', borderRadius: '4px' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {task.description}
          </p>
        )}

        {/* Status */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => allowedStatuses.length > 0 && setShowStatusMenu(!showStatusMenu)}
            style={{ cursor: allowedStatuses.length > 0 ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <StatusBadge status={task.status} size="sm" />
            {allowedStatuses.length > 0 && <ChevronDown size={11} style={{ color: 'var(--text-3)' }} />}
          </div>
          {showStatusMenu && (
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

        {/* Footer: assignee and creator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {task.assignee ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Avatar firstName={task.assignee.firstName} lastName={task.assignee.lastName} size={20} />
                <span style={{ fontSize: '11px', color: 'var(--text-2)', fontWeight: 500 }}>
                  {task.assignee.firstName}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={11} /> Unassigned
              </span>
            )}
            {canAssign && (
              <select
                onChange={(e) => { 
                  if (e.target.value) {
                    handleAssign(e.target.value); 
                    e.target.value = '';
                  }
                }}
                value=""
                style={{
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-2)',
                  fontSize: '11px', cursor: 'pointer', outline: 'none',
                  padding: '2px 6px', fontFamily: 'var(--font-body)',
                }}
              >
                <option value="">Re-assign</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>Created by:</span>
            <Avatar firstName={task.createdBy.firstName} lastName={task.createdBy.lastName} size={18} />
            <span style={{ fontSize: '11px', color: 'var(--text-2)', fontWeight: 500 }}>
              {task.createdBy.firstName}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button isLoading={isLoading} onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
