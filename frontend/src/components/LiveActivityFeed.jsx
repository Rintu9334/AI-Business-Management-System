import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get('notifications/activities/');
      setActivities(res.data);
    } catch (err) {
      console.error("Failed to sync live activities");
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (isoDate) => {
    const diffInSeconds = Math.floor((new Date() - new Date(isoDate)) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return new Date(isoDate).toLocaleDateString();
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'error': return 'var(--error)';
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'task': return 'var(--primary)';
      default: return '#a855f7'; // purple default
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '24px', flex: 1, maxHeight: '420px', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Zap size={18} color="#ec4899" /> Live Activity Feed
      </h3>
      {loading && activities.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Synching events...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {activities.length > 0 ? activities.map(act => (
            <motion.div 
              key={act.id} 
              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '4px' }}
              style={{ position: 'relative', paddingLeft: '22px', transition: 'all 0.2s ease', cursor: 'pointer' }}
            >
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                top: '6px', 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: getActivityColor(act.type), 
                boxShadow: `0 0 12px ${getActivityColor(act.type)}` 
              }}></div>
              <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4, color: 'var(--text-main)', fontWeight: '600' }}>{act.message}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                 <Clock size={12} /> {getRelativeTime(act.timestamp)}
              </div>
            </motion.div>
          )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No live activity streaming.</p>}
        </div>
      )}
    </motion.div>
  );
};

export default LiveActivityFeed;
