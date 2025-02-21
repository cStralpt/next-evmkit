import fs from "node:fs";
import path from "node:path";

type NonceData = {
  value: string;
  expires: number;
};

type NonceStore = {
  [key: string]: NonceData;
};

const STORE_PATH = path.join(process.cwd(), ".nonce-store.json");

function loadNonces(): NonceStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, "utf8");
      console.log("NonceStore: Loaded from disk");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("NonceStore: Error loading from disk:", error);
  }
  return {};
}

function saveNonces(nonces: NonceStore): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(nonces));
    console.log("NonceStore: Saved to disk");
  } catch (error) {
    console.error("NonceStore: Error saving to disk:", error);
  }
}

function cleanExpiredNonces(nonces: NonceStore): NonceStore {
  const now = Date.now();
  const cleaned = Object.entries(nonces).reduce((acc, [key, data]) => {
    if (now < data.expires) {
      acc[key] = data;
    }
    return acc;
  }, {} as NonceStore);

  if (Object.keys(cleaned).length !== Object.keys(nonces).length) {
    saveNonces(cleaned);
  }

  return cleaned;
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const nonces = loadNonces();
    cleanExpiredNonces(nonces);
  }, 60000);
}

export function setNonce(
  nonce: string,
  expiresIn: number = 5 * 60 * 1000,
): void {
  console.log("NonceStore: Setting nonce:", nonce);
  const nonces = loadNonces();

  nonces[nonce] = {
    value: nonce,
    expires: Date.now() + expiresIn,
  };

  saveNonces(nonces);
  console.log("NonceStore: Current nonces:", Object.keys(nonces));
}

export function verifyNonce(nonce: string): boolean {
  console.log("NonceStore: Verifying nonce:", nonce);
  const nonces = cleanExpiredNonces(loadNonces());
  console.log("NonceStore: Available nonces:", Object.keys(nonces));

  const data = nonces[nonce];
  if (!data) {
    console.log("NonceStore: Nonce not found");
    return false;
  }

  if (Date.now() > data.expires) {
    console.log("NonceStore: Nonce expired");
    delete nonces[nonce];
    saveNonces(nonces);
    return false;
  }

  delete nonces[nonce];
  saveNonces(nonces);

  console.log("NonceStore: Nonce verified successfully");
  return true;
}

export function getAllNonces(): string[] {
  const nonces = cleanExpiredNonces(loadNonces());
  return Object.keys(nonces);
}

export function clearNonces(): void {
  saveNonces({});
}
