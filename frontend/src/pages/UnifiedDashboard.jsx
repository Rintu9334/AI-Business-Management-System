import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import { 
  Users, 
  Layers, 
  Activity, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
import { motion as Motion, AnimatePresence } from 'framer-motion';

const UnifiedDashboard = () => {
  const [data, setData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const statsPromise = api.get('performance/stats/').catch(err => {
        console.error("Stats API failed", err);
        return { data: null };
      });
      const aiPromise = api.get('ai/insights/').catch(err => {
        console.error("AI Insights API failed", err);
        return { data: { suggestions: ["AI model synchronizing..."] } };
      });

      const [statsRes, aiRes] = await Promise.all([statsPromise, aiPromise]);
      
      if (statsRes?.data) {
        setData(statsRes.data);
        setLastRefreshed(new Date(statsRes.data.server_time || new Date()));
      } else if (isInitial) {
        setError("Failed to initialize dashboard statistics.");
      }

      if (aiRes?.data) {
        setAiInsights(aiRes.data);
      }
    } catch (err) {
      console.error("Critical Dashboard sync failure", err);
      setError("Synchronizing error: Connection to neural core lost.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
    // Real-time auto-refresh every 30 seconds
    const interval = setInterval(() => fetchDashboardData(), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  const renderMetric = (metric, idx) => {
    const Icon = { Users, Layers, Activity, Clock, Briefcase, CheckCircle2 }[metric.icon] || Activity;
    const isPositive = metric.trend === 'up';
    const isNegative = metric.trend === 'down';

    return (
      <Motion.div key={idx} variants={itemVariants} className="glass-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="stat-card-icon" style={{ 
            background: isPositive ? 'rgba(16, 185, 129, 0.1)' : (isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'),
            color: isPositive ? 'var(--success)' : (isNegative ? 'var(--error)' : 'var(--primary)')
          }}>
            <Icon size={24} />
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: isPositive ? 'var(--success)' : (isNegative ? 'var(--error)' : 'var(--text-muted)')
          }}>
            {metric.change !== 'Stable' && metric.change !== 'Today' && (isPositive ? '+' : '')}{metric.change}
            {isPositive ? <ArrowUpRight size={14} /> : (isNegative ? <ArrowDownRight size={14} /> : null)}
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
          {metric.title === 'Total Personnel' ? 'Total Users' : metric.title}
        </p>
        <h3 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.03em' }}>{metric.value}</h3>
        
        {/* Subtle background pulse for real-time feel */}
        {isPositive && <Motion.div animate={{ opacity: [0.05, 0.1, 0.05] }} transition={{ repeat: Infinity, duration: 3 }} style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '80px', height: '80px', background: 'var(--success)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />}
      </Motion.div>
    );
  };

  // Get dynamic user data for the title
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Dynamic Title Section */}
        <div style={{ marginBottom: '10px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {user?.role === "admin" && "Admin Dashboard"}
            {user?.role === "manager" && "Manager Dashboard"}
            {user?.role === "employee" && "Employee Dashboard"}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Authenticated as <span style={{ color: 'white', fontWeight: '700', textTransform: 'uppercase' }}>{data?.role || 'Admin'}</span> • Real-time node synchronization
            </p>
            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 0, letterSpacing: '0.05em' }}>BACKEND SYNC</p>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '6px', height: '6px', background: 'var(--success)', borderRadius: '50%' }} />
                  <p style={{ fontWeight: '800', fontSize: '0.9rem' }}>{lastRefreshed.toLocaleTimeString()}</p>
               </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
             {[1,2,3,4].map(i => <div key={i} className="glass-card" style={{ height: '160px', padding: '24px' }}><Skeleton /></div>)}
          </div>
        ) : error ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--error)' }}>
            <h2 style={{ color: 'var(--error)', marginBottom: '15px' }}>Operational Error</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>{error}</p>
            <button 
              onClick={() => fetchDashboardData(true)} 
              className="btn-primary" 
              style={{ margin: '0 auto', background: 'var(--error)' }}
            >
              Retry Node Sync
            </button>
          </div>
        ) : (
          <Motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Metric Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {(data?.metrics || []).map((metric, idx) => renderMetric(metric, idx))}
            </div>

            {/* Role-Specific Content */}
            <div style={{ display: 'grid', gridTemplateColumns: data?.role === 'admin' ? '2fr 1fr' : '1fr 1fr', gap: '24px' }}>
              
              {/* Productivity Chart (Primary for all roles) */}
              <Motion.div variants={itemVariants} className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <TrendingUp size={20} color="var(--primary)" /> {data?.role === 'employee' ? 'My Performance Velocity' : 'Production Velocity'}
                   </h3>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.trend_data || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                        itemStyle={{ color: 'var(--primary)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="var(--primary)" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Motion.div>

              {/* Secondary Visualization based on Role (System Utilization Donut) */}
              <Motion.div variants={itemVariants} className="glass-card" style={{ padding: '30px', position: 'relative' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '30px' }}>
                   {data?.role === 'employee' ? 'Assignment Balance' : 'System Utilization'}
                </h3>
                <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data?.task_distribution || []}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {(data?.task_distribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                      </PieChart>
                   </ResponsiveContainer>
                   
                   {/* Center utilization label */}
                   <div style={{
                     position: 'absolute',
                     top: '50%',
                     left: '50%',
                     transform: 'translate(-50%, -50%)',
                     textAlign: 'center'
                   }}>
                     <p style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>{data?.utilization || 0}%</p>
                     <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Effective</p>
                   </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '25px' }}>
                   {(data?.task_distribution || []).map((item, idx) => (
                     <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                        <span style={{ color: 'var(--text-muted)' }}>{item.name}:</span>
                        <span style={{ fontWeight: '700' }}>{item.value}</span>
                     </div>
                   ))}
                </div>
              </Motion.div>
            </div>

            {/* Performance Ranking and AI Advice */}
            <div style={{ display: 'grid', gridTemplateColumns: data?.role === 'admin' ? '1fr 1fr' : '1fr', gap: '24px' }}>
              
              {data?.role !== 'employee' && (
                <Motion.div variants={itemVariants} className="glass-card" style={{ padding: '30px' }}>
                   <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Activity size={20} color="var(--primary)" /> Top Performers
                   </h3>
                   <div style={{ height: '220px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.performer_data || []} layout="vertical">
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={100} axisLine={false} tickLine={false} />
                           <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '12px' }} />
                           <Bar dataKey="rating" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </Motion.div>
              )}

              <Motion.div variants={itemVariants} className="glass-card" style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent)' }}>
                 <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                       <Briefcase size={22} color="var(--accent)" />
                    </Motion.div>
                    AI Strategic Advisor
                 </h3>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(aiInsights?.suggestions || []).slice(0, 3).map((suggestion, idx) => (
                      <div key={idx} style={{ 
                        padding: '12px 16px', 
                        background: 'rgba(255,255,255,0.02)', 
                        borderRadius: '10px', 
                        borderLeft: '4px solid var(--primary)',
                        fontSize: '0.85rem',
                        lineHeight: '1.4'
                      }}>
                        {suggestion}
                      </div>
                    ))}
                    {!aiInsights?.suggestions && <Skeleton height="50px" />}
                    <button 
                      onClick={() => window.location.href='/ai'} 
                      style={{ 
                        marginTop: '10px', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--primary)', 
                        fontWeight: '700', 
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0
                      }}
                    >
                      View Deep Insights →
                    </button>
                 </div>
              </Motion.div>
            </div>

          </Motion.div>
        )}
      </div>
    </Layout>
  );
};

export default UnifiedDashboard;
