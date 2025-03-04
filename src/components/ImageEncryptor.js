import React, { useState } from "react";
import { encryptImage } from "../utils/cryptoUtils";
import FileSaver from "file-saver";
import { trackEvent } from "../utils/analytics";

const ImageEncryptor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.match("image.*")) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Reset results
      setEncryptedResult(null);
      
      // Track file selection - note we don't track the file content, only the type and size
      trackEvent('encrypt_file_selected', {
        fileType: file.type,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile) return;
    
    setProcessing(true);
    const startTime = Date.now();
    
    try {
      // Read file as ArrayBuffer for encryption
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const result = await encryptImage(reader.result);
          setEncryptedResult({
            encryptedData: result.encryptedData,
            key: result.key,
            filename: selectedFile.name,
            type: selectedFile.type
          });
          
          // Track successful encryption
          trackEvent('encryption_complete', {
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
            processingTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error("Encryption process failed:", err);
          
          // Track encryption failure
          trackEvent('encryption_failed', {
            fileType: selectedFile.type,
            fileSize: selectedFile.size,
            error: err.message,
            timestamp: new Date().toISOString()
          });
        } finally {
          setProcessing(false);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error("Encryption failed:", error);
      setProcessing(false);
    }
  };

  const handleDownloadData = () => {
    if (!encryptedResult) return;
    
    // Create a JSON file with all necessary data
    const dataObj = {
      encryptedData: encryptedResult.encryptedData,
      key: encryptedResult.key,
      filename: encryptedResult.filename,
      type: encryptedResult.type
    };
    
    const blob = new Blob([JSON.stringify(dataObj)], { type: "application/json" });
    FileSaver.saveAs(blob, `encrypted_${encryptedResult.filename}.json`);
    
    // Track download
    trackEvent('encrypted_file_downloaded', {
      fileType: encryptedResult.type,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="encryptor-container">
      <h2>Encrypt Your Image</h2>
      
      <div className="file-input">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          id="image-input"
        />
        <label htmlFor="image-input" className="btn">
          <i className="icon">📁</i> Choose an Image
        </label>
        {selectedFile && <span className="file-name">{selectedFile.name}</span>}
      </div>
      
      {previewUrl && (
        <div className="preview">
          <h3>Preview</h3>
          <img src={previewUrl} alt="Preview" />
          <button 
            onClick={handleEncrypt} 
            disabled={processing}
            className="btn primary"
          >
            {processing ? "Encrypting..." : "🔒 Encrypt Image"}
          </button>
        </div>
      )}
      
      {encryptedResult && (
        <div className="result">
          <h3>🎉 Encryption Complete!</h3>
          
          <div className="data-field">
            <label>Your file has been encrypted successfully.</label>
            <p className="help-text">Download the encryption file and keep it safe. You'll need to upload this file to decrypt your image later.</p>
          </div>
          
          <div className="actions">
            <button onClick={handleDownloadData} className="btn primary">
              💾 Download Encrypted File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEncryptor;