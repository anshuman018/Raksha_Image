import React, { useState, useRef } from "react";
import { encryptImage } from "../utils/cryptoUtils";
import { trackEvent } from "../utils/analytics";
import "../styles/SecurityTheme.css";

const ImageEncryptor = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [encryptionComplete, setEncryptionComplete] = useState(false);
  const fileInputRef = useRef(null);

  // Existing functions remain unchanged
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError("Please select a valid image file");
      trackEvent('encrypt_invalid_filetype', {
        attempted_type: file.type,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large. Maximum size is 10MB");
      trackEvent('encrypt_file_too_large', {
        fileSize: file.size,
        timestamp: new Date().toISOString()
      });
      return;
    }

    setSelectedImage(file);
    setError("");
    setEncryptionComplete(false);
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Track image selection
    trackEvent('encrypt_image_selected', {
      fileType: file.type,
      fileSize: file.size,
      timestamp: new Date().toISOString()
    });
  };

  const handleEncrypt = async () => {
    if (!selectedImage) {
      setError("Please select an image to encrypt");
      return;
    }

    setProcessing(true);
    setError("");
    const startTime = Date.now();

    try {
      // Read file as array buffer
      const buffer = await readFileAsArrayBuffer(selectedImage);
      
      // Encrypt the image
      const { encryptedData, key } = await encryptImage(buffer);

      // Create JSON with encrypted data
      const encryptionPackage = {
        encryptedData: encryptedData,
        key: key,
        filename: selectedImage.name,
        type: selectedImage.type,
        originalSize: selectedImage.size,
        encryptedAt: new Date().toISOString()
      };

      // Convert to JSON and create blob
      const jsonBlob = new Blob([JSON.stringify(encryptionPackage)], {
        type: 'application/json'
      });

      // Create download link
      const url = URL.createObjectURL(jsonBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `encrypted_${selectedImage.name.split('.')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setEncryptionComplete(true);

      // Track successful encryption
      trackEvent('encryption_complete', {
        fileType: selectedImage.type,
        fileSize: selectedImage.size,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Encryption failed:", err);
      setError("Failed to encrypt image. Please try again with a different image.");
      
      // Track encryption failure
      trackEvent('encryption_failed', {
        error: err.message,
        fileType: selectedImage.type,
        fileSize: selectedImage.size,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } finally {
      setProcessing(false);
    }
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview("");
    setError("");
    setEncryptionComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Track reset action
    trackEvent('encrypt_form_reset', {
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="encryptor-container secure-gradient">
      <div className="beta-badge">BETA</div>
      
      <div className="security-header">
        <div className="lock-icon">🔐</div>
        <h2>Secure Image Encryption</h2>
      </div>
      
      {/* Removed problematic security banner */}
      
      <div className="security-message">
        <p>Your images are encrypted directly in your browser. The encryption key never leaves your device, 
        ensuring that only you control access to your images.</p>
      </div>
      
      <div className="file-input secure-box">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageSelect}
          id="image-input"
          ref={fileInputRef}
        />
        <label htmlFor="image-input" className="btn secure-btn">
          <i className="icon">🖼️</i> Select Image to Encrypt
        </label>
        {selectedImage && <span className="file-name">{selectedImage.name}</span>}
      </div>
      
      {imagePreview && (
        <div className="image-preview secure-box">
          <div className="preview-header">
            <h4>Image Preview</h4>
            <div className="security-tag">Unencrypted</div>
          </div>
          <div className="preview-container">
            <img src={imagePreview} alt="Preview" className="preview-image" />
            <div className="preview-overlay">
              <div className="overlay-text">This image will be securely encrypted</div>
            </div>
          </div>
          
          <div className="preview-actions">
            <button 
              onClick={handleEncrypt} 
              disabled={processing}
              className="btn primary secure-btn-primary"
            >
              {processing ? (
                <>
                  <span className="spinner"></span> Encrypting Securely...
                </>
              ) : (
                <>🔒 Encrypt Image</>
              )}
            </button>
            
            <button 
              onClick={resetForm} 
              disabled={processing}
              className="btn secondary secure-btn-secondary"
            >
              ↺ Reset
            </button>
          </div>
        </div>
      )}
      
      {error && <div className="error-message secure-error">{error}</div>}
      
      {encryptionComplete && (
        <div className="encryption-success secure-box">
          <div className="success-badge">
            <span className="checkmark">✓</span> Encryption Complete
          </div>
          
          <p className="success-message">
            Your image has been successfully encrypted and downloaded as a JSON file.
          </p>
          
          <div className="next-steps">
            <h5>Next Steps:</h5>
            <ol>
              <li>Store the encryption file in a secure location</li>
              <li>To view your image, use the Decrypt feature</li>
              <li>Anyone with this file can decrypt your image</li>
            </ol>
          </div>
          
          <div className="encryption-warning">
            <span className="warning-icon">⚠️</span> 
            <span>If you lose the encryption file, your image cannot be recovered!</span>
          </div>
          
          <button onClick={resetForm} className="btn secure-btn">
            Encrypt Another Image
          </button>
        </div>
      )}
      
      <div className="footer-security-info">
        <h4>How Raksha Encrypts Your Images:</h4>
        <ul>
          <li>
            <strong>Local Processing:</strong> All encryption happens directly in your browser using strong AES-256 encryption.
          </li>
          <li>
            <strong>Zero Knowledge:</strong> We never see or store your original images or encryption keys.
          </li>
          <li>
            <strong>Full Control:</strong> Only you and those you share the encryption file with can decrypt your images.
          </li>
        </ul>
        
        <div className="beta-notice">
          <h4>Beta Version Information</h4>
          <p>Raksha is currently in beta and under active development.</p>
          <p>This service is completely free and ad-free, with a commitment to privacy and security.</p>
          <p>Your feedback helps improve the platform while maintaining our core privacy principles.</p>
        </div>
      </div>
    </div>
  );
};

export default ImageEncryptor;