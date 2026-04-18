import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Layers, 
  Activity, 
  Clock, 
  TrendingUp,
  BrainCircuit,
  PlusCircle,
  FileText,
  UserPlus,
  Trophy,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'framer-motion';
import AIAdvisor from '../components/AIAdvisor';
import LiveActivityFeed from '../components/LiveActivityFeed';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysFilter, setDaysFilter] = useState(7);
  const [showFeed, setShowFeed] = useState(true);
  const navigate = useNavigate();

  // Unified fallback data resolver
  const fallbackTrendData = [
    { date: 'Day 1', completed: 15, pending: 4 },
    { date: 'Day 2', completed: 25, pending: 8 },
    { date: 'Day 3', completed: 12, pending: 2 },
    { date: 'Day 4', completed: 30, pending: 10 },
    { date: 'Day 5', completed: 18, pending: 5 },
    { date: 'Day 6', completed: 40, pending: 15 },
    { date: 'Day 7', completed: 22, pending: 7 }
  ];
  
  const dbTrendData = data?.trend_data || [];
  const isNoActivity = dbTrendData.length === 0 || dbTrendData.every(d => d.completed === 0 && d.pending === 0);
  const renderData = isNoActivity ? fallbackTrendData : dbTrendData;

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`admin/dashboard/?days=${daysFilter}`);
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard data fetch failed", err);
      setError("Failed to synchronize with backend node. Please refresh.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [daysFilter]);

  useEffect(() => {
    fetchDashboardData(false);
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => fetchDashboardData(true), 5000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading && !data) return <LoadingSpinner message="Assembling executive insights..." />;
  if (error) return (
    <Layout>
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'var(--error)' }}>
        <Activity size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={() => fetchDashboardData()} className="btn-primary" style={{ marginTop: '20px' }}>Retry Connection</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
              Real-time synchronization active. Last updated: {new Date(data?.server_time).toLocaleTimeString()}
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => navigate('/projects')} className="glass-btn btn-action">
              <PlusCircle size={16} /> Create Project
            </button>
            <button onClick={() => navigate('/employees')} className="glass-btn btn-action">
              <UserPlus size={16} /> Add User
            </button>
            <button onClick={() => navigate('/reports')} className="glass-btn btn-action">
              <FileText size={16} /> Generate Report
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {[
            { label: "Total Users", value: data?.total_users, icon: Users, color: "#6366f1", link: '/admin/users' },
            { label: "Active Tasks", value: data?.active_tasks, icon: Activity, color: "#3b82f6", link: '/tasks' },
            { label: "Attendance Rate", value: `${data?.attendance_rate}%`, icon: Clock, color: "#10b981", link: '/attendance' },
            { label: "System Utilization", value: `${data?.system_utilization}%`, icon: Layers, color: "#f59e0b", link: '/reports' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx} 
              variants={itemVariants} 
              whileHover={{ y: -8, boxShadow: `0 15px 30px ${stat.color}33`, borderColor: stat.color }}
              className="glass-card" 
              onClick={() => navigate(stat.link)}
              style={{ padding: '28px', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: `rgba(${parseInt(stat.color.slice(1,3), 16)}, ${parseInt(stat.color.slice(3,5), 16)}, ${parseInt(stat.color.slice(5,7), 16)}, 0.1)`, color: stat.color }}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', margin: '15px 0 5px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <h3 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Chart Component Linked to Backend (Full Width) */}
          <motion.div variants={itemVariants} className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                 <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                   <TrendingUp size={20} color="var(--primary)" /> Production Velocity
                 </h3>
                 <p style={{ margin: '5px 0 0 30px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last 7 days task performance</p>
               </div>
               <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                 <button onClick={() => setDaysFilter(7)} className={`time-filter-btn ${daysFilter === 7 ? 'active' : ''}`}>7D</button>
                 <button onClick={() => setDaysFilter(30)} className={`time-filter-btn ${daysFilter === 30 ? 'active' : ''}`}>30D</button>
               </div>
            </div>
            <div style={{ height: '270px', width: '100%', position: 'relative' }}>
              
              {loading && !data && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(17, 24, 39, 0.7)' }}>
                   <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1rem', animation: 'pulse 2s infinite' }}>Loading analytics...</p>
                </div>
              )}

              {/* Render No Activity Overlay if purely 0 */}
              {isNoActivity && !loading && (
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9, background: 'linear-gradient(to top, rgba(17,24,39,0.95), rgba(17,24,39,0.4))' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--warning)', fontWeight: '600', fontSize: '1rem', letterSpacing: '0.02em', background: 'rgba(245, 158, 11, 0.15)', padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '5px' }}>
                        No live activity running in timeframe.
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Displaying offline template visualization...</span>
                    </div>
                 </div>
              )}

              <ResponsiveContainer width="100%" height="100%" style={{ zIndex: 1 }}>
                <AreaChart data={renderData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} domain={[0, 'auto']} />
                  <Tooltip 
                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: 'var(--text-main)', fontWeight: '600' }}
                  />
                  <Area 
                    type="monotone" 
                    name="Completed Tasks"
                    dataKey="completed" 
                    stroke="var(--primary)" 
                    strokeWidth={4} 
                    fillOpacity={1}
                    fill="url(#colorPrimary)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }}
                  />
                  <Area 
                    type="monotone" 
                    name="Pending Tasks"
                    dataKey="pending" 
                    stroke="var(--warning)" 
                    strokeWidth={4} 
                    fillOpacity={1}
                    fill="url(#colorWarning)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--warning)', boxShadow: '0 0 10px var(--warning)' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: showFeed ? '1fr 1fr' : '1fr', gap: '24px' }}>
            {/* Top Performers */}
            <motion.div variants={itemVariants} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                  <Trophy size={18} color="var(--primary)" /> Top Performers
                </h3>
                <button 
                  onClick={() => setShowFeed(!showFeed)} 
                  className="btn-action" 
                  style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                >
                  {showFeed ? 'Hide Activity Feed' : 'Show Activity Feed'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data?.top_performers?.length > 0 ? data.top_performers.map((p, idx) => (
                  <motion.div 
                    key={p.id} 
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    className="performer-row" 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '0.85rem', fontWeight: '800', color: idx === 0 ? 'var(--primary)' : 'var(--text-muted)' }}>#{idx + 1}</span>
                       <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '700' }}>{p.score}%</span>
                  </motion.div>
                )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data available.</p>}
              </div>
            </motion.div>

            {/* Recent Activity Feed isolated into component */}
            {showFeed && <LiveActivityFeed />}
          </div>

          {/* AI Advisor relocated to absolute bottom per final request */}
          <div style={{ marginTop: '30px' }}>
            <AIAdvisor />
          </div>

        </div>

      </motion.div>

      <style>{`
        .btn-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-action:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .pulse-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .time-filter-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 4px 12px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .time-filter-btn:hover {
          color: white;
        }
        .time-filter-btn.active {
          background: rgba(99, 102, 241, 0.2);
          color: var(--primary);
        }
        .performer-row:hover {
          background: rgba(255,255,255,0.06) !important;
        }
      `}</style>
    </Layout>
  );
};

export default AdminDashboard;
