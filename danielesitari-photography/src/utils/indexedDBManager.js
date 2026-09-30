// IndexedDB Manager - Storage nelimitat pentru poze
const DB_NAME = 'PhotographyDB';
const DB_VERSION = 1;
const STORE_CLIENTS = 'clients';
const STORE_PHOTOS = 'photos';

let db = null;

// Inițializare baza de date
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      
      // Store pentru clienți
      if (!database.objectStoreNames.contains(STORE_CLIENTS)) {
        const clientStore = database.createObjectStore(STORE_CLIENTS, { keyPath: 'code' });
        clientStore.createIndex('email', 'email', { unique: false });
        clientStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      
      // Store pentru poze (separat pentru economie memorie)
      if (!database.objectStoreNames.contains(STORE_PHOTOS)) {
        const photoStore = database.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
        photoStore.createIndex('clientCode', 'clientCode', { unique: false });
        photoStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }
      
      // Store pentru poze editate (Lightroom + Cloudinary)
      if (!database.objectStoreNames.contains('edited_photos')) {
        const editedStore = database.createObjectStore('edited_photos', { keyPath: 'id' });
        editedStore.createIndex('clientCode', 'clientCode', { unique: false });
        editedStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
        editedStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
};

// Salvare client (fără poze, doar metadata)
export const saveClientDB = async (clientData) => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_CLIENTS], 'readwrite');
    const store = transaction.objectStore(STORE_CLIENTS);
    
    // Salvează doar metadata clientului (fără array de poze)
    const { photos, ...clientMeta } = clientData;
    const request = store.put({
      ...clientMeta,
      photoCount: photos?.length || 0
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Salvare poze separate
export const savePhotosDB = async (clientCode, photos) => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PHOTOS], 'readwrite');
    const store = transaction.objectStore(STORE_PHOTOS);
    
    let completed = 0;
    const errors = [];
    
    photos.forEach(photo => {
      const request = store.put({
        ...photo,
        clientCode
      });
      
      request.onsuccess = () => {
        completed++;
        if (completed === photos.length) {
          resolve({ success: true, saved: completed, errors });
        }
      };
      
      request.onerror = () => {
        errors.push(photo.id);
        completed++;
        if (completed === photos.length) {
          resolve({ success: false, saved: completed - errors.length, errors });
        }
      };
    });
  });
};

// Încarcă toți clienții
export const getAllClientsDB = async () => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_CLIENTS], 'readonly');
    const store = transaction.objectStore(STORE_CLIENTS);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Încarcă pozele unui client
export const getClientPhotosDB = async (clientCode) => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PHOTOS], 'readonly');
    const store = transaction.objectStore(STORE_PHOTOS);
    const index = store.index('clientCode');
    const request = index.getAll(clientCode);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Șterge client și pozele sale
export const deleteClientDB = async (clientCode) => {
  await initDB();
  
  return new Promise(async (resolve, reject) => {
    try {
      // Șterge pozele
      const photos = await getClientPhotosDB(clientCode);
      const photoTransaction = db.transaction([STORE_PHOTOS], 'readwrite');
      const photoStore = photoTransaction.objectStore(STORE_PHOTOS);
      
      photos.forEach(photo => {
        photoStore.delete(photo.id);
      });
      
      // Șterge clientul
      const clientTransaction = db.transaction([STORE_CLIENTS], 'readwrite');
      const clientStore = clientTransaction.objectStore(STORE_CLIENTS);
      clientStore.delete(clientCode);
      
      resolve({ success: true, deletedPhotos: photos.length });
    } catch (error) {
      reject(error);
    }
  });
};

// Actualizează pozele selectate de client
export const updateSelectedPhotosDB = async (clientCode, selectedPhotoIds) => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_CLIENTS], 'readwrite');
    const store = transaction.objectStore(STORE_CLIENTS);
    const request = store.get(clientCode);
    
    request.onsuccess = () => {
      const client = request.result;
      if (client) {
        client.selectedPhotos = selectedPhotoIds;
        const updateRequest = store.put(client);
        updateRequest.onsuccess = () => resolve(client);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Client not found'));
      }
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Migrare de la localStorage la IndexedDB (doar o dată)
export const migrateFromLocalStorage = async () => {
  const localClients = localStorage.getItem('photography_clients');
  
  if (localClients) {
    try {
      const clients = JSON.parse(localClients);
      
      for (const client of clients) {
        // Salvează clientul (metadata)
        await saveClientDB(client);
        
        // Salvează pozele separat
        if (client.photos && client.photos.length > 0) {
          await savePhotosDB(client.code, client.photos);
        }
      }
      
      console.log('✅ Migrare completă! Poți șterge localStorage acum.');
      
      return { success: true, migratedClients: clients.length };
    } catch (error) {
      console.error('❌ Eroare migrare:', error);
      return { success: false, error };
    }
  }
  
  return { success: false, message: 'No data to migrate' };
};

// ========== FUNCȚII PENTRU POZE EDITATE (CLOUDINARY) ==========

// Salvare metadata poze editate (doar URL-uri Cloudinary, nu base64!)
export const saveEditedPhotosDB = async (clientCode, editedPhotosMetadata) => {
  await initDB();
  
  // Calculează data expirării (10 zile de la acum)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 10);
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['edited_photos'], 'readwrite');
    const store = transaction.objectStore('edited_photos');
    
    let completed = 0;
    const errors = [];
    
    editedPhotosMetadata.forEach(photo => {
      const request = store.put({
        id: photo.id,
        clientCode,
        url: photo.url, // URL Cloudinary
        thumbnail: photo.thumbnail,
        fullsize: photo.fullsize,
        filename: photo.filename,
        size: photo.size,
        format: photo.format,
        width: photo.width,
        height: photo.height,
        uploadedAt: photo.uploadedAt,
        expiresAt: expiresAt.toISOString(), // Data expirării
        isEdited: true
      });
      
      request.onsuccess = () => {
        completed++;
        if (completed === editedPhotosMetadata.length) {
          resolve({ success: true, saved: completed, errors, expiresAt });
        }
      };
      
      request.onerror = () => {
        errors.push(photo.id);
        completed++;
        if (completed === editedPhotosMetadata.length) {
          resolve({ success: false, saved: completed - errors.length, errors });
        }
      };
    });
  });
};

// Încarcă pozele editate ale unui client
export const getEditedPhotosDB = async (clientCode) => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['edited_photos'], 'readonly');
    const store = transaction.objectStore('edited_photos');
    const index = store.index('clientCode');
    const request = index.getAll(clientCode);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Șterge pozele editate ale unui client
export const deleteEditedPhotosDB = async (clientCode) => {
  await initDB();
  
  return new Promise(async (resolve, reject) => {
    try {
      const photos = await getEditedPhotosDB(clientCode);
      const transaction = db.transaction(['edited_photos'], 'readwrite');
      const store = transaction.objectStore('edited_photos');
      
      photos.forEach(photo => {
        store.delete(photo.id);
      });
      
      resolve({ success: true, deletedPhotos: photos.length });
    } catch (error) {
      reject(error);
    }
  });
};

// ========== CLEANUP AUTOMAT POZE EXPIRATE ==========

// Găsește toate pozele expirate
export const getExpiredPhotosDB = async () => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['edited_photos'], 'readonly');
    const store = transaction.objectStore('edited_photos');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const allPhotos = request.result;
      const now = new Date();
      
      // Filtrează pozele expirate
      const expired = allPhotos.filter(photo => {
        const expiresAt = new Date(photo.expiresAt);
        return expiresAt < now;
      });
      
      resolve(expired);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// Șterge pozele expirate din IndexedDB
export const cleanupExpiredPhotosDB = async () => {
  await initDB();
  
  const expiredPhotos = await getExpiredPhotosDB();
  
  if (expiredPhotos.length === 0) {
    return { deleted: 0, freed: 0 };
  }
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['edited_photos'], 'readwrite');
    const store = transaction.objectStore('edited_photos');
    
    let deleted = 0;
    let freedBytes = 0;
    
    expiredPhotos.forEach(photo => {
      const request = store.delete(photo.id);
      
      request.onsuccess = () => {
        deleted++;
        freedBytes += photo.size || 0;
        
        if (deleted === expiredPhotos.length) {
          resolve({ 
            deleted, 
            freed: freedBytes,
            freedMB: (freedBytes / 1024 / 1024).toFixed(2)
          });
        }
      };
      
      request.onerror = () => {
        deleted++;
        if (deleted === expiredPhotos.length) {
          resolve({ deleted, freed: freedBytes });
        }
      };
    });
  });
};

// Listează pozele expirate din Cloudinary (pentru ștergere manuală/backend)
export const getExpiredCloudinaryIds = async (expiredPhotos) => {
  const publicIds = expiredPhotos.map(photo => {
    // Extrage public_id din URL Cloudinary
    const urlParts = photo.url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
    return publicIdWithExt.replace(/\.[^/.]+$/, ''); // Remove extension
  });
  
  console.log('📋 Poze de șters din Cloudinary:', publicIds);
  
  return publicIds;
};