import React from 'react';
import "../styles/SecurityTheme.css";

const SecurityInfo = () => {
  return (
    <div className="security-info-container secure-gradient">
      <div className="security-header-section">
        <div className="beta-badge">BETA</div>
        <div className="lock-icon-large">🔐</div>
        <h1 className="security-title">Security & Privacy</h1>
        <div className="security-subtitle">Protection at the core of everything we do</div>
        
        <div className="security-highlight-bar">
          <div className="highlight-item">
            <span className="highlight-icon">🛡️</span>
            <span>Client-Side</span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">🔒</span>
            <span>End-to-End</span>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">👁️</span>
            <span>Zero Knowledge</span>
          </div>
        </div>
      </div>
      
      <p className="security-intro">
        Raksha was designed with your security and privacy as the top priority. 
        We use military-grade encryption that happens entirely in your browser.
      </p>
      
      <div className="security-features">
        <div className="security-feature-card">
          <div className="feature-icon-wrapper">
            <div className="feature-icon">🔐</div>
          </div>
          <h3>End-to-End Encryption</h3>
          <p>
            All encryption and decryption happens directly in your browser using 
            AES-256 encryption, the same standard used by governments and banks.
          </p>
        </div>
        
        <div className="security-feature-card">
          <div className="feature-icon-wrapper">
            <div className="feature-icon">👤</div>
          </div>
          <h3>Zero Knowledge</h3>
          <p>
            We never see, store, or transmit your images. Everything stays on your 
            device, giving you complete control over your data.
          </p>
        </div>
        
        <div className="security-feature-card">
          <div className="feature-icon-wrapper">
            <div className="feature-icon">🔒</div>
          </div>
          <h3>Client-Side Processing</h3>
          <p>
            All operations happen locally on your device. Your original images and 
            encryption keys never leave your browser.
          </p>
        </div>
        
        <div className="security-feature-card">
          <div className="feature-icon-wrapper">
            <div className="feature-icon">🔍</div>
          </div>
          <h3>Transparent Code</h3>
          <p>
            Our code is open for inspection. You can verify that we handle 
            your data exactly as promised, with no hidden surprises.
          </p>
        </div>
      </div>
      
      <div className="security-process-section">
        <h2 className="section-title">How Raksha's Encryption Works</h2>
        <div className="process-flow">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Key Generation</h4>
              <p>A unique, random AES-256 encryption key is generated in your browser.</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Image Encryption</h4>
              <p>Your image is encrypted with this key using the Web Crypto API built into your browser.</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Secure Package</h4>
              <p>The encrypted image and key are packaged together in a JSON file that only you receive.</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Local Storage</h4>
              <p>The encryption file is downloaded directly to your device. No copies are stored or transmitted.</p>
            </div>
          </div>
          
          <div className="process-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>Decryption</h4>
              <p>When you decrypt, the process is reversed entirely within your browser.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="security-tips-section">
        <h2 className="section-title">Security Best Practices</h2>
        <div className="tips-cards">
          <div className="tip-card">
            <div className="tip-icon">🔑</div>
            <h4>Store Safely</h4>
            <p>Keep your encryption files in a secure location. Without these files, encrypted images cannot be recovered.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">👥</div>
            <h4>Share Carefully</h4>
            <p>Anyone with your encryption file can decrypt your images, so share them only with trusted recipients.</p>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">🔏</div>
            <h4>Strong Passwords</h4>
            <p>If storing encryption files in cloud services, use password-protected archives for added security.</p>
          </div>
          
          <div className="tip-card">
            <div class="tip-icon">💾</div>
            <h4>Backup Files</h4>
            <p>Keep backups of important encryption files in secure locations.</p>
          </div>
        </div>
      </div>
      
      <div className="analytics-box">
        <div className="analytics-header">
          <div className="analytics-icon">📊</div>
          <h3>Anonymous Analytics</h3>
        </div>
        <p>
          Raksha collects minimal, anonymous usage statistics to help improve the 
          application. This data:
        </p>
        <ul className="analytics-list">
          <li><span className="check-icon">✓</span> Is stored only on your device</li>
          <li><span className="check-icon">✓</span> Never includes your images or personal information</li>
          <li><span className="check-icon">✓</span> Is never transmitted to any server</li>
          <li><span className="check-icon">✓</span> Can be viewed, disabled, or cleared at any time</li>
        </ul>
        <div className="analytics-note">
          You can view or manage your analytics data using the "View Analytics" option in the footer.
        </div>
      </div>
      
      <div className="beta-info-section">
        <div className="beta-badge-large">BETA</div>
        <div className="beta-content">
          <h3>Beta Version Notice</h3>
          <p>Raksha is currently in beta testing. While we've implemented strong 
          security measures, the application is still under active development.</p>
          <p>We welcome your feedback to help make Raksha even more secure and 
          user-friendly while maintaining our commitment to privacy and security.</p>
        </div>
      </div>
      
      <div className="developer-section">
        <div className="developer-image">👨‍💻</div>
        <div className="developer-content">
          <h3>About Raksha</h3>
          <p>Raksha was created as a free, privacy-focused 
          alternative to cloud-based image sharing platforms.</p>
          <p>This project is provided free of charge and without advertisements, 
          with a commitment to protecting your privacy and data security.</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityInfo;