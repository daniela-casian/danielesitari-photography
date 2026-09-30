// Utility pentru generarea și gestionarea codurilor client
import {
  initDB,
  saveClientDB,
  savePhotosDB,
  getAllClientsDB,
  getClientPhotosDB,
  deleteClientDB,
  updateSelectedPhotosDB,
  migrateFromLocalStorage,
  saveEditedPhotosDB,
  getEditedPhotosDB,
  deleteEditedPhotosDB,
  getExpiredPhotosDB,
  cleanupExpiredPhotosDB,
  getExpiredCloudinaryIds
} from './indexedDBManager';

// Flag pentru utilizarea IndexedDB (setează true pentru storage nelimitat)
const USE_INDEXEDDB = true;

export const generateClientCode = (clientName) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const initials = clientName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 3);
  
  return `${initials}-${random}`;
};

export const generatePIN = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ========== FUNCȚII DUAL MODE (localStorage SAU IndexedDB) ==========

// Salvare client
export const saveClient = async (clientData) => {
  if (USE_INDEXEDDB) {
    await initDB();
    await saveClientDB(clientData);
    
    // Salvează pozele separat dacă există
    if (clientData.photos && clientData.photos.length > 0) {
      await savePhotosDB(clientData.code, clientData.photos);
    }
    
    return clientData;
  } else {
    // Fallback la localStorage
    const clients = getClientsSync();
    clients.push(clientData);
    localStorage.setItem('photography_clients', JSON.stringify(clients));
    return clientData;
  }
};

// Încarcă toți clienții
export const getClients = async () => {
  if (USE_INDEXEDDB) {
    await initDB();
    const clients = await getAllClientsDB();
    
    // Încarcă pozele pentru fiecare client
    const clientsWithPhotos = await Promise.all(
      clients.map(async (client) => {
        const photos = await getClientPhotosDB(client.code);
        return {
          ...client,
          photos: photos || []
        };
      })
    );
    
    return clientsWithPhotos;
  } else {
    // Fallback la localStorage
    return getClientsSync();
  }
};

// Versiune sincronă pentru localStorage (fallback)
export const getClientsSync = () => {
  const data = localStorage.getItem('photography_clients');
  return data ? JSON.parse(data) : [];
};

// Găsește client după cod și PIN
export const getClientByCode = async (code, pin) => {
  const clients = await getClients();
  return clients.find(client => client.code === code && client.pin === pin);
};

// Actualizează pozele unui client
export const updateClientPhotos = async (code, photos) => {
  if (USE_INDEXEDDB) {
    await initDB();
    
    // Salvează pozele în IndexedDB
    const result = await savePhotosDB(code, photos);
    
    // Actualizează și metadata clientului (photoCount)
    const clients = await getAllClientsDB();
    const client = clients.find(c => c.code === code);
    if (client) {
      client.photoCount = photos.length;
      await saveClientDB(client);
    }
    
    return result.success;
  } else {
    // Fallback la localStorage
    const clients = getClientsSync();
    const clientIndex = clients.findIndex(client => client.code === code);
    
    if (clientIndex !== -1) {
      clients[clientIndex].photos = photos;
      localStorage.setItem('photography_clients', JSON.stringify(clients));
      return true;
    }
    return false;
  }
};

// Actualizează pozele selectate de client
export const updateSelectedPhotos = async (code, selectedPhotos) => {
  if (USE_INDEXEDDB) {
    await initDB();
    await updateSelectedPhotosDB(code, selectedPhotos);
    return true;
  } else {
    // Fallback la localStorage
    const clients = getClientsSync();
    const clientIndex = clients.findIndex(client => client.code === code);
    
    if (clientIndex !== -1) {
      clients[clientIndex].selectedPhotos = selectedPhotos;
      clients[clientIndex].lastUpdated = new Date().toISOString();
      localStorage.setItem('photography_clients', JSON.stringify(clients));
      return true;
    }
    return false;
  }
};

// Verificare autentificare admin
export const getAdminClients = async (adminPassword) => {
  // Parolă simplă pentru demo - în producție ar fi pe backend
  if (adminPassword === 'admin2024') {
    return await getClients();
  }
  return null;
};

// Șterge client (inclusiv pozele)
export const deleteClient = async (code) => {
  if (USE_INDEXEDDB) {
    await initDB();
    await deleteClientDB(code);
    // Șterge și pozele editate
    await deleteEditedPhotosDB(code);
    return true;
  } else {
    // Fallback la localStorage
    const clients = getClientsSync();
    const filteredClients = clients.filter(c => c.code !== code);
    localStorage.setItem('photography_clients', JSON.stringify(filteredClients));
    return true;
  }
};

// Migrare automată la prima utilizare
export const initializeStorage = async () => {
  if (USE_INDEXEDDB) {
    await initDB();
    
    // Verifică dacă există date în localStorage
    const localData = localStorage.getItem('photography_clients');
    const migrationDone = localStorage.getItem('indexeddb_migration_done');
    
    if (localData && !migrationDone) {
      console.log('🔄 Începe migrarea către IndexedDB...');
      const result = await migrateFromLocalStorage();
      
      if (result.success) {
        localStorage.setItem('indexeddb_migration_done', 'true');
        console.log('✅ Migrare completă!');
      }
    }
  }
};

// ========== FUNCȚII PENTRU POZE EDITATE (CLOUDINARY) ==========

// Upload poze editate (metadata Cloudinary)
export const uploadEditedPhotos = async (clientCode, editedPhotosMetadata) => {
  if (USE_INDEXEDDB) {
    await initDB();
    const result = await saveEditedPhotosDB(clientCode, editedPhotosMetadata);
    
    // Actualizează metadata client
    const clients = await getAllClientsDB();
    const client = clients.find(c => c.code === clientCode);
    if (client) {
      client.editedPhotoCount = editedPhotosMetadata.length;
      await saveClientDB(client);
    }
    
    return result.success;
  }
  return false;
};

// Încarcă pozele editate
export const getEditedPhotos = async (clientCode) => {
  if (USE_INDEXEDDB) {
    await initDB();
    return await getEditedPhotosDB(clientCode);
  }
  return [];
};

// ========== CLEANUP AUTOMAT ==========

// Rulează cleanup la pornirea aplicației
export const runAutoCleanup = async () => {
  if (!USE_INDEXEDDB) return { deleted: 0 };
  
  try {
    console.log('🧹 Verificare poze expirate...');
    
    // Găsește pozele expirate
    const expiredPhotos = await getExpiredPhotosDB();
    
    if (expiredPhotos.length === 0) {
      console.log('✅ Nicio poză expirată');
      return { deleted: 0 };
    }
    
    console.log(`🗑️ Găsite ${expiredPhotos.length} poze expirate`);
    
    // Șterge din IndexedDB
    const dbResult = await cleanupExpiredPhotosDB();
    console.log(`✅ Șterse ${dbResult.deleted} poze din IndexedDB (${dbResult.freedMB} MB eliberat)`);
    
    // Listează pozele de șters din Cloudinary (pentru ștergere manuală/backend)
    const cloudinaryIds = await getExpiredCloudinaryIds(expiredPhotos);
    console.log('📋 Cloudinary IDs pentru ștergere:', cloudinaryIds);
    
    return {
      deleted: dbResult.deleted,
      freedMB: dbResult.freedMB,
      cloudinaryIds
    };
  } catch (error) {
    console.error('❌ Eroare cleanup:', error);
    return { error };
  }
};

// Verifică câte zile mai are clientul să descarce pozele
export const getDaysUntilExpiration = async (clientCode) => {
  if (!USE_INDEXEDDB) return null;
  
  const editedPhotos = await getEditedPhotosDB(clientCode);
  
  if (editedPhotos.length === 0) return null;
  
  const expiresAt = new Date(editedPhotos[0].expiresAt);
  const now = new Date();
  const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
  
  return {
    expiresAt,
    daysLeft,
    isExpired: daysLeft <= 0
  };
};