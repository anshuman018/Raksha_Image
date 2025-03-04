/**
 * Utility functions for image encryption and decryption using Web Crypto API
 */

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a random encryption key
async function generateKey() {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export key to base64 format
async function exportKey(key) {
  const rawKey = await window.crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(rawKey);
}

// Import key from base64 format
async function importKey(keyBase64) {
  const keyBuffer = base64ToArrayBuffer(keyBase64);
  return await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt image data
export async function encryptImage(imageBuffer) {
  // Generate a random initialization vector
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Generate a new encryption key
  const key = await generateKey();
  
  // Encrypt the image data
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    imageBuffer
  );
  
  // Combine IV and encrypted data
  const ivAndEncryptedData = new Uint8Array(iv.length + encryptedData.byteLength);
  ivAndEncryptedData.set(iv, 0);
  ivAndEncryptedData.set(new Uint8Array(encryptedData), iv.length);
  
  // Export key and convert data to base64 for storage
  const keyBase64 = await exportKey(key);
  const encryptedBase64 = arrayBufferToBase64(ivAndEncryptedData);
  
  return {
    encryptedData: encryptedBase64,
    key: keyBase64
  };
}

// Decrypt image data
export async function decryptImage(encryptedBase64, keyBase64) {
  // Convert base64 to array buffers
  const encryptedBuffer = base64ToArrayBuffer(encryptedBase64);
  
  // Extract IV and encrypted data
  const iv = encryptedBuffer.slice(0, 12);
  const encryptedData = encryptedBuffer.slice(12);
  
  // Import the key
  const key = await importKey(keyBase64);
  
  // Decrypt the data
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv)
    },
    key,
    encryptedData
  );
  
  return decryptedData;
}