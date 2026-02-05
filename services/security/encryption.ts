
/**
 * Serviço de Criptografia LifeSync
 * Utiliza a Web Crypto API para criptografia AES-GCM 256-bit.
 * Os dados são criptografados antes de serem salvos no Firebase.
 */

const ENCRYPTION_SALT = "lifesync_secure_salt_v1";

const keyCache = new Map<string, CryptoKey>();

async function getKey(userId: string): Promise<CryptoKey> {
  if (keyCache.has(userId)) {
    return keyCache.get(userId)!;
  }

  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(userId + ENCRYPTION_SALT),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(ENCRYPTION_SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  keyCache.set(userId, derivedKey);
  return derivedKey;
}

export async function encryptField(text: string | number, userId: string): Promise<string> {
  if (text === undefined || text === null) return "";
  const stringToEncrypt = String(text);
  const enc = new TextEncoder();
  const key = await getKey(userId);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(stringToEncrypt)
  );

  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptField(encryptedBase64: string, userId: string): Promise<string> {
  try {
    if (!encryptedBase64 || typeof encryptedBase64 !== 'string') return encryptedBase64;
    
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    const key = await getKey(userId);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Erro na descriptografia. Verificando se o dado é legado/plano.", e);
    return encryptedBase64; // Fallback para dados antigos não criptografados
  }
}
