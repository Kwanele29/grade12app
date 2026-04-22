import React, { useState, useEffect } from 'react';
import './AdminReports.css';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reports from API
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/admin/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="loading">Loading reports...</div>;

  return (
    <div className="admin-reports">
      <h2>Reports & Analytics</h2>
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{reports.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Tutors</h3>
          <p className="stat-number">{reports.activeTutors || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">{reports.totalStudents || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Content Items</h3>
          <p className="stat-number">{reports.totalContent || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;