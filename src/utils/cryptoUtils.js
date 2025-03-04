const generateKey = async () => {
  // Generate a random encryption key using Web Crypto API
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
  
  // Export the key to raw format
  const exportedKey = await window.crypto.subtle.exportKey("raw", key);
  return bufferToBase64(exportedKey);
};

const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const base64ToBuffer = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const importKey = async (keyString) => {
  const keyData = base64ToBuffer(keyString);
  return window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptImage = async (imageData) => {
  // Generate a random key for AES-256 encryption
  const keyString = await generateKey();
  const key = await importKey(keyString);
  
  // Generate a random IV (Initialization Vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Convert image data to ArrayBuffer if it's not already
  let dataBuffer;
  if (imageData instanceof ArrayBuffer) {
    dataBuffer = imageData;
  } else if (imageData instanceof Blob) {
    dataBuffer = await imageData.arrayBuffer();
  } else {
    throw new Error("Unsupported image data format");
  }
  
  // Encrypt the image data
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    dataBuffer
  );
  
  // Combine IV and encrypted data and convert to Base64
  const ivAndData = new Uint8Array(iv.byteLength + encryptedData.byteLength);
  ivAndData.set(new Uint8Array(iv), 0);
  ivAndData.set(new Uint8Array(encryptedData), iv.byteLength);
  
  const encryptedBase64 = bufferToBase64(ivAndData);
  
  return {
    encryptedData: encryptedBase64,
    key: keyString
  };
};

const decryptImage = async (encryptedBase64, keyString) => {
  try {
    // Import the key
    const key = await importKey(keyString);
    
    // Decode Base64 to get IV and encrypted data
    const encryptedBuffer = base64ToBuffer(encryptedBase64);
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = encryptedBuffer.slice(0, 12);
    const encryptedData = encryptedBuffer.slice(12);
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv)
      },
      key,
      encryptedData
    );
    
    return new Blob([decryptedBuffer]);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid key or corrupted data");
  }
};

export { encryptImage, decryptImage, generateKey };