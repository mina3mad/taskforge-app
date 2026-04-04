import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { otpApi, authApi } from '../services/api';
import toast from 'react-hot-toast';

type Step = 'email' | 'verify' | 'reset';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) { setErrors({ email: 'Email is required' }); return; }
    setIsLoading(true);
    try {
      const { data } = await otpApi.sendResetPasswordOtp(email);
      setOtpCode(data);
      toast.success('OTP sent!');
      setStep('verify');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (otp.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    setIsLoading(true);
    try {
      await otpApi.checkResetOtp(email, otp);
      toast.success('OTP verified!');
      setStep('reset');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!newPassword) e.newPassword = 'Required';
    else if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/.test(newPassword))
      e.newPassword = 'Min 8 chars, one number and one special char';
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (Object.keys(e).length) { setErrors(e); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = {
    email: { title: 'Forgot Password', sub: 'Enter your email to receive an OTP' },
    verify: { title: 'Verify OTP', sub: `We sent an OTP to ${email}` },
    reset: { title: 'New Password', sub: 'Set your new password' },
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(108,99,255,0.15), transparent)',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s ease' }}>
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
            fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800,
            background: 'linear-gradient(135deg, #fff 0%, var(--accent-2) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {stepTitles[step].title}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: '14px', marginTop: '6px' }}>
            {stepTitles[step].sub}
          </p>
        </div>

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
          {(['email', 'verify', 'reset'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 600,
                background: step === s ? 'var(--accent)' : ((['email', 'verify', 'reset'].indexOf(step) > i) ? 'var(--success)' : 'var(--bg-3)'),
                color: step === s || (['email', 'verify', 'reset'].indexOf(step) > i) ? '#fff' : 'var(--text-3)',
                border: `1px solid ${step === s ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all var(--transition)',
              }}>
                {i + 1}
              </div>
              {i < 2 && <div style={{ flex: 1, height: '1px', background: 'var(--border)', maxWidth: '40px' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        }}>
          {step === 'email' && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input
                label="Email Address" type="email" placeholder="you@company.com"
                icon={<Mail size={14} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Button type="submit" isLoading={isLoading} size="lg" style={{ width: '100%' }}>
                Send OTP
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {otpCode && (
                <div style={{
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 'var(--radius)', padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color="var(--success)" />
                    <span style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 600 }}>
                      Email Simulated — Your OTP:
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'monospace', fontSize: '28px', fontWeight: 700,
                    letterSpacing: '8px', color: 'var(--text)', textAlign: 'center', padding: '8px 0',
                  }}>
                    {otpCode}
                  </p>
                </div>
              )}
              <Input
                label="Enter OTP" placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px', fontFamily: 'monospace' }}
              />
              <Button type="submit" isLoading={isLoading} size="lg" style={{ width: '100%' }}>
                Verify OTP
              </Button>
              <button type="button" onClick={handleSendOtp}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}>
                <RefreshCw size={13} /> Resend OTP
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input
                label="New Password" type="password" placeholder="Min 8 chars + number + special"
                icon={<Lock size={14} />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
              />
              <Input
                label="Confirm Password" type="password" placeholder="Repeat password"
                icon={<Lock size={14} />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />
              <Button type="submit" isLoading={isLoading} size="lg" style={{ width: '100%' }}>
                Reset Password
              </Button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-3)', fontSize: '14px' }}>
          <Link to="/login" style={{ color: 'var(--accent-2)', fontWeight: 500 }}>← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};
