// Dual Persistence Layer (localStorage + IndexedDB + Storage Persistence API)
// Keeps all saved code drafts, submission history, GCC results, and MCQ exam history intact across restarts — ZERO account needed.

const DB_NAME = 'elt3296_studio_vault_v1';
const STORE_NAME = 'kv';
const RECORD_KEY = 'app_state';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (err) {
      reject(err);
    }
  });
}

export async function idbReadState() {
  try {
    const db = await openDb();
    if (!db) return null;
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(RECORD_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

let writeTimer = null;
let pendingPayload = null;

export function idbWriteStateDebounced(payload) {
  pendingPayload = payload;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    const data = pendingPayload;
    writeTimer = null;
    if (!data) return;
    try {
      const db = await openDb();
      if (!db) return;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(data, RECORD_KEY);
    } catch {
      /* ignore idb write errors */
    }
  }, 160);
}

export async function requestDurableStorage() {
  try {
    if (navigator?.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch {
    /* ignore */
  }
}

export function formatSavedTime(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export function formatSavedClock(ts) {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch {
    return '';
  }
}
