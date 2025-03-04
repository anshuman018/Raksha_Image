import React, { useState } from "react";
import { encryptImage } from "../utils/cryptoUtils";
import { QRCodeSVG } from "qrcode.react";
import FileSaver from "file-saver";

const ImageEncryptor = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [encryptedResult, setEncryptedResult] = useState(null);
  const [showQr, setShowQr] = useState(false);

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
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile) return;
    
    setProcessing(true);
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
        } catch (err) {
          console.error("Encryption process failed:", err);
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

  const handleCopyData = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
  };

  const getQrCodeData = () => {
    if (!encryptedResult) return "";
    return JSON.stringify({
      encryptedData: encryptedResult.encryptedData.substring(0, 20) + "...",
      key: encryptedResult.key,
      filename: encryptedResult.filename,
      type: encryptedResult.type
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
          Choose an Image
        </label>
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
            {processing ? "Encrypting..." : "Encrypt Image"}
          </button>
        </div>
      )}
      
      {encryptedResult && (
        <div className="result">
          <h3>Encryption Complete!</h3>
          
          <div className="data-field">
            <label>Encryption Key (KEEP THIS SECURE!):</label>
            <div className="data-display">
              <pre>{encryptedResult.key}</pre>
              <button onClick={() => handleCopyData(encryptedResult.key)} className="btn small">
                Copy
              </button>
            </div>
          </div>
          
          <div className="data-field">
            <label>Encrypted Data (excerpt):</label>
            <div className="data-display">
              <pre>{encryptedResult.encryptedData.substring(0, 50) + "..."}</pre>
              <button onClick={() => handleCopyData(encryptedResult.encryptedData)} className="btn small">
                Copy All
              </button>
            </div>
          </div>
          
          <div className="actions">
            <button onClick={handleDownloadData} className="btn">
              Download Encryption Data
            </button>
            <button onClick={() => setShowQr(!showQr)} className="btn">
              {showQr ? "Hide QR Code" : "Generate QR Code"}
            </button>
          </div>
          
          {showQr && (
            <div className="qr-container">
              <p>Note: QR codes have size limitations and may not work for large images</p>
              <QRCodeSVG value={getQrCodeData()} size={200} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageEncryptor;