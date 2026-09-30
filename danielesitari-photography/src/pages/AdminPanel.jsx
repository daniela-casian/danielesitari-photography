import { useState, useEffect } from 'react'; //ruleaza codul secundar dupa ce componenta a fost randata
import { 
  Users, Plus, Upload, Eye, Copy, Check, Lock,
  Calendar, Image as ImageIcon, Trash2
} from 'lucide-react';
import {
  generateClientCode,
  generatePIN,
  saveClient,
  getClients,
  updateClientPhotos,
  getAdminClients,
  deleteClient as deleteClientDB,
  uploadEditedPhotos,
  getEditedPhotos
} from '../utils/clientManager';
import { uploadMultipleToCloudinary } from '../utils/cloudinaryManager';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    clientId: '', 
    sessionDate: '',
    sessionType: 'individual'
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedPin, setCopiedPin] = useState(null);
  const [showUploadEdited, setShowUploadEdited] = useState(null);
  const [editedPhotos, setEditedPhotos] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const adminClients = await getAdminClients(password);
    if (adminClients !== null) {
      setIsAuthenticated(true);
      setClients(adminClients);
      await loadEditedPhotos(adminClients);
    } else {
      alert('Parolă incorectă!');
    }
  };

  const loadClients = async () => {
    const allClients = await getClients();
    setClients(allClients);
    await loadEditedPhotos(allClients);
  };

  const loadEditedPhotos = async (clientsList) => {
    const editedPhotosMap = {};
    for (const client of clientsList) {
      const edited = await getEditedPhotos(client.code);
      editedPhotosMap[client.code] = edited;
    }
    setEditedPhotos(editedPhotosMap);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    
    const code = generateClientCode(newClient.name);
    const pin = generatePIN();
    
    const clientData = {
      ...newClient,
      code,
      pin,
      photos: [],
      selectedPhotos: [],
      createdAt: new Date().toISOString()
    };

    await saveClient(clientData);
    await loadClients();
    setShowAddClient(false);
    setNewClient({
      name: '',
      email: '',
      phone: '',
      clientId: '',
      sessionDate: '',
      sessionType: 'individual'
    });
    
    alert(`Client adăugat!\nCod: ${code}\nPIN: ${pin}\n\nTrimite aceste date clientului!`);
  };

  const handleImageUpload = async (e, clientCode) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const totalFiles = files.length;
    let processed = 0;
    
    // Comprimare imagini pentru poze originale (preview)
    const uploadedPhotos = await Promise.all(
      files.map(async (file, index) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const scale = Math.min(1, MAX_WIDTH / img.width);
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
              
              processed++;
              console.log(`📸 Procesat ${processed}/${totalFiles} poze originale...`);
              
              resolve({
                id: `IMG_${Date.now()}_${index}`,
                url: compressedUrl,
                filename: file.name,
                uploadedAt: new Date().toISOString()
              });
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      })
    );

    const client = clients.find(c => c.code === clientCode);
    const existingPhotos = client?.photos || [];
    const updatedPhotos = [...existingPhotos, ...uploadedPhotos];
    
    console.log(`💾 Salvare ${uploadedPhotos.length} poze în IndexedDB...`);
    await updateClientPhotos(clientCode, updatedPhotos);
    
    await loadClients();
    alert(`✅ ${uploadedPhotos.length} fotografii încărcate cu succes!\n\nTotal poze client: ${updatedPhotos.length}`);
  };

  const handleEditedImageUpload = async (e, clientCode) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validare număr poze
    if (files.length > 500) {
      alert('⚠️ Maximum 500 poze per upload. Te rugăm să împarți în mai multe upload-uri.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log(`☁️ Începe upload ${files.length} poze în Cloudinary (calitate FULL)...`);
      
      // Upload în Cloudinary (calitate originală!)
      const uploadedPhotos = await uploadMultipleToCloudinary(
        files,
        (progress, current, total) => {
          setUploadProgress(progress);
          console.log(`☁️ Upload Cloudinary: ${current}/${total} (${progress}%)`);
        }
      );
      
      // Filtrează erorile
      const successfulUploads = uploadedPhotos.filter(p => !p.error);
      const failedUploads = uploadedPhotos.filter(p => p.error);
      
      if (successfulUploads.length > 0) {
        console.log(`💾 Salvare ${successfulUploads.length} metadata în IndexedDB...`);
        await uploadEditedPhotos(clientCode, successfulUploads);
        await loadClients();
      }
      
      setIsUploading(false);
      setUploadProgress(0);
      setShowUploadEdited(null);
      
      if (failedUploads.length > 0) {
        alert(`⚠️ ${successfulUploads.length} poze uploadate cu succes!\n${failedUploads.length} poze au eșuat.`);
      } else {
        alert(`✅ ${successfulUploads.length} poze editate uploadate cu succes!\n\n☁️ Stocate în Cloudinary - calitate FULL!\n📥 Clientul le poate descărca acum.\n⏰ Expire automat în 10 zile.`);
      }
    } catch (error) {
      console.error('Eroare upload:', error);
      alert('❌ Eroare la upload. Te rugăm să încerci din nou.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setCopiedPin(text);
      setTimeout(() => setCopiedPin(null), 2000);
    }
  };

  const deleteClient = async (code) => {
    if (confirm('Sigur vrei să ștergi acest client? Toate pozele (originale și editate) vor fi șterse permanent!')) {
      await deleteClientDB(code);
      await loadClients();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <Lock className="text-brown-dark" size={48} />
          </div>
          <h1 className="font-serif text-3xl text-center mb-6">Admin Panel</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-sans font-medium mb-2">
                Parolă Administrator
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                placeholder="Introdu parola"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary w-full">
              Intră în Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Users className="text-brown-dark" size={32} />
            <h1 className="font-serif text-4xl">Gestionare Clienți</h1>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddClient(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Client Nou</span>
            </button>
            
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPassword('');
              }}
              className="px-6 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Client List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-brown-light/30">
            <thead className="bg-brown-light/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  Client
                </th>
                 <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  ID Client
                </th> 
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  Sesiune
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  Cod & PIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  Poze
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  Expirare Editate
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-brown-medium uppercase tracking-wider">
                  Acțiuni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-brown-light/30">
              {clients.map((client) => (
                <tr key={client.code} className="hover:bg-brown-light/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-sans font-medium text-brown-dark">
                      {client.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm text-brown-medium">
                      {client.clientId || '—'} 
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-brown-medium">
                      <div>{client.email}</div>
                      <div>{client.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-brown-medium">
                        <Calendar size={14} className="mr-1" />
                        {new Date(client.sessionDate).toLocaleDateString('ro-RO')}
                      </div>
                      <div className="text-brown-medium capitalize">
                        {client.sessionType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => copyToClipboard(client.code, 'code')}
                        className="flex items-center space-x-1 text-sm text-brown-dark hover:text-brown-medium"
                      >
                        <span className="font-mono">{client.code}</span>
                        {copiedCode === client.code ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(client.pin, 'pin')}
                        className="flex items-center space-x-1 text-sm text-brown-dark hover:text-brown-medium"
                      >
                        <span className="font-mono">{client.pin}</span>
                        {copiedPin === client.pin ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center text-brown-medium">
                        <ImageIcon size={14} className="mr-1" />
                        {client.photos?.length || 0} originale
                      </div>
                      <div className="flex items-center text-green-700">
                        <span className="mr-1">✨</span>
                        {editedPhotos[client.code]?.length || 0} editate
                      </div>
                      <div className="text-brown-medium">
                        {client.selectedPhotos?.length || 0} selectate
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editedPhotos[client.code]?.length > 0 ? (
                      <div className="text-sm">
                        {(() => {
                          const expiresAt = new Date(editedPhotos[client.code][0].expiresAt);
                          const now = new Date();
                          const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
                          
                          return daysLeft > 0 ? (
                            <span className={daysLeft <= 3 ? 'text-red-600 font-medium' : 'text-brown-medium'}>
                              {daysLeft} {daysLeft === 1 ? 'zi' : 'zile'}
                            </span>
                          ) : (
                            <span className="text-red-600 font-medium">Expirat ❌</span>
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-brown-medium text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* Upload poze originale */}
                      <label className="cursor-pointer" title="Upload poze originale">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, client.code)}
                          className="hidden"
                        />
                        <div className="p-2 bg-brown-dark text-cream rounded hover:bg-brown-medium transition-colors">
                          <Upload size={18} />
                        </div>
                      </label>

                      {/* Upload poze editate (Cloudinary) */}
                      <button
                        onClick={() => setShowUploadEdited(client.code)}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Upload poze editate (Lightroom → Cloudinary)"
                      >
                        <div className="flex items-center">
                          <Upload size={18} />
                          <span className="text-xs ml-1">✨</span>
                        </div>
                      </button>

                      {/* View */}
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="p-2 bg-accent text-brown-dark rounded hover:bg-accent/80 transition-colors"
                        title="Vezi detalii"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteClient(client.code)}
                        className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        title="Șterge client"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clients.length === 0 && (
            <div className="text-center py-12 text-brown-medium">
              Nu există clienți încă. Adaugă primul client!
            </div>
          )}
        </div>

        {/* Add Client Modal */}
        {showAddClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="font-serif text-2xl mb-4">Adaugă Client Nou</h2>
              
              <form onSubmit={handleAddClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-sans font-medium mb-2">
                    ID / Număr Client
                  </label>
                  <input
                    type="text"
                    value={newClient.clientId}
                    onChange={(e) => setNewClient({...newClient, clientId: e.target.value})}
                    className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                    placeholder="ex: 001, C-2024..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium mb-2">
                    Nume Complet
                  </label>  
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium mb-2">
                    Data Sesiunii
                  </label>
                  <input
                    type="date"
                    value={newClient.sessionDate}
                    onChange={(e) => setNewClient({...newClient, sessionDate: e.target.value})}
                    className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium mb-2">
                    Tip Sesiune
                  </label>
                  <select
                    value={newClient.sessionType}
                    onChange={(e) => setNewClient({...newClient, sessionType: e.target.value})}
                    className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                  >
                    <option value="individual">Individual</option>
                    <option value="couple">Cuplu</option>
                    <option value="family">Familie</option>
                    <option value="wedding">Nuntă</option>
                    <option value="event">Eveniment</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddClient(false)}
                    className="px-6 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors"
                  >
                    Anulează
                  </button>
                  <button type="submit" className="btn-primary">
                    Adaugă Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Edited Photos Modal */}
        {showUploadEdited && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="mb-4">
                <h2 className="font-serif text-2xl mb-2">Upload Poze Editate</h2>
                <p className="text-sm text-brown-medium">
                  Încarcă pozele editate în Lightroom (calitate FULL, Cloudinary)
                </p>
              </div>

              {!isUploading ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-sans font-medium mb-2">
                      Selectează pozele editate (JPEG/PNG)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleEditedImageUpload(e, showUploadEdited)}
                      className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark"
                    />
                    <div className="mt-3 p-3 bg-blue-50 rounded-sm">
                      <p className="text-xs text-blue-800">
                        ☁️ <strong>Cloudinary Storage</strong> - Calitate originală
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Max 500 poze per upload | Storage unlimited
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        ⏰ Expire automat în 10 zile
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowUploadEdited(null)}
                      className="px-6 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors"
                    >
                      Anulează
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-6">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-brown-medium">Upload în Cloudinary...</span>
                      <span className="font-medium text-brown-dark">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-brown-light/30 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brown-medium to-brown-dark h-full transition-all duration-300 flex items-center justify-center"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        {uploadProgress > 10 && (
                          <span className="text-xs text-white font-medium">
                            {uploadProgress}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-brown-medium text-center">
                    ☁️ Upload poze calitate FULL - te rugăm așteaptă...
                  </p>
                </div>
              )}

              {editedPhotos[showUploadEdited]?.length > 0 && !isUploading && (
                <div className="mt-4 p-3 bg-green-50 rounded-sm">
                  <p className="text-sm text-green-800">
                    ✅ {editedPhotos[showUploadEdited].length} poze editate în cloud
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Client Modal */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 my-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-serif text-2xl mb-2">{selectedClient.name}</h2>
                  <div className="text-sm text-brown-medium space-y-1">
                    <p>Cod: <span className="font-mono">{selectedClient.code}</span></p>
                    <p>ID: <span className="font-mono">{selectedClient.clientId || '—'}</span></p> 
                    <p>PIN: <span className="font-mono">{selectedClient.pin}</span></p>
                    <p>Email: {selectedClient.email}</p>
                    <p>Telefon: {selectedClient.phone}</p>
                    <p>Data: {new Date(selectedClient.sessionDate).toLocaleDateString('ro-RO')}</p>
                    <p className="capitalize">Tip: {selectedClient.sessionType}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-brown-medium hover:text-brown-dark"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-sans font-medium mb-2">
                  Fotografii ({selectedClient.photos?.length || 0}) 
                  {selectedClient.selectedPhotos?.length > 0 && 
                    ` - ${selectedClient.selectedPhotos.length} selectate de client`
                  }
                </h3>
                
                {selectedClient.photos && selectedClient.photos.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                    {selectedClient.photos.map((photo) => (
                      <div 
                        key={photo.id}
                        className={`relative rounded overflow-hidden ${
                          selectedClient.selectedPhotos?.includes(photo.id)
                            ? 'ring-2 ring-green-500'
                            : ''
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.id}
                          className="w-full aspect-square object-cover"
                        />
                        {selectedClient.selectedPhotos?.includes(photo.id) && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-brown-medium text-center py-8">
                    Nu există fotografii încărcate
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="btn-primary w-full"
              >
                Închide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;