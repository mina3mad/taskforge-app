import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  disabled,
  style,
  ...props
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.55 : 1,
    transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.01em',
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '13px', height: '34px' },
    md: { padding: '8px 20px', fontSize: '14px', height: '40px' },
    lg: { padding: '12px 28px', fontSize: '15px', height: '48px' },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 8px rgba(91,84,232,0.25)' },
    secondary: { background: 'var(--bg-3)', color: 'var(--text)', border: '1px solid var(--border)' },
    ghost:     { background: 'transparent', color: 'var(--text-2)' },
    danger:    { background: 'var(--danger)', color: '#fff', boxShadow: '0 2px 8px rgba(239,68,68,0.2)' },
    outline:   { background: 'transparent', color: 'var(--accent)', border: '1.5px solid var(--accent)' },
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          const el = e.currentTarget;
          if (variant === 'primary')   el.style.background = 'var(--accent-2)';
          else if (variant === 'secondary') { el.style.background = 'var(--bg-4)'; el.style.borderColor = 'var(--border-2)'; }
          else if (variant === 'ghost')  el.style.color = 'var(--text)';
          else if (variant === 'outline') el.style.background = 'rgba(91,84,232,0.06)';
          else if (variant === 'danger') el.style.opacity = '0.9';
        }
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        if (variant === 'primary')   el.style.background = 'var(--accent)';
        else if (variant === 'secondary') { el.style.background = 'var(--bg-3)'; el.style.borderColor = 'var(--border)'; }
        else if (variant === 'ghost')  el.style.color = 'var(--text-2)';
        else if (variant === 'outline') el.style.background = 'transparent';
        else if (variant === 'danger') el.style.opacity = '1';
      }}
      {...props}
    >
      {isLoading ? (
        <span style={{
          width: '14px', height: '14px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon}
      {children}
    </button>
  );
};
