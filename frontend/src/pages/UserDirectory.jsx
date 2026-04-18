import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Mail, Shield, Key, Edit2, Trash2, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'employee',
    email: '',
    id: null
  });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('users/');
      setUsers(response.data);
    } catch (err) {
      showFeedback('Failed to sync directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id && (!formData.email || !formData.password)) {
      alert("Email and Password required");
      return;
    }

    try {
      if (formData.id) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.patch(`users/${formData.id}/`, updateData);
        showFeedback('User profile updated successfully!', 'success');
      } else {
        await api.post('users/', formData);
        showFeedback('New user registered successfully!', 'success');
      }
      setFormData({ username: '', password: '', role: 'employee', email: '', id: null });
      fetchUsers();
    } catch (err) {
      const data = err.response?.data;
      let errorMsg = 'Operation failed. Check inputs.';
      
      if (data) {
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.username) {
          errorMsg = `Username: ${data.username[0]}`;
        } else if (data.email) {
          errorMsg = `Email: ${data.email[0]}`;
        } else if (data.password) {
          errorMsg = `Password: ${data.password[0]}`;
        } else if (data.non_field_errors) {
          errorMsg = data.non_field_errors[0];
        } else if (data.error) {
          errorMsg = data.error;
        } else {
          const firstKey = Object.keys(data)[0];
          if (firstKey && Array.isArray(data[firstKey])) {
            errorMsg = `${firstKey}: ${data[firstKey][0]}`;
          }
        }
      }
      
      showFeedback(errorMsg, 'error');
    }
  };

  const handleEdit = (user) => {
    setFormData({ ...user, password: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await api.delete(`users/${id}/`);
      showFeedback('User removed from system.', 'success');
      fetchUsers();
    } catch (err) {
      showFeedback('Failed to delete user.', 'error');
    }
  };

  return (
    <Layout>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Users size={36} color="var(--primary)" />
            User <span style={{ color: 'var(--primary)' }}>Directory</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage organizational members and access roles</p>
        </motion.div>
      </header>

      {msg.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '30px',
            background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: msg.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            textAlign: 'center',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
          {msg.text}
        </motion.div>
      )}

      {loading ? <LoadingSpinner message="Synchronizing personnel data..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>

          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card" style={{ padding: '30px' }}
          >
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid var(--glass-border)' }}>
               <Users size={20} color="var(--primary)" />
               Active Users
            </h3>
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--glass-border)', textAlign: 'left' }}>
                    <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>USERNAME</th>
                    <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>EMAIL</th>
                    <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ROLE</th>
                    <th style={{ padding: '15px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) && users.length > 0 ? users.filter(u => u.role !== 'admin').map((u, index) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                      style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background-color 0.2s' }}
                    >
                      <td style={{ fontWeight: '600', padding: '15px 10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}>
                           {u.username.charAt(0).toUpperCase()}
                        </div>
                        {u.username}
                      </td>
                      <td style={{ color: 'var(--text-muted)', padding: '15px 10px', fontSize: '0.9rem' }}>{u.email}</td>
                      <td style={{ padding: '15px 10px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-error' : u.role === 'manager' ? 'badge-warning' : 'badge-success'}`} style={{ padding: '6px 12px', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700' }}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '15px 10px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(u)} style={{ color: 'var(--primary)', background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.2)', cursor: 'pointer' }} title="Edit">
                            <Edit2 size={16} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(u.id)} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }} title="Delete">
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No personnel records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card" style={{ padding: '30px', height: 'fit-content' }}
          >
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid var(--glass-border)' }}>
              <UserPlus size={20} color="var(--primary)" />
              {formData.id ? 'Modify User Profile' : 'Register New User'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                  <UserIcon size={14} /> Username
                </label>
                <input className="input-field" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required style={{ width: '100%', padding: '12px 15px' }} />
              </div>
              {!formData.id && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                    <Key size={14} /> Password
                  </label>
                  <input className="input-field" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required style={{ width: '100%', padding: '12px 15px' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                  <Mail size={14} /> Email Address
                </label>
                <input className="input-field" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={{ width: '100%', padding: '12px 15px' }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
                  <Shield size={14} /> Organizational Role
                </label>
                <select className="input-field" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '12px 15px', appearance: 'none', cursor: 'pointer' }}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary" style={{ flex: 1, padding: '14px', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.5px' }}>
                  {formData.id ? 'Apply Update' : 'Register User'}
                </motion.button>
                {formData.id && (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => setFormData({ username: '', password: '', role: 'employee', email: '', id: null })} style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', padding: '14px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Cancel
                  </motion.button>
                )}
              </div>
            </form>
          </motion.section>
        </div>
      )}
    </Layout>
  );
};

export default UserDirectory;
