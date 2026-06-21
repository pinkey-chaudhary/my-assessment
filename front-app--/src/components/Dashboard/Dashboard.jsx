import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.email) setUser(data);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('http://localhost:8000/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };

  if (!user) return <p style={{ color: '#333', fontWeight: 'bold' }}>Verifying Secure Session...</p>;

  return (
    <div className="dashboard-container">
      <h2>User Dashboard</h2>
      <div className="dashboard-card">
        <p><strong>Welcome back,</strong> {user.first_name} {user.last_name} 👋</p>
        <p><strong>Email Identity:</strong> {user.email}</p>
        <p><strong>Phone Registry:</strong> {user.phone}</p>
      </div>
      <button onClick={handleLogout} className="logout-btn">Secure Logout</button>
    </div>
  );
}

export default Dashboard;