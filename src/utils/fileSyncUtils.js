const DB_NAME = 'kanban-fs-sync-db';
const STORE_NAME = 'handles';
const KEY = 'active-file-handle';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFileHandle(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFileHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearFileHandle() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function isFileSystemAccessSupported() {
  return 'showSaveFilePicker' in window;
}

export async function iniciarVinculoArquivo() {
  if (!isFileSystemAccessSupported()) {
    throw new Error('Navegador não suportado');
  }

  const handle = await window.showSaveFilePicker({
    suggestedName: 'meu-kanban-sync.json',
    types: [
      {
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] },
      },
    ],
  });

  await saveFileHandle(handle);
  return handle;
}

export async function verificarPermissao(handle, comInteracao = false) {
  const opts = { mode: 'readwrite' };
  if ((await handle.queryPermission(opts)) === 'granted') {
    return true;
  }
  
  if (comInteracao) {
    if ((await handle.requestPermission(opts)) === 'granted') {
      return true;
    }
  }
  
  return false;
}

export async function salvarNoArquivoFs(handle, jsonDataString) {
  const writable = await handle.createWritable();
  await writable.write(jsonDataString);
  await writable.close();
}

export async function lerDoArquivoFs(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  return text ? JSON.parse(text) : null;
}
