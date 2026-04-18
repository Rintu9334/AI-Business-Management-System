import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMsg = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('login/', { username, password });
      
      const { access, user } = response.data;
      
      // Store token and user object as requested
      localStorage.setItem('access', access);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Also store individual items for legacy compatibility
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_id', user.id);
      
      // Role-based redirection
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'manager') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'radial-gradient(circle at top right, #1e293b, #0f172a)' }}>
      <div className="glass-card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '2rem', fontWeight: '700' }}>BizOps <span style={{ color: 'var(--primary)' }}>Pro</span></h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>AI-Ready Business Management</p>
        
        {successMsg && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid var(--success)' }}>
            {successMsg}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--error)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid var(--error)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Username</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account? <a href="#" style={{ color: 'var(--primary)' }}>Contact Admin</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
