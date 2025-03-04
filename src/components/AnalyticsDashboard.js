import React, { useState, useEffect } from 'react';
import { getAnalyticsData, clearAnalyticsData, optOut, optIn, isEnabled } from '../utils/analytics';

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeSession, setActiveSession] = useState(0);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(isEnabled());
  
  useEffect(() => {
    // Load analytics data
    const data = getAnalyticsData();
    setAnalyticsData(data);
  }, []);
  
  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete all analytics data? This action cannot be undone.")) {
      clearAnalyticsData();
      setAnalyticsData({ userId: null, sessions: [] });
    }
  };
  
  const handleOptChange = () => {
    if (analyticsEnabled) {
      optOut();
      setAnalyticsEnabled(false);
    } else {
      optIn();
      setAnalyticsEnabled(true);
    }
  };
  
  const refreshData = () => {
    const data = getAnalyticsData();
    setAnalyticsData(data);
  };
  
  if (!analyticsData) {
    return <div className="analytics-dashboard">Loading analytics data...</div>;
  }
  
  // Calculate some basic stats
  const totalSessions = analyticsData.sessions?.length || 0;
  const sessions = analyticsData.sessions || [];
  const currentSessionData = sessions[sessions.length - 1 - activeSession] || { events: [] };
  
  // Group events by name and count
  const eventCounts = {};
  sessions.forEach(session => {
    (session.events || []).forEach(event => {
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
    });
  });
  
  // Calculate event success rates
  const encryptionSuccessRate = calculateSuccessRate(eventCounts, 'encrypt_file_selected', 'encryption_complete');
  const decryptionSuccessRate = calculateSuccessRate(eventCounts, 'decrypt_file_uploaded', 'decryption_complete');
  
  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>
      <p className="analytics-note">
        All data is stored locally in your browser and never transmitted to any server.
      </p>
      
      <div className="analytics-controls">
        <button onClick={refreshData} className="btn small">
          Refresh Data
        </button>
        <button onClick={handleClearData} className="btn small danger">
          Clear All Data
        </button>
        <label className="analytics-toggle-label">
          <input 
            type="checkbox" 
            checked={analyticsEnabled} 
            onChange={handleOptChange} 
          />
          Enable Analytics
        </label>
      </div>
      
      <div className="analytics-summary">
        <h3>Summary</h3>
        <div className="analytics-stat-grid">
          <div className="analytics-stat-box">
            <span className="stat-value">{totalSessions}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="analytics-stat-box">
            <span className="stat-value">{eventCounts['app_loaded'] || 0}</span>
            <span className="stat-label">App Loads</span>
          </div>
          <div className="analytics-stat-box">
            <span className="stat-value">{eventCounts['encryption_complete'] || 0}</span>
            <span className="stat-label">Images Encrypted</span>
          </div>
          <div className="analytics-stat-box">
            <span className="stat-value">{eventCounts['decryption_complete'] || 0}</span>
            <span className="stat-label">Images Decrypted</span>
          </div>
          <div className="analytics-stat-box">
            <span className="stat-value">{encryptionSuccessRate}%</span>
            <span className="stat-label">Encryption Success Rate</span>
          </div>
          <div className="analytics-stat-box">
            <span className="stat-value">{decryptionSuccessRate}%</span>
            <span className="stat-label">Decryption Success Rate</span>
          </div>
        </div>
      </div>
      
      <div className="analytics-session-data">
        <h3>Session Details</h3>
        
        <div className="session-selector">
          <select 
            value={activeSession} 
            onChange={(e) => setActiveSession(parseInt(e.target.value))}
          >
            {sessions.map((session, index) => (
              <option key={index} value={sessions.length - 1 - index}>
                Session #{sessions.length - index} ({formatDate(session.start)})
              </option>
            ))}
          </select>
        </div>
        
        <div className="session-events">
          <h4>Events ({currentSessionData.events.length})</h4>
          
          <div className="event-list">
            {currentSessionData.events.length === 0 ? (
              <p>No events recorded in this session</p>
            ) : (
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Event</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSessionData.events.map((event, index) => (
                    <tr key={index}>
                      <td>{formatTime(event.timestamp)}</td>
                      <td>{formatEventName(event.name)}</td>
                      <td>{formatEventData(event.data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateSuccessRate(counts, startEvent, endEvent) {
  if (!counts[startEvent] || counts[startEvent] === 0) {
    return 0;
  }
  const rate = (counts[endEvent] || 0) / counts[startEvent] * 100;
  return Math.round(rate);
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateString;
  }
}

function formatTime(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return dateString;
  }
}

function formatEventName(name) {
  // Convert snake_case to Title Case with spaces
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatEventData(data) {
  if (!data) return '';
  
  // Convert object to a readable string, hiding timestamps
  return Object.entries(data)
    .filter(([key]) => key !== 'timestamp')
    .map(([key, value]) => {
      if (key === 'fileSize') {
        // Format file size in KB or MB
        const kb = Math.round(value / 1024);
        return kb > 1024 ? 
          `${(kb / 1024).toFixed(1)} MB` : 
          `${kb} KB`;
      }
      if (key === 'processingTime') {
        return `${value}ms`;
      }
      return `${formatKey(key)}: ${value}`;
    })
    .join(', ');
}

function formatKey(key) {
  // Convert camelCase to words
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}

export default AnalyticsDashboard;