import React, { useState, useEffect } from 'react';
import './App.css';
import ImageEncryptor from './components/ImageEncryptor';
import ImageDecryptor from './components/ImageDecryptor';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { initAnalytics, trackEvent, isEnabled } from './utils/analytics';
import logo from './logo.svg'; // Make sure your new logo has the same filename or update accordingly

function App() {
  const [activeTab, setActiveTab] = useState('encrypt');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const currentYear = new Date().getFullYear();

  // Initialize analytics when the app loads
  useEffect(() => {
    initAnalytics();
    trackEvent('app_loaded', { timestamp: new Date().toISOString() });
  }, []);
  
  // Track tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    trackEvent('tab_change', { tab });
  };
  
  // Toggle analytics dashboard
  const toggleAnalytics = () => {
    setShowAnalytics(!showAnalytics);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <div className="logo">🔒</div>
          <h1>Raksha</h1>
        </div>
        <p className="app-tagline">Secure Image Encryption by Anshuman Singh</p>
        
        <div className="tabs">
          <button 
            className={activeTab === 'encrypt' ? 'active' : ''} 
            onClick={() => handleTabChange('encrypt')}
          >
            <span className="tab-icon">🔒</span> Encrypt
          </button>
          <button 
            className={activeTab === 'decrypt' ? 'active' : ''} 
            onClick={() => handleTabChange('decrypt')}
          >
            <span className="tab-icon">🔓</span> Decrypt
          </button>
        </div>
      </header>
      
      <main>
        {activeTab === 'encrypt' ? <ImageEncryptor /> : <ImageDecryptor />}
      </main>
      
      <footer className="app-footer">
        <div className="author-info">
          <p>Designed & Developed by</p>
          <h3>Anshuman Singh</h3>
        </div>
        <div className="footer-links">
          <button onClick={toggleAnalytics} className="analytics-toggle">
            {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
          </button>
          <span className="analytics-status">
            Analytics: {isEnabled() ? 'On' : 'Off'}
          </span>
        </div>
        <p className="copyright">© {currentYear} - All rights reserved</p>
      </footer>
      
      {showAnalytics && <AnalyticsDashboard />}
    </div>
  );
}

export default App;
