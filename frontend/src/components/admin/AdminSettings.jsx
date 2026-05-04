import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import './AdminSettings.css';

const AdminSettings = () => {
  const navigate = useNavigate();
=======
import './AdminSettings.css';

const AdminSettings = () => {
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Grade12Central',
      siteDescription: 'Comprehensive learning platform for Grade 12 students',
      contactEmail: 'admin@grade12central.com',
      timezone: 'Africa/Johannesburg',
      dateFormat: 'YYYY-MM-DD'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      maxLoginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      dailyDigest: true,
      weeklyReport: true
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      backupSchedule: 'daily',
      logRetention: 30
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async (section) => {
    setLoading(true);
    setSaveStatus('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings[section])
      });
      
      if (response.ok) {
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Error saving settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="admin-settings">
<<<<<<< HEAD
      {/* Back Button */}
      <div className="settings-back-btn">
        <button onClick={() => navigate('/admin-dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

=======
>>>>>>> b00dc9b5eafab1d37315949149f2e9fb146c3734
      {/* Header */}
      <div className="settings-header">
        <div>
          <h1>System Settings</h1>
          <p>Configure and manage your platform settings</p>
        </div>
        {saveStatus && (
          <div className={`save-status ${saveStatus.includes('success') ? 'success' : 'error'}`}>
            {saveStatus}
          </div>
        )}
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <span className="tab-icon">⚙️</span>
          General
        </button>
        <button 
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <span className="tab-icon">🔒</span>
          Security
        </button>
        <button 
          className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="tab-icon">🔔</span>
          Notifications
        </button>
        <button 
          className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <span className="tab-icon">💻</span>
          System
        </button>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <h3>General Settings</h3>
            <div className="settings-form">
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                />
                <small>The name of your platform</small>
              </div>

              <div className="form-group">
                <label>Site Description</label>
                <textarea
                  rows="3"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleChange('general', 'siteDescription', e.target.value)}
                />
                <small>Brief description of your platform</small>
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleChange('general', 'contactEmail', e.target.value)}
                />
                <small>Email address for system notifications</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                  >
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                    <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                    <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Format</label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => handleChange('general', 'dateFormat', e.target.value)}
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => handleSave('general')} 
                  disabled={loading}
                  className="save-btn"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <h3>Security Settings</h3>
            <div className="settings-form">
              <div className="form-group toggle-group">
                <div className="toggle-label">
                  <label>Two-Factor Authentication</label>
                  <small>Require 2FA for all admin accounts</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleChange('security', 'twoFactorAuth', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                  <small>Auto logout after inactivity</small>
                </div>

                <div className="form-group">
                  <label>Password Expiry (days)</label>
                  <input
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => handleChange('security', 'passwordExpiry', parseInt(e.target.value))}
                  />
                  <small>Force password change after X days</small>
                </div>
              </div>

              <div className="form-group">
                <label>Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
                <small>Number of failed attempts before account lock</small>
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => handleSave('security')} 
                  disabled={loading}
                  className="save-btn"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3>Notification Settings</h3>
            <div className="settings-form">
              <div className="form-group toggle-group">
                <div className="toggle-label">
                  <label>Email Notifications</label>
                  <small>Send email notifications for important events</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group toggle-group">
                <div className="toggle-label">
                  <label>Push Notifications</label>
                  <small>Send browser push notifications</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleChange('notifications', 'pushNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group toggle-group">
                <div className="toggle-label">
                  <label>Daily Digest</label>
                  <small>Send daily summary of platform activity</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.dailyDigest}
                    onChange={(e) => handleChange('notifications', 'dailyDigest', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group toggle-group">
                <div className="toggle-label">
                  <label>Weekly Report</label>
                  <small>Send weekly performance report</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyReport}
                    onChange={(e) => handleChange('notifications', 'weeklyReport', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => handleSave('notifications')} 
                  disabled={loading}
                  className="save-btn"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* System Settings */}
        {activeTab === 'system' && (
          <div className="settings-section">
            <h3>System Settings</h3>
            <div className="settings-form">
              <div className="form-group toggle-group">
                <div className="toggle-label">
                  <label>Maintenance Mode</label>
                  <small>Put the platform in maintenance mode</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => handleChange('system', 'maintenanceMode', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group toggle-group">
                <div className="toggle-label">
                  <label>Debug Mode</label>
                  <small>Enable debug logging (only for development)</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.system.debugMode}
                    onChange={(e) => handleChange('system', 'debugMode', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Backup Schedule</label>
                  <select
                    value={settings.system.backupSchedule}
                    onChange={(e) => handleChange('system', 'backupSchedule', e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Log Retention (days)</label>
                  <input
                    type="number"
                    value={settings.system.logRetention}
                    onChange={(e) => handleChange('system', 'logRetention', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  onClick={() => handleSave('system')} 
                  disabled={loading}
                  className="save-btn"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;