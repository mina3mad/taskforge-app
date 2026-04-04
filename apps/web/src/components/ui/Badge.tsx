import React from 'react';
import type { TaskStatus, UserRole } from '../../types';

// Status Badge
const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  BACKLOG:     { label: 'Backlog',     color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  TODO:        { label: 'To Do',       color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
  IN_PROGRESS: { label: 'In Progress', color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
  IN_REVIEW:   { label: 'In Review',   color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  QA:          { label: 'QA',          color: '#06b6d4', bg: 'rgba(6,182,212,0.10)' },
  DONE:        { label: 'Done',        color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
  REOPENED:    { label: 'Reopened',    color: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
};

export const StatusBadge: React.FC<{ status: TaskStatus; size?: 'sm' | 'md' }> = ({
  status, size = 'md',
}) => {
  const cfg = statusConfig[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: '999px',
      fontSize: size === 'sm' ? '11px' : '12px',
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
      letterSpacing: '0.02em',
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
};

// Role Badge
const roleConfig: Record<UserRole, { label: string; color: string }> = {
  ADMIN:           { label: 'Admin',           color: '#ef4444' },
  PROJECT_MANAGER: { label: 'Project Manager', color: '#8b5cf6' },
  MEMBER:          { label: 'Member',          color: '#3b82f6' },
  QA:              { label: 'QA',              color: '#06b6d4' },
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const cfg = roleConfig[role];
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 700,
      color: cfg.color,
      background: `${cfg.color}14`,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {cfg.label}
    </span>
  );
};

// Avatar
function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

const colors = ['#5b54e8', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar: React.FC<{
  firstName: string;
  lastName: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ firstName, lastName, size = 32, style }) => {
  const initials = getInitials(firstName, lastName);
  const bg = getColor(firstName + lastName);

  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: `${bg}18`,
      border: `1.5px solid ${bg}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35,
      fontWeight: 700,
      color: bg,
      flexShrink: 0,
      fontFamily: 'var(--font-display)',
      ...style,
    }}>
      {initials}
    </div>
  );
};

// Spinner
export const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 24, color = 'var(--accent)'
}) => (
  <span style={{
    display: 'inline-block',
    width: size, height: size,
    border: `2px solid ${color}25`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }} />
);

// Empty state
export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }> = ({
  icon, title, description, action
}) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '60px 24px', gap: '12px', color: 'var(--text-3)', textAlign: 'center',
  }}>
    <div style={{ fontSize: '48px', opacity: 0.3, color: 'var(--accent)' }}>{icon}</div>
    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-2)' }}>{title}</h3>
    <p style={{ fontSize: '14px', maxWidth: '320px' }}>{description}</p>
    {action}
  </div>
);

// Card
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }> = ({
  children, style, onClick
}) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      transition: 'border-color var(--transition), box-shadow var(--transition), transform var(--transition)',
      cursor: onClick ? 'pointer' : undefined,
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}
    onMouseEnter={onClick ? (e) => {
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(91,84,232,0.12)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    } : undefined}
    onMouseLeave={onClick ? (e) => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      e.currentTarget.style.transform = 'translateY(0)';
    } : undefined}
  >
    {children}
  </div>
);
