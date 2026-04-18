import React from 'react';
import Layout from '../components/Layout';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>
            User <span style={{ color: 'var(--primary)' }}>Profile</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your personal account credentials and settings</p>
        </header>

        <div className="glass-card" style={{ padding: '50px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Background Element */}
          <div style={{ 
            position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
            zIndex: 0
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '50px' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', fontWeight: '800', color: 'white',
                boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)'
              }}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>{user?.username}</h2>
                <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  {user?.role} Access
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <Mail size={18} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' }}>EMAIL ADDRESS</span>
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{user?.email || "Not Provided"}</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <Shield size={18} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' }}>SYSTEM ROLE</span>
                </div>
                <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</p>
              </div>
            </div>

            <div style={{ marginTop: '40px', padding: '20px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '15px' }}>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
               <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>Your account is verified and secure.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
