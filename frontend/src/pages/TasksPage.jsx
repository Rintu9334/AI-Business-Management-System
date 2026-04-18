import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Inbox,
  PlayCircle
} from 'lucide-react';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const userRole = localStorage.getItem('user_role') || 'employee';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`tasks/${id}/`, { status });
      setStatusMsg(`Task synchronized: Marked as ${status.replace('_', ' ')}`);
      setTimeout(() => setStatusMsg(''), 3000);
      fetchTasks();
    } catch (err) {
      alert("Neural sync failure: Status update rejected.");
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return { label: 'Deadline: Not Set', color: 'var(--text-muted)', icon: Clock };
    const diff = new Date(deadline) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { label: 'OVERDUE', color: 'var(--error)', icon: AlertCircle };
    if (days <= 2) return { label: `${days}d remaining`, color: 'var(--warning)', icon: Clock };
    return { label: `${days}d left`, color: 'var(--success)', icon: CheckCircle2 };
  };

  return (
    <Layout>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
          Workload <span style={{ color: 'var(--primary)' }}>Hub</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Track and optimize your operational assignments</p>
      </header>

      {statusMsg && (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '10px', marginBottom: '20px', fontSize: '0.85rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          {statusMsg}
        </div>
      )}

      {loading ? <LoadingSpinner message="Updating your task list..." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
          {tasks.length > 0 ? (
            tasks.map(task => {
              const clock = getDeadlineStatus(task.deadline);
              const isOverdue = clock.label === 'OVERDUE';
              
              return (
                <div key={task.id} className="glass-card" style={{ 
                  padding: '30px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '20px',
                  border: isOverdue ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {isOverdue && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--error)' }}></div>}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: '1.3', color: 'white' }}>{task.title}</h4>
                    </div>
                    <span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'in_progress' ? 'badge-primary' : 'badge-warning'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1, lineHeight: '1.6' }}>
                    {task.description || "No additional details provided."}
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: clock.color }}>
                       <clock.icon size={16} /> {clock.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <Calendar size={14} /> Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Not Set'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {userRole === 'employee' ? (
                        task.status !== 'completed' ? (
                          <>
                            {task.status === 'pending' ? (
                              <button onClick={() => updateStatus(task.id, 'in_progress')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem', background: 'var(--warning)', color: '#000' }}>
                                <PlayCircle size={16} /> Start Task
                              </button>
                            ) : null}
                            <button onClick={() => updateStatus(task.id, 'completed')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                              <CheckCircle2 size={16} /> Mark Done
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={14} /> All set! Task completed
                          </span>
                        )
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <AlertCircle size={14} /> Only assigned employee can update this task
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
              <Inbox size={50} style={{ marginBottom: '20px', opacity: 0.2 }} />
              <p style={{ fontSize: '1.1rem' }}>No tasks assigned yet. Your workspace is clear!</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default TasksPage;
