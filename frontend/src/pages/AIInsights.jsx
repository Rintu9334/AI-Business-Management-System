import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BrainCircuit, 
  Target, 
  Zap, 
  ShieldAlert,
  BarChart3,
  UserCheck,
  ZapOff
} from 'lucide-react';
import { motion } from 'framer-motion';

const AIInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInsights = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const res = await api.get('ai/insights/');
            setInsights(res.data);
        } catch (err) {
            console.error("AI Insights synchronization failed");
            setError("The neural link to the predictive engine is currently offline. Please attempt reconnection.");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
        const interval = setInterval(() => fetchInsights(true), 15000); // Auto-refresh data silently

        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1 }
      }
    };

    const cardVariants = {
      hidden: { opacity: 0, scale: 0.95, y: 10 },
      visible: { opacity: 1, scale: 1, y: 0 }
    };

    // ----------------------------------------
    // Clean Conditional Rendering (Fail-Safe)
    // ----------------------------------------
    
    // 1. Loading State
    if (loading && !insights) {
        return (
            <Layout>
                <header style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px' }}>
                          <BrainCircuit color="var(--primary)" size={32} />
                       </div>
                       <div>
                          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>AI <span style={{ color: 'var(--primary)' }}>Prediction</span></h1>
                          <p style={{ color: 'var(--text-muted)' }}>Advanced predictive modeling and resource optimization</p>
                       </div>
                    </div>
                </header>
                <LoadingSpinner message="Interrogating neural infrastructure..." />
            </Layout>
        );
    }

    // 2. Error State / Fallback
    if (error || !insights) {
        return (
            <Layout>
                <header style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                       <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '14px' }}>
                          <ZapOff color="var(--error)" size={32} />
                       </div>
                       <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                         System <span style={{ color: 'var(--error)' }}>Offline</span>
                       </h1>
                    </div>
                </header>
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Unable to fetch insights</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{error || "No data available yet. Ensure at least one task sequence exists."}</p>
                    <button onClick={() => fetchInsights(false)} className="btn-primary">Re-initialize Link</button>
                </div>
            </Layout>
        );
    }

    // 3. Success State (Main UI)
    return (
        <Layout>
            <header style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                   <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '14px' }}>
                      <BrainCircuit color="var(--primary)" size={32} />
                   </div>
                   <div>
                      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                        AI <span style={{ color: 'var(--primary)' }}>Prediction</span>
                      </h1>
                      <p style={{ color: 'var(--text-muted)' }}>Advanced predictive modeling and resource optimization</p>
                   </div>
                </div>
            </header>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}
            >
                {/* PROJECT HEALTH */}
                <motion.div variants={cardVariants} className="glass-card" style={{ padding: '30px', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                       <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PROJECT HEALTH</h3>
                       <ShieldAlert size={20} color={insights.risk === 'HIGH' ? 'var(--error)' : (insights.risk === 'MEDIUM' ? 'var(--warning)' : 'var(--success)')} />
                    </div>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: insights.risk === 'HIGH' ? 'var(--error)' : (insights.risk === 'MEDIUM' ? 'var(--warning)' : 'var(--success)') }}>
                       {insights.risk}
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                       Security and deadline stability audit.
                    </p>
                    {insights.risk === 'HIGH' && <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0, background: 'var(--error)', filter: 'blur(60px)', zIndex: -1 }} />}
                </motion.div>

                {/* WORKLOAD LEVEL */}
                <motion.div variants={cardVariants} className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                       <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>WORKLOAD LEVEL</h3>
                       <BarChart3 size={20} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'white' }}>
                       {insights.task_density}
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Average queued tasks per employee node.</p>
                </motion.div>

                {/* PREDICTION ACCURACY */}
                <motion.div variants={cardVariants} className="glass-card" style={{ padding: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                       <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PREDICTION ACCURACY</h3>
                       <Target size={20} color="var(--accent)" />
                    </div>
                    <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--accent)' }}>
                       {insights.confidence}%
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reliability coefficient for current ML forecast.</p>
                </motion.div>

                {/* BEST PERFORMER */}
                <motion.div variants={cardVariants} className="glass-card" style={{ padding: '30px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                       <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BEST PERFORMER</h3>
                       <UserCheck size={20} color="var(--success)" />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--success)', textTransform: 'uppercase' }}>
                       {insights.best_employee && insights.best_employee !== "N/A" ? insights.best_employee : "NO DATA"}
                    </div>
                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Optimal node for immediate task deployment.</p>
                </motion.div>

                {/* Level 2: Real-time ML Workload & Predictions */}
                <motion.div variants={cardVariants} className="glass-card" style={{ padding: '35px', gridColumn: '1 / -1' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '800' }}>
                        <Zap size={20} color="var(--warning)" /> Performance Forecast
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                       
                         <div style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                           <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                             <strong>Delay Probability:</strong> <br/><span style={{ color: 'var(--text-muted)' }}>{insights.predicted_delay || "No delay expected"}</span>
                           </div>
                         </div>

                         <div style={{ flex: 1, padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                           <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                             <strong>System Status:</strong> <br/><span style={{ color: 'var(--text-muted)' }}>{
                                 insights.risk === "LOW" ? "Everything is running smoothly 👍" : 
                                 insights.risk === "MEDIUM" ? "Some delays expected ⚠️" : 
                                 "High workload detected 🚨"
                             }</span>
                           </div>
                         </div>

                         {insights.workload?.overloaded?.length > 0 && (
                           <div style={{ flex: 1, padding: '20px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                             <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--error)' }}>
                               <strong>Overloaded Nodes:</strong> <br/><span>{insights.workload.overloaded.join(", ")}</span>
                             </div>
                           </div>
                         )}

                    </div>
                </motion.div>
            </motion.div>
        </Layout>
    );
};

export default AIInsights;
