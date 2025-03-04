/**
 * Simple privacy-friendly analytics for Raksha
 * Created by Anshuman Singh
 */

// Default settings for analytics
const DEFAULT_SETTINGS = {
  enabled: true,            // Whether analytics is enabled
  storageKey: 'raksha_analytics_data',
  userId: null,             // Anonymous user ID
  sessionId: null,          // Current session ID
  sessionStart: null        // Session start timestamp
};

// Generate a random ID (anonymous)
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Initialize analytics
export const initAnalytics = () => {
  // Check if analytics is disabled by user preference
  const analyticsDisabled = localStorage.getItem('raksha_analytics_disabled');
  if (analyticsDisabled === 'true') {
    return null;
  }

  let settings = { ...DEFAULT_SETTINGS };
  let data = loadAnalyticsData();
  
  // If no user ID exists, generate one
  if (!data.userId) {
    data.userId = generateId();
    saveAnalyticsData(data);
  }
  
  // Start a new session
  const sessionId = generateId();
  const timestamp = new Date().toISOString();
  
  // Save session info
  data.sessions = data.sessions || [];
  data.sessions.push({
    id: sessionId,
    start: timestamp,
    events: []
  });
  
  // Keep only the last 10 sessions
  if (data.sessions.length > 10) {
    data.sessions = data.sessions.slice(-10);
  }
  
  saveAnalyticsData(data);
  
  // Return current analytics context
  return {
    userId: data.userId,
    sessionId: sessionId,
    sessionStart: timestamp
  };
};

// Track an event
export const trackEvent = (eventName, eventData = {}) => {
  // Check if analytics is disabled
  const analyticsDisabled = localStorage.getItem('raksha_analytics_disabled');
  if (analyticsDisabled === 'true') {
    return;
  }
  
  // Load current data
  const data = loadAnalyticsData();
  if (!data.sessions || data.sessions.length === 0) {
    return;
  }
  
  // Find the current session
  const currentSession = data.sessions[data.sessions.length - 1];
  
  // Add event to the session
  currentSession.events.push({
    name: eventName,
    timestamp: new Date().toISOString(),
    data: eventData
  });
  
  // Keep only the last 1000 events per session
  if (currentSession.events.length > 1000) {
    currentSession.events = currentSession.events.slice(-1000);
  }
  
  // Save updated data
  saveAnalyticsData(data);
};

// Get user analytics data
export const getAnalyticsData = () => {
  return loadAnalyticsData();
};

// Opt out of analytics
export const optOut = () => {
  localStorage.setItem('raksha_analytics_disabled', 'true');
};

// Opt back into analytics
export const optIn = () => {
  localStorage.removeItem('raksha_analytics_disabled');
};

// Check if analytics is enabled
export const isEnabled = () => {
  return localStorage.getItem('raksha_analytics_disabled') !== 'true';
};

// Clear all analytics data
export const clearAnalyticsData = () => {
  localStorage.removeItem(DEFAULT_SETTINGS.storageKey);
};

// Helper: Load analytics data from storage
function loadAnalyticsData() {
  const storedData = localStorage.getItem(DEFAULT_SETTINGS.storageKey);
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (e) {
      return { userId: generateId(), sessions: [] };
    }
  }
  return { userId: generateId(), sessions: [] };
}

// Helper: Save analytics data to storage
function saveAnalyticsData(data) {
  try {
    localStorage.setItem(DEFAULT_SETTINGS.storageKey, JSON.stringify(data));
  } catch (e) {
    // If storage is full, clear older sessions
    if (data.sessions && data.sessions.length > 1) {
      data.sessions = data.sessions.slice(-Math.floor(data.sessions.length / 2));
      try {
        localStorage.setItem(DEFAULT_SETTINGS.storageKey, JSON.stringify(data));
      } catch (e) {
        // If still fails, just clear all but current session
        if (data.sessions && data.sessions.length > 0) {
          const currentSession = data.sessions[data.sessions.length - 1];
          data.sessions = [currentSession];
          localStorage.setItem(DEFAULT_SETTINGS.storageKey, JSON.stringify(data));
        }
      }
    }
  }
}