import React, { useState } from "react";
import { decryptImage } from "../utils/cryptoUtils";
import { trackEvent } from "../utils/analytics";

const ImageDecryptor = () => {
  const [jsonFile, setJsonFile] = useState(null);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [decryptData, setDecryptData] = useState(null);

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
    <div className="decryptor-container">
      <h2>Decrypt Your Image</h2>
      
      <div className="file-input">
        <input 
          type="file" 
          accept=".json,application/json" 
          onChange={handleFileUpload}
          id="json-input"
        />
        <label htmlFor="json-input" className="btn">
          <i className="icon">📁</i> Upload Encryption File
        </label>
        {jsonFile && <span className="file-name">{jsonFile.name}</span>}
      </div>
      
      {jsonFile && !error && decryptData && (
        <div className="decrypt-action">
          <p className="help-text">File loaded successfully. Click the button below to decrypt your image.</p>
          <button 
            onClick={handleDecrypt} 
            disabled={processing}
            className="btn primary"
          >
            {processing ? "Decrypting..." : "🔓 Decrypt Image"}
          </button>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {decryptedImageUrl && (
        <div className="decrypted-result">
          <h3>🎉 Decryption Complete!</h3>
          <img src={decryptedImageUrl} alt="Decrypted" />
          
          <button onClick={downloadDecryptedImage} className="btn primary">
            💾 Download Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageDecryptor;