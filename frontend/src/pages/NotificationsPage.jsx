import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // 5 sec basic real-time refresh
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      // Endpoint changed to match /api/notifications/read/<id>/
      await api.put(`notifications/read/${id}/`);
      // Instant UI update
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      // Endpoint changed to match /api/notifications/delete/<id>/
      await api.delete(`notifications/delete/${id}/`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification");
    }
  };

  return (
    <Layout>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Alerts & <span style={{ color: 'var(--primary)' }}>Updates</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>Stay informed with the latest system activities</p>
      </header>

      {loading && notifications.length === 0 ? <LoadingSpinner message="Checking for alerts..." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.length > 0 ? notifications.map(item => (
            <div 
              key={item.id} 
              className="glass-card" 
              style={{ 
                padding: '20px 25px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: item.is_read ? 'rgba(255,255,255,0.01)' : 'rgba(99, 102, 241, 0.08)',
                borderLeft: item.is_read ? '1px solid var(--glass-border)' : '4px solid var(--primary)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                   {!item.is_read && <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '2px 8px' }}>New</span>}
                   <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>{item.type}</span>
                </div>
                <p style={{ fontWeight: item.is_read ? '400' : '700', fontSize: '1.05rem', color: item.is_read ? 'var(--text-muted)' : 'var(--text)' }}>
                  {item.message}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {!item.is_read && (
                  <button 
                    onClick={() => markAsRead(item.id)} 
                    style={{ background: 'transparent', color: 'var(--primary)', fontWeight: '700', fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}
                  >
                    Mark as Read
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(item.id)} 
                  style={{ background: 'transparent', color: 'var(--danger)', fontWeight: '600', fontSize: '0.8rem', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                >
                  Delete
                </button>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
               <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No new notifications</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default NotificationsPage;
