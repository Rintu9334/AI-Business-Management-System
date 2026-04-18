import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Bell, Search, User, Lock, LogOut, CheckCircle } from 'lucide-react';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await api.get('notifications/');
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`notifications/${id}/`, { is_read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => api.patch(`notifications/${n.id}/`, { is_read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Get dynamic user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="navbar" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '15px 30px',
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      
      {/* SEARCH */}
      <div style={{ position: 'relative' }}>
          <input 
            className="search" 
            placeholder="Search dashboard..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: '#111827',
              border: 'none',
              padding: '8px 15px 8px 35px',
              borderRadius: '8px',
              color: 'white',
              outline: 'none',
              width: '250px',
              fontSize: '0.85rem'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
      </div>

      {/* RIGHT SIDE */}
      <div className="right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* BELL */}
        <div style={{ position: 'relative' }}>
          <button 
            className={`premium-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => { setShowDropdown(!showDropdown); setShowProfile(false); }}
          >
            <Bell size={20} className="bell-icon" />
            {unreadCount > 0 && (
              <span className="premium-notification-badge">
                <span className="badge-pulse"></span>
                <span className="badge-text">{unreadCount}</span>
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="glass-card notification-dropdown" style={{ 
              position: 'absolute', top: '40px', right: '0', width: '320px', maxHeight: '420px', 
              overflowY: 'auto', zIndex: 1001, padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              border: '1px solid var(--glass-border)', animation: 'slide-down 0.3s ease-out',
              background: '#111827'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>Recent Alerts</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} style={{ background: 'transparent', color: '#10b981', fontSize: '0.7rem', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Mark All Read</button>
                  )}
                  <button onClick={() => { setShowDropdown(false); navigate('/notifications'); }} style={{ background: 'transparent', color: '#6366f1', fontSize: '0.7rem', border: 'none', cursor: 'pointer', fontWeight: '700' }}>View All</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length > 0 ? notifications.slice(0, 5).map(n => {
                  const typeColors = {
                    info: '#3b82f6',
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444',
                    task: '#6366f1',
                    alert: '#f59e0b',
                    ai: '#a855f7'
                  };
                  const color = typeColors[n.type] || '#3b82f6';
                  return (
                  <div key={n.id} style={{ 
                    padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${color}`,
                    background: n.is_read ? 'rgba(255,255,255,0.02)' : `rgba(${color === '#10b981' ? '16, 185, 129' : color === '#ef4444' ? '239, 68, 68' : color === '#f59e0b' ? '245, 158, 11' : '59, 130, 246'}, 0.1)`,
                    position: 'relative', transition: 'background 0.2s ease'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: n.is_read ? '500' : '800', color: 'white', paddingRight: '20px' }}>{n.message}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString()}</p>
                    {!n.is_read && (
                      <button 
                        onClick={(e) => markAsRead(n.id, e)}
                        title="Mark as read"
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                      >
                         <CheckCircle size={14} />
                      </button>
                    )}
                  </div>
                )}) : <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', padding: '20px 0' }}>No notifications</p>}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => { setShowProfile(!showProfile); setShowDropdown(false); }}
            className="profile" 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div className="avatar" style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: '800',
              color: 'white',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
            }}>
              {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>
              {user?.name || user?.username || "User"}
            </span>
          </div>

          {showProfile && (
            <div className="glass-card profile-dropdown" style={{ 
              position: 'absolute', top: '45px', right: '0', width: '220px', 
              zIndex: 1001, padding: '10px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              border: '1px solid var(--glass-border)', animation: 'slide-down 0.3s ease-out',
              background: '#111827'
            }}>
              <div style={{ padding: '10px', marginBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                 <p style={{ margin: 0, fontWeight: '800', color: 'white', fontSize: '0.85rem' }}>{user?.name || user?.username}</p>
                 <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af' }}>{user?.email}</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', padding: '5px 0' }}>
                <button 
                  onClick={() => { setShowProfile(false); navigate('/profile'); }}
                  className="dropdown-item"
                >
                  <User size={14} /> View Profile
                </button>
                <button 
                  onClick={() => { setShowProfile(false); navigate('/change-password'); }}
                  className="dropdown-item"
                >
                  <Lock size={14} /> Change Password
                </button>
                
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '5px 0' }}></div>
                
                <button 
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                  className="dropdown-item"
                  style={{ color: '#ef4444' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      
      <style>{`
        .premium-bell-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #fbbf24; /* Golden yellowish default */
          opacity: 0.8;
        }
        .premium-bell-btn:hover {
          background: rgba(251, 191, 36, 0.08);
          color: #fcd34d;
          opacity: 1;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(251, 191, 36, 0.15);
        }
        .premium-bell-btn.has-unread {
          border-color: rgba(245, 158, 11, 0.4);
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          opacity: 1;
        }
        .premium-bell-btn.has-unread:hover {
          background: rgba(245, 158, 11, 0.2);
          box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
        }
        .bell-icon {
          transition: transform 0.3s ease;
        }
        .premium-bell-btn:hover .bell-icon {
          transform: scale(1.1) rotate(5deg);
        }
        .premium-notification-badge { 
           position: absolute; 
           top: -4px; 
           right: -4px; 
           width: 18px;
           height: 18px;
           background: linear-gradient(135deg, #ef4444, #f43f5e); 
           color: white; 
           font-size: 10px; 
           border-radius: 50%; 
           font-weight: 800;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 0 2px 8px rgba(239, 68, 68, 0.6);
           z-index: 2;
        }
        .badge-text {
           position: relative;
           z-index: 3;
        }
        .badge-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #ef4444;
          z-index: 1;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: transparent;
          border: none;
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          text-align: left;
          transition: all 0.2s;
        }
        .dropdown-item:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        @keyframes slide-down {
           from { opacity: 0; transform: translateY(-10px); }
           to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
