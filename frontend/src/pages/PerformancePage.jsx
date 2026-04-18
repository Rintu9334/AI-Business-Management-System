import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Trophy, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  RefreshCw,
  Zap
} from 'lucide-react';

const PerformancePage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await api.get('tasks/');
      const tasks = res.data || [];
      
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pending = total - completed;
      const rating = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      let grade = 'N/A';
      if (total > 0) {
        if (rating >= 90) grade = 'A+';
        else if (rating >= 80) grade = 'A';
        else if (rating >= 70) grade = 'B';
        else if (rating >= 60) grade = 'C';
        else if (rating >= 50) grade = 'D';
        else grade = 'F';
      }

      setMetrics({
        rating,
        completed_tasks: completed,
        pending_tasks: pending,
        total_tasks: total,
        grade
      });
    } catch (err) {
      console.error("Error fetching performance tasks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <Layout>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800' }}>Performance <span style={{ color: 'var(--primary)' }}>Hub</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time productivity auditing and metric visualization</p>
        </div>
        <button 
          onClick={() => fetchMetrics(true)} 
          className={`btn-primary ${refreshing ? 'refreshing' : ''}`}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px' }}
        >
          <RefreshCw size={18} className={refreshing ? 'spin-anim' : ''} />
        </button>
      </header>

      {loading ? <LoadingSpinner message="Auditing your high-fidelity performance data..." /> : metrics ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Top Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            
            <div className="glass-card stat-card-premium" style={{ borderLeft: '5px solid var(--primary)' }}>
              <div className="card-inner">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
                  <Trophy color="var(--primary)" size={32} />
                </div>
                <div>
                  <p className="stat-label">Productivity Rating</p>
                  <h2 className="stat-value">{metrics.rating}%</h2>
                </div>
              </div>
            </div>

            <div className="glass-card stat-card-premium" style={{ borderLeft: '5px solid var(--success)' }}>
              <div className="card-inner">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <CheckCircle color="var(--success)" size={32} />
                </div>
                <div>
                  <p className="stat-label">Tasks Finished</p>
                  <h2 className="stat-value">{metrics.completed_tasks}</h2>
                </div>
              </div>
            </div>

            <div className="glass-card stat-card-premium" style={{ borderLeft: '5px solid var(--warning)' }}>
              <div className="card-inner">
                <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <Clock color="var(--warning)" size={32} />
                </div>
                <div>
                  <p className="stat-label">Pending Execution</p>
                  <h2 className="stat-value">{metrics.pending_tasks}</h2>
                </div>
              </div>
            </div>

          </div>

          {/* Main Visualization Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
            
            <div className="glass-card" style={{ padding: '40px' }}>
              <h3 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BarChart3 size={24} color="var(--primary)" /> Growth Velocity
              </h3>
              
              <div style={{ position: 'relative', height: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="progress-bar-fill" style={{ width: `${metrics.rating}%` }}></div>
                <div className="progress-bar-glow" style={{ width: `${metrics.rating}%` }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Baseline: 0%</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{metrics.rating}% Achieved</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target: 100%</span>
              </div>
              
              <div style={{ marginTop: '40px', padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px dashed var(--glass-border)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="var(--warning)" /> Active Recommendation
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {metrics.rating >= 80 ? 
                    "You are performing at elite levels. Consider collaborating on higher-impact projects to further maximize your organizational value." :
                    metrics.rating >= 50 ? 
                    "Solid progress. Focus on clearing your current pending tasks before accepting new assignments to reach the 80% threshold." :
                    "Opportunity detected. Analyze your pending task priority to identify bottlenecks and accelerate completion velocity."
                  }
                </p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
               <div style={{ 
                 width: '120px', 
                 height: '120px', 
                 borderRadius: '50%', 
                 border: '8px solid var(--primary)', 
                 borderTopColor: 'transparent',
                 margin: '0 auto 20px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '1.8rem',
                 fontWeight: '800',
                 transform: 'rotate(45deg)'
               }}>
                 <span style={{ transform: 'rotate(-45deg)' }}>{metrics.grade}</span>
               </div>
               <h3>System Grade</h3>
               <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Based on task complexity and delivery timeframes</p>
            </div>

          </div>

        </div>
      ) : <p>Error initializing analytics engine.</p>}

      <style>{`
        .stat-card-premium {
          padding: 30px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card-premium:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        }
        .card-inner {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .stat-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justifyContent: center;
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 10px;
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .progress-bar-glow {
          position: absolute;
          top: 0;
          height: 100%;
          background: white;
          opacity: 0.2;
          filter: blur(10px);
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
};

export default PerformancePage;
