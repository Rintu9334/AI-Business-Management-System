import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  Brain, 
  FileText, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('user_role');

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: (role === 'admin' ? '/admin/dashboard' : role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'), roles: ['admin', 'manager', 'employee'] },
    { label: 'Users', icon: Users, path: '/admin/users', roles: ['admin'] },
    { label: 'Project Hub', icon: FolderKanban, path: (role === 'admin' || role === 'manager') ? '/manager/projects' : '/projects', roles: ['admin', 'manager'] },
    { label: 'Task List', icon: CheckSquare, path: role === 'manager' ? '/manager/tasks' : '/tasks', roles: ['admin', 'manager', 'employee'] },
    { label: 'Attendance', icon: Clock, path: '/attendance', roles: ['employee', 'admin', 'manager'] },
    { label: 'Performance', icon: BarChart3, path: '/performance', roles: ['employee', 'admin', 'manager'] },
    { label: 'AI Predict', icon: Brain, path: '/ai', roles: ['admin', 'manager', 'employee'] },
    { label: 'Reports', icon: FileText, path: '/reports', roles: ['admin', 'manager'] },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="sidebar" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '20px 15px', 
      height: '100vh', 
      borderRight: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(20px)'
    }}>
      <div style={{ padding: '0 10px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
            borderRadius: '12px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={24} color="white" />
          </div>
          <div className="nav-label">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0, color: 'white' }}>
              BizOps <span style={{ color: '#6366f1' }}>Pro</span>
            </h2>
            <p style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Management OS
            </p>
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {navItems
          .filter(item => item.roles.includes(role))
          .map(item => (
            <NavLink 
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span className="nav-label" style={{ fontWeight: '600' }}>{item.label}</span>
            </NavLink>
        ))}

        <div 
          onClick={handleLogout}
          className="sidebar-item logout"
          style={{ marginTop: 'auto' }}
        >
          <LogOut size={18} />
          <span className="nav-label" style={{ fontWeight: '600' }}>Terminate Session</span>
        </div>
      </nav>

      <style>{`
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          color: #9ca3af;
          background: transparent;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          cursor: pointer;
        }

        .sidebar-item:hover {
          background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
          color: white;
          transform: translateX(4px);
        }

        .sidebar-item.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .sidebar-item svg {
          stroke-width: 2;
          color: #9ca3af;
          transition: all 0.3s ease;
        }

        .sidebar-item:hover svg, .sidebar-item.active svg {
          color: white;
          transform: scale(1.1);
        }

        .logout {
          color: #ef4444;
          border: 1px solid transparent;
        }

        .logout:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #f87171 !important;
          border-color: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
