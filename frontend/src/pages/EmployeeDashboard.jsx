import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Play, 
  Square, 
  Clock, 
  CheckCircle, 
  Activity, 
  Calendar, 
  Bell, 
  Briefcase 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import AIAdvisor from '../components/AIAdvisor';

const EmployeeDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Live Timer State
  const [elapsedTime, setElapsedTime] = useState('0h 0m 0s');

  useEffect(() => {
    fetchUserData();
    // Auto refresh data every 30 seconds
    const intervalId = setInterval(fetchUserData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Timer logic for Active Session
  useEffect(() => {
    let timer;
    if (attendance && attendance.login_time && !attendance.logout_time) {
      timer = setInterval(() => {
        const start = new Date(attendance.login_time).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        
        setElapsedTime(`${h}h ${m}m ${s}s`);
      }, 1000);
    } else {
      setElapsedTime('0h 0m 0s');
    }
    return () => clearInterval(timer);
  }, [attendance]);

  const fetchUserData = async () => {
    try {
      const fetchWrapper = async (endpoint) => {
        try {
          const res = await api.get(endpoint);
          return res.data;
        } catch (err) {
          console.error(`Error loading ${endpoint}:`, err);
          return null;
        }
      };

      const [perfData, attData, tasksData, notifData, repData] = await Promise.all([
        fetchWrapper('performance/'),
        fetchWrapper('attendance/'),
        fetchWrapper('tasks/'),
        fetchWrapper('notifications/'),
        fetchWrapper('reports/?days=7')
      ]);

      if (perfData) setPerformance(perfData);
      
      if (attData && Array.isArray(attData)) {
        const activeSession = attData.find(a => !a.logout_time);
        setAttendance(activeSession);
      }
      
      if (tasksData) setTasks(tasksData);
      if (notifData) setNotifications(notifData);
      if (repData) setReport(repData);
      
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`notifications/${id}/`, { is_read: true });
      fetchUserData();
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleUpdateTaskStatus = async (id, status) => {
    try {
      await api.patch(`tasks/${id}/`, { status });
      fetchUserData();
    } catch (err) {
      console.error("Failed to update task status");
    }
  };

  const handleAttendance = async (action) => {
    try {
      if (action === 'checkout' && attendance) {
        await api.post('attendance/logout/');
      } else if (action === 'checkin') {
        await api.post('attendance/login/');
      }
      fetchUserData();
    } catch (err) {
      alert(err.response?.data?.error || "Attendance error");
    }
  };

  if (loading) return <LoadingSpinner message="Initializing Personal Workspace..." />;

  const activeTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const todayTasks = tasks.filter(t => {
    if (!t.deadline) return false;
    return new Date(t.deadline).toDateString() === new Date().toDateString();
  });
  const utilization = report ? report.efficiency : (performance ? performance.rating : 0);

  return (
    <Layout>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
         <div>
             <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>Employee <span style={{ color: 'var(--primary)' }}>Dashboard</span></h1>
             <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Real-time coordination and personal performance metrics</p>
         </div>
         <div style={{ display: 'flex', gap: '15px' }}>
            <button 
                onClick={() => handleAttendance('checkin')} 
                disabled={!!attendance}
                style={{ 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    border: 'none', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: attendance ? 'rgba(255,255,255,0.05)' : 'var(--success)',
                    color: attendance ? 'var(--text-muted)' : 'white',
                    cursor: attendance ? 'not-allowed' : 'pointer',
                    boxShadow: attendance ? 'none' : '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
            >
                <Play size={18} fill={attendance ? "transparent" : "currentColor"} /> Start Work (Check-in)
            </button>
            <button 
                onClick={() => handleAttendance('checkout')} 
                disabled={!attendance}
                style={{ 
                    padding: '12px 24px', 
                    borderRadius: '12px', 
                    border: 'none', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: !attendance ? 'rgba(255,255,255,0.05)' : 'var(--error)',
                    color: !attendance ? 'var(--text-muted)' : 'white',
                    cursor: !attendance ? 'not-allowed' : 'pointer',
                    boxShadow: !attendance ? 'none' : '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}
            >
                <Square size={18} fill={!attendance ? "transparent" : "currentColor"} /> End Work (Check-out)
            </button>
         </div>
      </header>
      
      <AIAdvisor />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '15px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '15px', color: 'var(--primary)' }}>
                  <Briefcase size={28} />
              </div>
              <div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE TASKS</p>
                  <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>{activeTasksCount}</h3>
              </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '15px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '15px', color: 'var(--success)' }}>
                  <Activity size={28} />
              </div>
              <div>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>UTILIZATION RATING</p>
                  <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '900' }}>{utilization}</h3>
              </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-20px', opacity: 0.05 }}><Clock size={120} /></div>
              <div style={{ padding: '15px', background: attendance ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '15px', color: attendance ? 'var(--success)' : 'var(--error)' }}>
                  <Clock size={28} />
              </div>
              <div style={{ zIndex: 1 }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>{attendance ? 'WORKING SESSION' : 'SYSTEM STATUS'}</p>
                  <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: attendance ? 'var(--success)' : 'var(--error)' }}>
                      {attendance ? elapsedTime : 'Checked Out'}
                  </h3>
              </div>
          </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '30px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Dynamic Graph */}
            <div className="glass-card" style={{ padding: '30px', minHeight: '300px' }}>
                <h3 style={{ marginBottom: '25px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={18} color="var(--primary)" /> 7-Day Performance Output
                </h3>
                {report && report.daily_progress ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={report.daily_progress}>
                            <defs>
                                <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="completed" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorOutput)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '80px' }}>Graph data loading...</p>
                )}
            </div>

            {/* Task Workloads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '25px' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} color="var(--warning)" /> Today's Focus
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {todayTasks.length > 0 ? todayTasks.map(t => (
                            <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', borderLeft: `3px solid var(--warning)` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t.title}</span>
                                    {t.status !== 'completed' && (
                                        <button onClick={() => handleUpdateTaskStatus(t.id, 'completed')} style={{ background: 'transparent', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer' }}>Complete</button>
                                    )}
                                </div>
                            </div>
                        )) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No deadlines strictly for today.</p>}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '25px', maxHeight: '400px', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={18} color="var(--primary)" /> All Pending Tasks
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {tasks.filter(t => t.status !== 'completed').length > 0 ? tasks.filter(t => t.status !== 'completed').map(t => (
                            <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', borderLeft: `3px solid var(--primary)` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t.title}</span>
                                    <button onClick={() => handleUpdateTaskStatus(t.id, 'completed')} style={{ background: 'transparent', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', cursor: 'pointer' }}>Complete</button>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Due: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}</div>
                            </div>
                        )) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>All tasks cleared!</p>}
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}><CheckCircle size={18} color="var(--success)" /> Performance Breakdown</h3>
            {performance ? (
              <div style={{ marginTop: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Efficiency Node</span>
                  <span style={{ color: 'var(--success)', fontWeight: '800' }}>{performance.rating}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '25px' }}>
                  <div style={{ width: `${performance.rating}%`, height: '100%', background: 'linear-gradient(90deg, var(--success), #34d399)', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>COMPLETED</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white' }}>{performance.completed_tasks}</p>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>PENDING</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: '900', color: 'white' }}>{performance.pending_tasks}</p>
                  </div>
                </div>
              </div>
            ) : <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '20px' }}>Awaiting initial performance vector.</p>}
          </div>

          <div className="glass-card" style={{ padding: '30px', flex: 1, maxHeight: '500px', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Bell size={18} color="var(--warning)" /> Active Alerts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {notifications.length > 0 ? notifications.slice(0, 8).map(node => (
                <div 
                  key={node.id} 
                  onClick={() => !node.is_read && handleMarkAsRead(node.id)} 
                  style={{ 
                    fontSize: '0.85rem', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    background: node.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.1)', 
                    cursor: node.is_read ? 'default' : 'pointer', 
                    borderLeft: node.is_read ? '3px solid transparent' : '3px solid var(--primary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: node.is_read ? '500' : '700', color: node.is_read ? 'var(--text-muted)' : 'white' }}>{node.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>{new Date(node.created_at).toLocaleString()}</div>
                </div>
              )) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inbox clear.</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
