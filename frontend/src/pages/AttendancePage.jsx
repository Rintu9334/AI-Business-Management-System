import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  History, 
  Calendar,
  Timer,
  Search,
  Trash2,
  Edit3,
  Users,
  Activity,
  CheckCircle2
} from 'lucide-react';

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]); // Used for Admin
  const [history, setHistory] = useState([]); // Used for Employee
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({ total_employees: 0, present_today: 0, in_progress: 0, absent: 0 });
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  // ULTRA-SAFE USER PARSING
  const user = (() => {
    try {
      const data = localStorage.getItem('user');
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Session parse error:", e);
      return {};
    }
  })();

  const role = user?.role || 'employee';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (role === 'admin' || role === 'manager') {
        const [attRes, statsRes] = await Promise.all([
          api.get('attendance/'),
          api.get('attendance/stats/').catch(() => ({ data: {} }))
        ]);
        setAttendance(attRes?.data || []);
        if (statsRes?.data) setStats(statsRes.data);
        
        // Managers also need their own history for self-check-in
        if (role === 'manager') {
          const res = await api.get('attendance/');
          const rawHistory = res?.data || [];
          setHistory(rawHistory);
          setActiveSession(rawHistory?.find(a => !a?.logout_time) || null);
        }
      } else {
        const res = await api.get('attendance/');
        const rawHistory = res?.data || [];
        const sortedHistory = [...rawHistory].sort((a, b) => new Date(b?.login_time) - new Date(a?.login_time));
        setHistory(sortedHistory);
        const active = rawHistory?.find(a => !a?.logout_time);
        setActiveSession(active || null);
      }
    } catch (err) {
      console.error("Attendance synchronization failed:", err);
      showFeedback('Operational link lost. Check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (text, type) => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  // --- Attendance Functions ---
  const handleAttendance = async (type) => {
    try {
      if (type === 'logout') {
        await api.post('attendance/logout/');
      } else {
        await api.post('attendance/login/');
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Attendance update failed");
    }
  };

  // --- Admin Functions ---
  const handleEdit = async (record) => {
    const newLogin = prompt("Enter new Login Time (YYYY-MM-DD HH:MM:SS)", record?.login || "");
    const newLogout = prompt("Enter new Logout Time (YYYY-MM-DD HH:MM:SS)", record?.logout || "");
    const newStatus = prompt("Enter Status (Present/Absent/Late)", record?.status || "Present");

    if (!newLogin && record?.login) return;

    try {
      await api.put(`attendance/update/${record?.id}/`, {
        login: newLogin,
        logout: newLogout,
        status: newStatus
      });
      showFeedback('Record updated successfully', 'success');
      fetchData();
    } catch (err) {
      showFeedback('Update failed. Check date format.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this attendance record?")) return;
    if (!id) return;
    try {
      await api.delete(`attendance/delete/${id}/`);
      showFeedback('Record removed safely.', 'success');
      fetchData();
    } catch (err) {
      showFeedback('Deletion failed.', 'error');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch { return '--:--'; }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '---';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '---';
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '---'; }
  };

  // Summary Stats Logic (Now Fetched from API)
  const totalEmployeesCount = stats?.total_employees || 0;
  const presentCount = stats?.present_today || 0;
  const inProgressCount = stats?.in_progress || 0;
  const absentCount = stats?.absent || 0;

  // Advanced Filtering
  const filteredAdminData = (attendance || []).filter(a => {
    const employeeName = a?.username || a?.name;
    if (search && !employeeName?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && a?.status !== statusFilter) return false;
    
    if (dateFilter !== 'All') {
      try {
        const recordDate = new Date(a?.date);
        const today = new Date();
        if (dateFilter === 'Today') {
          if (recordDate.toDateString() !== today.toDateString()) return false;
        } else if (dateFilter === 'Week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (recordDate < weekAgo) return false;
        } else if (dateFilter === 'Month') {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (recordDate < monthAgo) return false;
        }
      } catch (e) { return false; }
    }
    return true;
  });

  return (
    <Layout>
      <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>
            Attendance <span style={{ color: 'var(--primary)' }}>Overview</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {role === 'admin' ? 'Organization-wide workforce monitoring' : 'Track your team\'s attendance and work activity in real time.'}
          </p>
        </div>
        
        {role === 'admin' ? (
           <div style={{ position: 'relative' }}>
             <input 
               className="input-field"
               placeholder="Search logs..."
               style={{ width: '300px', paddingLeft: '40px' }}
               onChange={(e) => setSearch(e.target.value)}
             />
             <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
           </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="var(--primary)" />
              <span style={{ fontWeight: '600' }}>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </header>

      {msg?.text && (
        <div style={{
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '30px',
          background: msg?.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: msg?.type === 'success' ? '#10b981' : '#ef4444',
          border: `1px solid ${msg?.type === 'success' ? '#10b981' : '#ef4444'}`,
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {msg?.text}
        </div>
      )}

      {loading ? <LoadingSpinner message="Synchronizing time logs..." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {role === 'admin' ? (
            // --- ADMIN UI ---
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div className="glass-card pulse-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '12px' }}><Users size={24} /></div>
                  <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL EMPLOYEES</p><h3 style={{ margin: 0, fontSize: '1.5rem' }}>{totalEmployeesCount}</h3></div>
                </div>
                <div className="glass-card pulse-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderRadius: '12px' }}><Activity size={24} /></div>
                  <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRESENT TODAY</p><h3 style={{ margin: 0, fontSize: '1.5rem' }}>{presentCount}</h3></div>
                </div>
                <div className="glass-card pulse-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', borderRadius: '12px' }}><Timer size={24} /></div>
                  <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>IN PROGRESS</p><h3 style={{ margin: 0, fontSize: '1.5rem' }}>{inProgressCount}</h3></div>
                </div>
                <div className="glass-card pulse-hover" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '12px' }}><LogOut size={24} /></div>
                  <div><p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>ABSENT</p><h3 style={{ margin: 0, fontSize: '1.5rem' }}>{absentCount}</h3></div>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginRight: '10px' }}>Quick Filters:</span>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field premium-select" style={{ width: '200px' }}>
                  <option value="Today">Today</option>
                  <option value="Week">This Week</option>
                  <option value="Month">This Month</option>
                  <option value="All">All Time</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field premium-select" style={{ width: '200px' }}>
                  <option value="All">All Statuses</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>

              {/* Table */}
              <section className="glass-card" style={{ padding: '30px' }}>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>EMPLOYEE</th>
                        <th>DATE</th>
                        <th>LOGIN</th>
                        <th>LOGOUT</th>
                        <th>HOURS</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(filteredAdminData) && filteredAdminData.length > 0 ? filteredAdminData.map(a => (
                        <tr key={a?.id}>
                          <td style={{ fontWeight: '700' }}>{a?.username || a?.name || "Unknown"}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{formatDate(a?.date)}</td>
                          <td style={{ fontSize: '0.85rem' }}>{formatTime(a?.login_time || a?.login)}</td>
                          <td style={{ fontSize: '0.85rem' }}>{(a?.logout_time || a?.logout) ? formatTime(a?.logout_time || a?.logout) : 'Working...'}</td>
                          <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{(a?.working_hours || a?.hours) > 0 ? `${a?.working_hours || a?.hours}h` : '---'}</td>
                          <td>
                            <span className={`badge ${(a?.status === 'COMPLETED') ? 'badge-success' : 'badge-warning'}`}>
                              {(a?.status || 'UNSET')?.replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ display: 'flex', gap: '15px' }}>
                             <button onClick={() => handleEdit(a)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Edit3 size={16} /></button>
                             <button onClick={() => handleDelete(a?.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No historical logs synchronized.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : role === 'manager' ? (
            // --- MANAGER UI (Workforce Overview) ---
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
               
               {/* Summary Row */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
                  {/* Manager Self Action */}
                  <div className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div>
                           <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>Personal Shift Control</p>
                           <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{activeSession ? "Shift Active" : "Ready to Sync"}</h4>
                        </div>
                        <Timer size={20} color={activeSession ? 'var(--success)' : 'var(--text-muted)'} />
                      </div>
                      <button 
                        onClick={() => handleAttendance(activeSession ? 'logout' : 'login')}
                        className={activeSession ? 'btn-danger' : 'btn-primary'}
                        style={{ padding: '8px 15px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
                      >
                         {activeSession ? "Finish My Workday" : "Mark My Attendance"}
                      </button>
                  </div>

                  {/* Summary Cards */}
                  {[
                    { label: 'Total Employees', value: stats?.total_employees || 0, icon: Users, color: 'var(--primary)' },
                    { label: 'Present Today', value: stats?.present_today || 0, icon: CheckCircle2, color: 'var(--success)' },
                    { label: 'Absent Today', value: stats?.absent || 0, icon: LogOut, color: 'var(--error)' },
                    { label: 'Currently Working', value: stats?.in_progress || 0, icon: Activity, color: 'var(--warning)' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-card" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '12px', background: `${stat.color}15`, borderRadius: '12px', color: stat.color }}>
                          <stat.icon size={24} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{stat?.label}</p>
                          <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>{stat?.value || 0}</h3>
                        </div>
                    </div>
                  ))}
               </div>

               {/* Workforce Tracking Table */}
               <div className="glass-card" style={{ padding: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Activity size={22} color="var(--primary)" /> Employee Attendance Records
                    </h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <input 
                        className="input-field" 
                        placeholder="Filter by employee name..." 
                        style={{ width: '250px', fontSize: '0.85rem' }}
                        onChange={(e) => setSearch(e?.target?.value)}
                      />
                    </div>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>EMPLOYEE</th>
                          <th>DATE</th>
                          <th>LOGIN</th>
                          <th>LOGOUT</th>
                          <th>DURATION</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(filteredAdminData) && filteredAdminData.length > 0 ? (
                          filteredAdminData
                            .filter(a => a?.role === 'employee' && (a?.username || a?.name) !== user?.username)
                            .map(a => (
                              <tr key={a?.id}>
                                <td style={{ fontWeight: '700' }}>{a?.username || a?.name || "Unknown"}</td>
                                <td>{formatDate(a?.date)}</td>
                                <td>{formatTime(a?.login_time || a?.login)}</td>
                                <td>{(a?.logout_time || a?.logout) ? formatTime(a?.logout_time || a?.logout) : '--:--'}</td>
                                <td style={{ fontWeight: '800', color: 'var(--primary)' }}>{(a?.working_hours || a?.hours) ? `${a?.working_hours || a?.hours}h` : '--'}</td>
                                <td>
                                  <span className={`badge ${a?.status === 'COMPLETED' ? 'badge-success' : a?.status === 'IN_PROGRESS' ? 'badge-primary' : 'badge-warning'}`}>
                                    {(a?.status || 'UNSET')?.replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))
                        ) : (
                          <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No attendance records available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          ) : (
            // --- EMPLOYEE UI ---
            <>
              {/* Personal Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <div className="glass-card" style={{ padding: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                     <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>
                          {activeSession ? "Session Active" : (Array.isArray(history) && history.some(h => h?.date === new Date().toISOString().split('T')[0]) ? "Work Completed" : "Ready to Start")}
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {activeSession ? "Current session started at " + formatTime(activeSession?.login_time) : (Array.isArray(history) && history.some(h => h?.date === new Date().toISOString().split('T')[0]) ? "Your workday is officially recorded and synchronized." : "Log in to begin your workday.")}
                        </p>
                     </div>
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        background: activeSession ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        animation: activeSession ? 'pulse 2s infinite' : 'none'
                      }}>
                       {activeSession ? <Timer color="var(--success)" /> : <Clock color="var(--error)" />}
                     </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    {!activeSession && !(Array.isArray(history) && history.some(h => h?.date === new Date().toISOString().split('T')[0])) ? (
                      <button 
                        onClick={() => handleAttendance('login')} 
                        className="btn-primary" 
                        style={{ justifyContent: 'center', gap: '10px', background: 'var(--success)' }}
                      >
                        <LogIn size={20} /> Start Work (Clock-In)
                      </button>
                    ) : activeSession ? (
                      <button 
                        onClick={() => handleAttendance('logout')} 
                        className="btn-primary" 
                        style={{ justifyContent: 'center', gap: '10px', background: 'var(--error)' }}
                      >
                        <LogOut size={20} /> Finish Work (Clock-Out)
                      </button>
                    ) : (
                      <button 
                        disabled 
                        className="btn-primary" 
                        style={{ justifyContent: 'center', gap: '10px', background: 'var(--glass-border)', opacity: 0.5, cursor: 'not-allowed' }}
                      >
                        <CheckCircle2 size={20} /> Work Completed
                      </button>
                    )}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '35px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <History size={18} /> Daily Summary
                   </h3>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {(() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const todayRecord = Array.isArray(history) ? history.find(h => h?.date === todayStr) : null;
                        
                        return (
                          <>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px' }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>SHIFT START</p>
                              <p style={{ fontWeight: '700' }}>{todayRecord ? formatTime(todayRecord?.login_time) : '--:--'}</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px' }}>
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '5px' }}>LAST DURATION</p>
                              <p style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                {activeSession ? 'Tracking...' : (todayRecord?.logout_time ? todayRecord?.duration_display : '0m')}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                   </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '40px' }}>
                <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={20} color="var(--primary)" /> Personal 30-Day History
                </h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>LOGIN</th>
                        <th>LOGOUT</th>
                        <th>DURATION</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(history) && history.length > 0 ? history.map(log => (
                        <tr key={log?.id}>
                          <td style={{ fontWeight: '600' }}>{formatDate(log?.date)}</td>
                          <td>{formatTime(log?.login_time)}</td>
                          <td>{log?.logout_time ? formatTime(log?.logout_time) : '--:--'}</td>
                          <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{log?.logout_time ? log?.duration_display : '--'}</td>
                          <td>
                          <span style={{ 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '0.7rem', 
                              fontWeight: '800',
                              background: log?.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                              color: log?.status === 'COMPLETED' ? 'var(--success)' : 'var(--primary)',
                              border: `1px solid ${log?.status === 'COMPLETED' ? 'var(--success)' : 'var(--primary)'}`
                            }}>
                              {(log?.status || 'UNSET')?.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No personal attendance history found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .pulse-hover { transition: all 0.2s ease; }
        .pulse-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .premium-select {
          background-color: #1e293b !important;
          color: white !important;
          border: 1px solid #334155 !important;
          cursor: pointer;
          appearance: none;
        }
        .premium-select option {
          background-color: #1e293b;
          color: white;
          padding: 12px;
        }
        .premium-select option:hover, .premium-select option:focus, .premium-select option:checked {
          background-color: #6366f1 !important;
          color: white !important;
        }
      `}</style>
    </Layout>
  );
};

export default AttendancePage;
