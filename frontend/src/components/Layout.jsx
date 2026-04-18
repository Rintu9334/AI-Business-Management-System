import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
