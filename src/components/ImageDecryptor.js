import React, { useState } from "react";
import { decryptImage } from "../utils/cryptoUtils";
import { trackEvent } from "../utils/analytics";
import "../styles/SecurityTheme.css";

const ImageDecryptor = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [decryptData, setDecryptData] = useState(null);

  // Existing functions remain unchanged
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setJsonFile(file);
    setError("");
    setDecryptedImageUrl("");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate if the JSON has required fields
        if (!data.encryptedData || !data.key) {
          setError("Invalid encryption file. Missing required data.");
          
          // Track invalid file
          trackEvent('decrypt_invalid_file', {
            fileSize: file.size,
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        setDecryptData(data);
        
        // Track valid file upload
        trackEvent('decrypt_file_uploaded', {
          fileSize: file.size,
          hasFilename: !!data.filename,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        setError("Invalid file format. Please upload a valid encryption JSON file.");
        
        // Track parse error
        trackEvent('decrypt_parse_error', {
          fileSize: file.size,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    reader.readAsText(file);
  };

  const handleDecrypt = async () => {
    if (!decryptData) {
      setError("Please upload a valid encryption file first");
      return;
    }
    
    setProcessing(true);
    setError("");
    const startTime = Date.now();
    
    try {
      const decryptedBuffer = await decryptImage(
        decryptData.encryptedData, 
        decryptData.key
      );
      
      const blob = new Blob([decryptedBuffer], { type: decryptData.type || "image/png" });
      const url = URL.createObjectURL(blob);
      setDecryptedImageUrl(url);
      
      // Track successful decryption
      trackEvent('decryption_complete', {
        fileType: decryptData.type || "image/png",
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Decryption failed:", err);
      setError("Decryption failed. The file may be corrupted or invalid.");
      
      // Track decryption failure
      trackEvent('decryption_failed', {
        error: err.message,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadDecryptedImage = () => {
    if (!decryptedImageUrl || !decryptData) return;
    
    const link = document.createElement('a');
    link.href = decryptedImageUrl;
    link.download = decryptData.filename || 'decrypted_image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track image download
    trackEvent('decrypted_image_downloaded', {
      filename: decryptData.filename || 'decrypted_image.png',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="decryptor-container secure-gradient">
      <div className="beta-badge">BETA</div>
      
      <div className="security-header">
        <div className="lock-icon">🔓</div>
        <h2>Secure Image Decryption</h2>
      </div>
      
      {/* Removed problematic security banner */}
      
      <div className="security-message">
        <p>Your data never leaves your device. Decryption happens entirely in your browser, 
        ensuring complete privacy for your sensitive images.</p>
      </div>
      
      <div className="file-input secure-box">
        <input 
          type="file" 
          accept=".json,application/json" 
          onChange={handleFileUpload}
          id="json-input"
        />
        <label htmlFor="json-input" className="secure-btn">
          <i className="icon">📁</i> Upload Encryption File
        </label>
        {jsonFile && <span className="file-name">{jsonFile.name}</span>}
      </div>
      
      {jsonFile && !error && decryptData && (
        <div className="decrypt-action secure-box">
          <div className="security-indicator">
            <div className="pulse-ring"></div>
            <span>Secure Connection Active</span>
          </div>
          <p className="help-text">Encryption file loaded. Click below to decrypt your image securely.</p>
          <button 
            onClick={handleDecrypt} 
            disabled={processing}
            className="secure-btn-primary"
          >
            {processing ? (
              <>
                <span className="spinner"></span> Decrypting Securely...
              </>
            ) : (
              <>🔓 Decrypt Image</>
            )}
          </button>
        </div>
      )}
      
      {error && <div className="secure-error">{error}</div>}
      
      {decryptedImageUrl && (
        <div className="decrypted-result secure-box">
          <div className="success-badge">
            <span className="checkmark">✓</span> Decrypted Securely
          </div>
          
          <div className="image-container">
            <img src={decryptedImageUrl} alt="Decrypted" className="secure-image" />
            <div className="watermark">Decrypted with Raksha</div>
          </div>
          
          <button onClick={downloadDecryptedImage} className="secure-btn-download">
            💾 Download Securely
          </button>
          
          <p className="security-note">
            Your decrypted image is only stored in your browser's memory and will be erased when you leave this page.
          </p>
        </div>
      )}
      
      <div className="footer-security-info">
        <h4>How We Keep Your Data Secure:</h4>
        <ul>
          <li>
            <strong>No Server Storage:</strong> Your images and encryption keys are never transmitted or stored on our servers.
          </li>
          <li>
            <strong>Local Processing:</strong> All decryption happens directly in your browser.
          </li>
          <li>
            <strong>Maximum Privacy:</strong> Only someone with your encryption file can decrypt your images.
          </li>
        </ul>
        
        <div className="beta-notice">
          <h4>Beta Version Notice</h4>
          <p>Raksha is currently in beta development by Anshuman Singh.</p>
          <p>This service is completely free and ad-free, with a commitment to your privacy and security.</p>
        </div>
      </div>
    </div>
  );
};

export default ImageDecryptor;