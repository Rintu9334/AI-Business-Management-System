import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FileText, 
  Download, 
  Calendar,
  History,
  FileSpreadsheet,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  Filter,
  PieChart as PieIcon,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

const ReportsPage = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [filters, setFilters] = useState({
      days: 30,
      project_id: '',
      employee_id: '',
      status: 'All'
    });

    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);

    const fetchReport = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const queryData = new URLSearchParams(filters).toString();
            const res = await api.get(`reports/?${queryData}`);
            setReport(res.data);
            
            // On first load, also get list of projects and employees for filters
            if (!projects.length && !silent) {
                const pRes = await api.get('projects/');
                setProjects(pRes.data || []);
                const eRes = await api.get('users/');
                setEmployees((eRes.data || []).filter(u => u.role === 'employee'));
            }
        } catch (err) {
            console.error("Failed to load reports", err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [filters, projects.length]);

    useEffect(() => {
        fetchReport();
        const interval = setInterval(() => fetchReport(true), 10000);
        return () => clearInterval(interval);
    }, [fetchReport]);

    const handleFilterChange = (key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleCSVExport = () => {
        window.open("http://127.0.0.1:8000/api/reports/export/csv/", "_blank");
    };

    const handlePDFExport = () => {
        window.print(); // Simple trick to get visual dashboard PDF
    };

    if (loading && !report) return <LoadingSpinner message="Aggregating analytical data..." />;

    const role = report?.role || 'employee';

    return (
        <Layout>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
                        Reports <span style={{ color: 'var(--primary)' }}>Analytics</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Real-time aggregated performance insights.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleCSVExport} className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}>
                        <FileSpreadsheet size={16} /> Export Excel
                    </button>
                    <button onClick={handleCSVExport} className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)' }}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button onClick={handlePDFExport} className="btn-primary">
                        <FileText size={16} /> Print PDF
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '700', marginRight: '10px' }}>
                    <Filter size={18} /> Data Filters:
                </div>
                
                <select value={filters.days} onChange={e => handleFilterChange('days', e.target.value)} className="input-field premium-select" style={{ width: '150px' }}>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>

                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="input-field premium-select" style={{ width: '150px' }}>
                    <option value="All">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                </select>

                {(role === 'admin' || role === 'manager') && (
                  <select value={filters.employee_id} onChange={e => handleFilterChange('employee_id', e.target.value)} className="input-field premium-select" style={{ width: '180px' }}>
                      <option value="">All Employees</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.username}</option>)}
                  </select>
                )}

                <select value={filters.project_id} onChange={e => handleFilterChange('project_id', e.target.value)} className="input-field premium-select" style={{ width: '180px' }}>
                    <option value="">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
            </motion.div>

            {report && report.total_tasks >= 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        {[
                          { label: 'Total Tasks', value: report.total_tasks, icon: FileText, color: 'var(--primary)' },
                          { label: 'Completed', value: report.completed, icon: CheckCircle, color: 'var(--success)' },
                          { label: 'Pending/Active', value: report.pending + report.in_progress, icon: Clock, color: 'var(--warning)' },
                          { label: 'Productivity', value: report.efficiency, icon: TrendingUp, color: '#ec4899' },
                          { label: 'Attendance Rate', value: report.attendance_rate, icon: Users, color: '#38bdf8' }
                        ].map((s, idx) => (
                           <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <div style={{ background: 'rgba(255,255,255,0.05)', color: s.color, padding: '12px', borderRadius: '12px' }}>
                                 <s.icon size={24} />
                              </div>
                              <div>
                                 <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</p>
                                 <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>{s.value}</h3>
                              </div>
                           </motion.div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
                        {/* Line Chart */}
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '30px', minHeight: '350px' }}>
                            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '800' }}>
                                <Activity size={20} color="var(--primary)" /> Daily Progress Trends
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={report.daily_progress}>
                                    <defs>
                                        <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: 'var(--primary)' }} />
                                    <Line type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: '#111827', strokeWidth: 2, stroke: 'var(--primary)' }} activeDot={{ r: 6, fill: 'var(--primary)' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Bar Chart */}
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card" style={{ padding: '30px', flex: 1 }}>
                                <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '800' }}>
                                    <PieIcon size={18} color="var(--success)" /> Status Quota
                                </h3>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={report.status_distribution} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" width={80} stroke="var(--text-muted)" fontSize={11} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                            {report.status_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom Row: Detailed Top Performers Table */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '35px' }}>
                        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: '800' }}>
                            <History size={20} color="var(--primary)" /> Detailed Performance Register
                        </h3>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>RANKING</th>
                                        <th>PERSONNEL</th>
                                        <th>ROLE</th>
                                        <th>COMPLETED TASKS</th>
                                        <th>PENDING TASKS</th>
                                        <th>EFFICIENCY SCORE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.top_performers && report.top_performers.length > 0 ? report.top_performers.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: '800', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--text-muted)' }}>
                                              #{idx + 1}
                                            </td>
                                            <td style={{ fontWeight: '600', color: 'white' }}>{item.name}</td>
                                            <td>
                                                <span className="badge badge-primary">{item.role}</span>
                                            </td>
                                            <td style={{ fontWeight: '700', color: 'var(--success)' }}>
                                                {item.completed_tasks}
                                            </td>
                                            <td style={{ fontWeight: '700', color: 'var(--warning)' }}>
                                                {item.pending_tasks}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                  <span style={{ fontWeight: '700', color: 'var(--success)' }}>{item.score}%</span>
                                                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                                    <div style={{ width: `${item.score}%`, height: '100%', background: 'linear-gradient(90deg, var(--success), #34d399)', borderRadius: '4px' }}></div>
                                                  </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No performance records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--glass-border)' }}>
                    <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px' }}>No analytics available</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Adjust your filters or initiate tasks to generate operational flows.</p>
                </div>
            )}

            <style>{`
              .premium-select {
                background-color: #1e293b !important;
                color: white !important;
                border: 1px solid #334155 !important;
                cursor: pointer;
                appearance: none;
                height: 40px;
                border-radius: 8px;
                padding: 0 15px;
                font-size: 0.85rem;
              }
              .premium-select option {
                background-color: #1e293b;
                color: white;
                padding: 12px;
              }
              .premium-select option:hover {
                background-color: #6366f1 !important;
              }
            `}</style>

        </Layout>
    );
};

export default ReportsPage;
