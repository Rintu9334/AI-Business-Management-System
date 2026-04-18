import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    current_password: '', 
    new_password: '', 
    confirm_password: '' 
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (formData.new_password !== formData.confirm_password) {
      setStatus({ type: 'error', msg: 'New passwords do not match!' });
      return;
    }

    if (formData.new_password.length < 6) {
      setStatus({ type: 'error', msg: 'New password must be at least 6 characters!' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('auth/change-password/', formData);
      setStatus({ type: 'success', msg: response.data.message || 'Password changed successfully!' });
      
      // Auto-logout after 2 seconds for security
      setTimeout(() => {
        localStorage.clear();
        navigate('/login', { state: { message: 'Password changed. Please log in with your new credentials.' } });
      }, 2000);

    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.error || 'Failed to update password. Please check your current password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
            color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Lock size={30} />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px' }}>
            Update <span style={{ color: 'var(--primary)' }}>Security</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Secure your account by rotating your authentication credentials</p>
        </header>

        {status.msg && (
          <div style={{ 
            padding: '15px', borderRadius: '12px', marginBottom: '30px', 
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: status.type === 'success' ? '#10b981' : '#ef4444',
            display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', fontSize: '0.9rem'
          }}>
            {status.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
            {status.msg}
          </div>
        )}

        <div className="glass-card" style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600' }}>CURRENT PASSWORD</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter current password"
                value={formData.current_password}
                onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                required 
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600' }}>NEW PASSWORD</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Create secure password"
                value={formData.new_password}
                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                required 
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '600' }}>CONFIRM NEW PASSWORD</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Verify new password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                required 
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ marginTop: '10px', padding: '15px', fontSize: '1rem', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Security Update'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChangePassword;
