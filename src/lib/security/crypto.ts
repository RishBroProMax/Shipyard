import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Generates a cryptographically secure random hexadecimal secret of given byte length
 */
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generates a user-friendly high-entropy password
 */
export function generateSecurePassword(length = 24): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*(-_=+)";
  const randomBytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }
  return result;
}

/**
 * Encrypts plaintext using AES-256-GCM with the provided master key.
 * Master key must be a 32-byte hex string (64 characters) or will be derived via SHA-256.
 */
export function encryptSecret(plainText: string, masterKeyHex: string): string {
  const key = Buffer.from(
    masterKeyHex.length === 64 ? masterKeyHex : crypto.createHash("sha256").update(masterKeyHex).digest("hex"),
    "hex"
  );
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts ciphertext produced by encryptSecret.
 */
export function decryptSecret(encryptedPayload: string, masterKeyHex: string): string {
  try {
    const parts = encryptedPayload.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted payload format");
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const key = Buffer.from(
      masterKeyHex.length === 64 ? masterKeyHex : crypto.createHash("sha256").update(masterKeyHex).digest("hex"),
      "hex"
    );
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt secret: ${(error as Error).message}`);
  }
}

/**
 * Verifies a GitHub webhook signature (X-Hub-Signature-256).
 */
export function verifyGitHubSignature(rawPayload: string | Buffer, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = signatureHeader.substring(7);
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawPayload);
  const calculatedSignature = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(calculatedSignature, "hex")
    );
  } catch {
    return false;
  }
}
