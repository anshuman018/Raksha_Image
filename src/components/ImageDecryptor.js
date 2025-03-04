import React, { useState, useRef, useEffect } from "react";
import { decryptImage } from "../utils/cryptoUtils";
import FileSaver from "file-saver";
import { Html5QrcodeScanner } from "html5-qrcode";

const ImageDecryptor = () => {
  const [encryptedData, setEncryptedData] = useState("");
  const [key, setKey] = useState("");
  const [filename, setFilename] = useState("decrypted-image.jpg");
  const [fileType, setFileType] = useState("image/jpeg");
  const [jsonFile, setJsonFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [decryptedImageUrl, setDecryptedImageUrl] = useState("");
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  
  const scannerRef = useRef(null);
  const qrScannerDivRef = useRef(null);

  useEffect(() => {
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    setShowScanner(true);
    
    // Wait for the next render when div is available
    setTimeout(() => {
      if (qrScannerDivRef.current) {
        const scanner = new Html5QrcodeScanner(
          "qr-reader", 
          { 
            fps: 10, 
            qrbox: 250,
            rememberLastUsedCamera: true
          },
          /* verbose= */ false
        );
        
        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setShowScanner(false);
  };

  const onScanSuccess = (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);
      
      // Check if the QR code contains the necessary data
      if (qrData.key && (qrData.encryptedData || qrData.encryptedData === "")) {
        setKey(qrData.key);
        
        // If there's actual encrypted data in the QR code, use it
        // Otherwise, it might be just a key reference and the user will need to paste the data
        if (qrData.encryptedData && !qrData.encryptedData.endsWith("...")) {
          setEncryptedData(qrData.encryptedData);
        }
        
        // If filename and type are provided
        if (qrData.filename) setFilename(qrData.filename);
        if (qrData.type) setFileType(qrData.type);
        
        setError("");
        stopScanner();
      } else {
        setError("QR code doesn't contain valid encryption data");
      }
    } catch (err) {
      setError("Invalid QR code format");
    }
  };

  const onScanError = (err) => {
    // We can ignore most QR scan errors as they happen frequently until a valid QR is found
    if (err && !err.includes("No QR code found")) {
      console.error("QR Scan Error:", err);
    }
  };

  const handleJsonFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setJsonFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setEncryptedData(data.encryptedData || "");
          setKey(data.key || "");
          setFilename(data.filename || "decrypted-image.jpg");
          setFileType(data.type || "image/jpeg");
          setError("");
        } catch (err) {
          setError("Invalid JSON file format");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedData || !key) {
      setError("Both encrypted data and key are required");
      return;
    }

    setProcessing(true);
    setError("");
    
    try {
      const decryptedBlob = await decryptImage(encryptedData, key);
      
      // Create a URL for the decrypted blob
      const url = URL.createObjectURL(
        new Blob([decryptedBlob], { type: fileType })
      );
      
      setDecryptedImageUrl(url);
      setProcessing(false);
    } catch (err) {
      setError("Decryption failed. Please check your key and encrypted data.");
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (decryptedImageUrl) {
      FileSaver.saveAs(decryptedImageUrl, filename);
    }
  };

  return (
    <div className="decryptor-container">
      <h2>Decrypt Your Image</h2>
      
      <div className="input-methods">
        <div className="input-method">
          <h3>Option 1: Upload JSON file</h3>
          <div className="file-input">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleJsonFileChange}
              id="json-input"
            />
            <label htmlFor="json-input" className="btn">
              Upload Encryption JSON
            </label>
            {jsonFile && <span className="file-name">{jsonFile.name}</span>}
          </div>
        </div>
        
        <div className="input-method">
          <h3>Option 2: Scan QR Code</h3>
          <button onClick={showScanner ? stopScanner : startScanner} className="btn">
            {showScanner ? "Close Scanner" : "Scan QR Code"}
          </button>
          
          {showScanner && (
            <div className="qr-scanner-container">
              <div id="qr-reader" ref={qrScannerDivRef}></div>
              <p className="qr-hint">Position the QR code in the frame above</p>
            </div>
          )}
        </div>
        
        <div className="input-method">
          <h3>Option 3: Enter details manually</h3>
          <div className="manual-entry">
            <div className="input-group">
              <label>Encryption Key:</label>
              <textarea
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste your encryption key here"
              />
            </div>
            
            <div className="input-group">
              <label>Encrypted Data:</label>
              <textarea
                value={encryptedData}
                onChange={(e) => setEncryptedData(e.target.value)}
                placeholder="Paste your encrypted data here"
              />
            </div>
            
            <div className="input-group">
              <label>Filename (optional):</label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="decrypt-actions">
        <button 
          onClick={handleDecrypt} 
          disabled={processing || (!encryptedData || !key)}
          className="btn primary"
        >
          {processing ? "Decrypting..." : "Decrypt Image"}
        </button>
      </div>
      
      {decryptedImageUrl && (
        <div className="decrypted-result">
          <h3>Decryption Complete!</h3>
          <img src={decryptedImageUrl} alt="Decrypted" />
          <button onClick={handleDownload} className="btn">
            Download Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageDecryptor;