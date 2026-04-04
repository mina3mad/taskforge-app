import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { authApi, otpApi } from '../services/api';
import toast from 'react-hot-toast';

type Step = 'register' | 'verify';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<Step>('register');
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    gender: '', role: 'MEMBER',
  });
  const [otp, setOtp] = useState('');
  const [otpCode, setOtpCode] = useState(''); // simulated OTP display
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = 'Required';
    if (!form.lastName) e.lastName = 'Required';
    if (!form.email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    else if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(form.password))
      e.password = 'Min 8 chars, one number and one special char (!@#$%^&*)';
    return e;
  };

  const handleRegister = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setIsLoading(true);
    try {
      const payload: any = {
        email: form.email, password: form.password,
        firstName: form.firstName, lastName: form.lastName,
        role: form.role,
      };
      if (form.gender) payload.gender = form.gender;
      const { data } = await authApi.signUp(payload);
      setOtpCode(data.otp); // display simulated OTP
      toast.success('Account created! Check your OTP below.');
      setStep('verify');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setIsLoading(true);
    try {
      await otpApi.verifyUser({ email: form.email, code: otp });
      toast.success('Account verified! You can now sign in.');
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { data } = await otpApi.resendOtp({ email: form.email, type: 'SignUp' });
      setOtpCode(data);
      toast.success('OTP resent!');
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(108,99,255,0.15), transparent)',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '460px', animation: 'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px',
            background: 'var(--accent)', borderRadius: '14px',
            marginBottom: '16px',
            boxShadow: '0 0 30px var(--accent-glow)',
          }}>
            <Zap size={24} color="#fff" fill="#fff" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800,
            background: 'linear-gradient(135deg, #fff 0%, var(--accent-2) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {step === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '14px', marginTop: '6px' }}>
            {step === 'register' ? 'Join TaskForge today' : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        }}>
          {step === 'register' ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="First Name" placeholder="John"
                  icon={<User size={14} />}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  error={errors.firstName}
                />
                <Input
                  label="Last Name" placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  error={errors.lastName}
                />
              </div>
              <Input
                label="Email" type="email" placeholder="you@company.com"
                icon={<Mail size={14} />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={errors.email}
              />
              <Input
                label="Password" type="password" placeholder="Min 8 chars + number + special"
                icon={<Lock size={14} />}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Select
                  label="Role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  options={[
                    { value: 'MEMBER', label: 'Member' },
                    { value: 'QA', label: 'QA' },
                    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
                    // { value: 'ADMIN', label: 'Admin' },
                  ]}
                />
                <Select
                  label="Gender (optional)"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  options={[
                    { value: '', label: 'Prefer not to say' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                />
              </div>
              <Button type="submit" isLoading={isLoading} size="lg" style={{ width: '100%', marginTop: '8px' }}>
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Simulated OTP display */}
              {otpCode && (
                <div style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color="var(--success)" />
                    <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                      Email Simulated — Your OTP:
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'monospace', fontSize: '28px', fontWeight: 700,
                    letterSpacing: '8px', color: 'var(--text)', textAlign: 'center',
                    padding: '8px 0',
                  }}>
                    {otpCode}
                  </p>
                </div>
              )}

              <Input
                label="6-Digit OTP Code"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontFamily: 'monospace' }}
              />

              <Button type="submit" isLoading={isLoading} size="lg" style={{ width: '100%' }}>
                Verify Account
              </Button>

              <button
                type="button"
                onClick={handleResendOtp}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-3)', fontSize: '13px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '6px', margin: '0 auto',
                }}
              >
                <RefreshCw size={13} /> Resend OTP
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-3)', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-2)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};
