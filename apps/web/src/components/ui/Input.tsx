import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, type, style, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600 }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-3)', display: 'flex', pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          style={{
            width: '100%',
            padding: icon ? '10px 40px 10px 40px' : '10px 16px',
            paddingRight: isPassword ? '44px' : undefined,
            background: 'var(--bg-2)',
            border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color var(--transition), box-shadow var(--transition)',
            height: '44px',
            ...style,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)';
            e.target.style.boxShadow = error ? 'none' : '0 0 0 3px rgba(91,84,232,0.10)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-3)',
              cursor: 'pointer', display: 'flex', padding: '2px',
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 500 }}>{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600 }}>
        {label}
      </label>
    )}
    <textarea
      style={{
        width: '100%',
        padding: '10px 16px',
        background: 'var(--bg-2)',
        border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        color: 'var(--text)',
        fontSize: '14px',
        outline: 'none',
        resize: 'vertical',
        minHeight: '100px',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--accent)';
        e.target.style.boxShadow = '0 0 0 3px rgba(91,84,232,0.10)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    />
    {error && <p style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 500 }}>{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, style, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 600 }}>
        {label}
      </label>
    )}
    <select
      style={{
        width: '100%',
        padding: '10px 16px',
        background: 'var(--bg-2)',
        border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        color: 'var(--text)',
        fontSize: '14px',
        outline: 'none',
        height: '44px',
        cursor: 'pointer',
        ...style,
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
      onBlur={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'; }}
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: 500 }}>{error}</p>}
  </div>
);
