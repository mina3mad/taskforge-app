import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, LogOut, User,
  ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar, RoleBadge } from '../ui/Badge';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/projects', icon: <FolderKanban size={18} />, label: 'Projects' },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const w = collapsed ? '64px' : '220px';

  return (
    <aside style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: w, minWidth: w, maxWidth: w,
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
      height: '100vh',
      display: 'flex',
    }}>
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          gap: '10px',
          minHeight: '64px',
        }}>
          <div style={{
            width: '32px', height: '32px', flexShrink: 0,
            background: 'var(--accent)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px var(--accent-glow)',
          }}>
            <Zap size={16} color="#fff" fill="#fff" />
          </div>
          {!collapsed && (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: '18px',
              background: 'linear-gradient(135deg, #fff 0%, var(--accent-2) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
            }}>
              TaskForge
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 10px',
                borderRadius: 'var(--radius)',
                color: isActive ? '#fff' : 'var(--text-2)',
                background: isActive ? 'var(--accent)' : 'transparent',
                fontSize: '14px', fontWeight: 500,
                transition: 'all var(--transition)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                boxShadow: isActive ? '0 2px 12px var(--accent-glow)' : 'none',
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                if (!el.className.includes('active')) {
                  el.style.background = 'var(--bg-3)';
                  el.style.color = 'var(--text)';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                if (!el.getAttribute('aria-current')) {
                  el.style.background = '';
                  el.style.color = '';
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        {user && (
          <div style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--border)',
          }}>
            {!collapsed ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 8px',
                borderRadius: 'var(--radius)',
                marginBottom: '4px',
              }}>
                <Avatar firstName={user.firstName} lastName={user.lastName} size={32} />
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.firstName} {user.lastName}
                  </p>
                  <RoleBadge role={user.role} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <Avatar firstName={user.firstName} lastName={user.lastName} size={32} />
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: 'var(--radius)',
                background: 'none', border: 'none',
                color: 'var(--text-3)', fontSize: '13px',
                cursor: 'pointer', transition: 'all var(--transition)',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-3)';
              }}
            >
              <LogOut size={15} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', right: '-12px', top: '32px',
          width: '24px', height: '24px',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-2)',
          transition: 'all var(--transition)',
          zIndex: 101,
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--text)'; e.currentTarget.style.color = 'var(--bg-1)'; e.currentTarget.style.borderColor = 'var(--text)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <main style={{ flex: 1, overflow: 'auto', padding: '32px', maxWidth: '1400px' }}>
      {children}
    </main>
  </div>
);
