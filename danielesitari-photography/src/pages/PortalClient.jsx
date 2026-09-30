import { useState } from 'react';
import { Check, Download, LogOut } from 'lucide-react';
import { getClientByCode, updateSelectedPhotos, getEditedPhotos, getDaysUntilExpiration } from '../utils/clientManager';
import JSZip from 'jszip';              // ← ADAUGĂ AICI
import { saveAs } from 'file-saver';    // ← ȘI AICI

const PortalClient = () => {
  const [clientCode, setClientCode] = useState('');
  const [clientPIN, setClientPIN] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [editedPhotos, setEditedPhotos] = useState([]);
  const [selectedEditedPhotos, setSelectedEditedPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('originals');
  const [expirationInfo, setExpirationInfo] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const client = await getClientByCode(clientCode.trim(), clientPIN.trim());
    
    if (client) {
      setClientData(client);
      setIsAuthenticated(true);
      setSelectedPhotos(client.selectedPhotos || []);
      
      // Încarcă pozele editate
      const edited = await getEditedPhotos(client.code);
      setEditedPhotos(edited);
      
      // Verifică expirarea
      const expInfo = await getDaysUntilExpiration(client.code);
      setExpirationInfo(expInfo);
      
      // Setează tab-ul activ
      if (edited.length > 0) {
        setActiveTab('edited'); // Arată pozele editate dacă există
      }
    } else {
      setError('Cod sau PIN incorect. Te rugăm să verifici datele.');
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const selectAll = () => {
    if (clientData.photos) {
      setSelectedPhotos(clientData.photos.map(p => p.id));
    }
  };

  const deselectAll = () => {
    setSelectedPhotos([]);
  };

  const toggleEditedPhotoSelection = (photoId) => {
    setSelectedEditedPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else {
        return [...prev, photoId];
      }
    });
  };

  const selectAllEdited = () => {
    if (editedPhotos) {
      setSelectedEditedPhotos(editedPhotos.map(p => p.id));
    }
  };

  const deselectAllEdited = () => {
    setSelectedEditedPhotos([]);
  };

 const downloadSelectedEdited = async () => {
  if (selectedEditedPhotos.length === 0) {
    alert('Te rugăm să selectezi cel puțin o poză!');
    return;
  }
  
  const selectedPhotosData = editedPhotos.filter(p => selectedEditedPhotos.includes(p.id));
  
  console.log(`📦 Pregătire download ${selectedPhotosData.length} poze...`);
  
  try {
    if (selectedPhotosData.length === 1) {
      // Download direct pentru 1 poză
      console.log('📥 Download direct 1 poză...');
      const photo = selectedPhotosData[0];
      
      const response = await fetch(photo.fullsize);
      const blob = await response.blob();
      saveAs(blob, photo.filename);
      
      console.log('✅ Poză descărcată:', photo.filename);
      
    } else {
      // Download ZIP pentru 2+ poze
      console.log(`📦 Creare ZIP pentru ${selectedPhotosData.length} poze...`);
      
      const zip = new JSZip();
      
      for (let i = 0; i < selectedPhotosData.length; i++) {
        const photo = selectedPhotosData[i];
        console.log(`📥 Fetch poză ${i + 1}/${selectedPhotosData.length}: ${photo.filename}`);
        
        const response = await fetch(photo.fullsize);
        const blob = await response.blob();
        zip.file(photo.filename, blob);
      }
      
      console.log('🗜️ Generare ZIP...');
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      console.log('💾 Salvare ZIP...');
      const zipFilename = `${clientData.name.replace(/\s+/g, '_')}_Poze_Editate.zip`;
      saveAs(zipBlob, zipFilename);
      
      console.log('✅ ZIP descărcat:', zipFilename);
      alert(`✅ ZIP cu ${selectedPhotosData.length} poze descărcat!\n\n📁 Caută fișierul "${zipFilename}" în folderul Downloads.`);
    }
  } catch (error) {
    console.error('❌ Eroare download:', error);
    alert('❌ Eroare la descărcare. Verifică conexiunea la internet și încearcă din nou.');
  }
};

  const handleSubmitSelection = async () => {
    const success = await updateSelectedPhotos(clientData.code, selectedPhotos);
    if (success) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="font-serif text-3xl text-center mb-6">Portal Client</h1>
          <p className="text-brown-medium text-center mb-6 font-sans">
            Introdu codul și PIN-ul primit de la fotograf
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-sans font-medium mb-2">
                Cod Client
              </label>
              <input
                type="text"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark font-mono uppercase"
                placeholder="Ex: IOP-A3F5C2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2">
                PIN
              </label>
              <input
                type="text"
                value={clientPIN}
                onChange={(e) => setClientPIN(e.target.value)}
                className="w-full px-4 py-2 border border-brown-light rounded-sm focus:outline-none focus:border-brown-dark font-mono"
                placeholder="Ex: 123456"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Intră în Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-serif text-3xl mb-2">Bine ai venit, {clientData.name}!</h1>
              <p className="font-sans text-brown-medium">
                Sesiune: {new Date(clientData.sessionDate).toLocaleDateString('ro-RO')} - {clientData.sessionType}
              </p>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setClientData(null);
                setSelectedPhotos([]);
                setEditedPhotos([]);
                setSelectedEditedPhotos([]);
                setClientCode('');
                setClientPIN('');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tabs pentru Original vs Editate */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-brown-light/30">
            <button
              onClick={() => setActiveTab('originals')}
              className={`flex-1 px-6 py-4 font-sans font-medium transition-colors ${
                activeTab === 'originals'
                  ? 'text-brown-dark border-b-2 border-brown-dark'
                  : 'text-brown-medium hover:text-brown-dark'
              }`}
            >
              Poze Originale ({clientData.photos?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('edited')}
              className={`flex-1 px-6 py-4 font-sans font-medium transition-colors ${
                activeTab === 'edited'
                  ? 'text-brown-dark border-b-2 border-brown-dark'
                  : 'text-brown-medium hover:text-brown-dark'
              }`}
            >
              Poze Editate ✨ ({editedPhotos.length})
            </button>
          </div>
        </div>

        {/* Poze Originale */}
        {activeTab === 'originals' && (
          <>
            {/* Info și butoane selecție originale */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl mb-2">Pozele Tale</h2>
                  <p className="font-sans text-brown-medium">
                    {selectedPhotos.length} {selectedPhotos.length === 1 ? 'poză selectată' : 'poze selectate'} din {clientData.photos?.length || 0}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors text-sm"
                  >
                    Selectează Toate
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-4 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors text-sm"
                  >
                    Deselectează Toate
                  </button>
                  <button
                    onClick={handleSubmitSelection}
                    className="btn-primary text-sm"
                  >
                    Salvează Selecția
                  </button>
                </div>
              </div>

              {submitted && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-sm">
                  <p className="text-green-800 text-sm">
                    ✅ Selecția ta a fost salvată cu succes!
                  </p>
                </div>
              )}
            </div>

            {/* Galerie poze originale */}
            {clientData.photos && clientData.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clientData.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => togglePhotoSelection(photo.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                      selectedPhotos.includes(photo.id)
                        ? 'ring-4 ring-brown-dark'
                        : 'hover:ring-2 hover:ring-brown-light'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.id}
                      className="w-full aspect-square object-cover"
                    />
                    
                    {selectedPhotos.includes(photo.id) && (
                      <div className="absolute top-2 right-2 bg-brown-dark text-cream rounded-full p-2">
                        <Check size={20} />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-xs font-sans">
                        {photo.filename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="font-sans text-brown-medium">
                  Nu există fotografii încărcate încă.
                </p>
              </div>
            )}
          </>
        )}

        {/* Poze Editate */}
        {activeTab === 'edited' && (
          <>
            {/* Warning expirare */}
            {expirationInfo && !expirationInfo.isExpired && (
              <div className={`p-4 rounded-sm mb-4 ${
                expirationInfo.daysLeft <= 3 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⏰</span>
                  <div>
                    <p className={`font-medium ${
                      expirationInfo.daysLeft <= 3 ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {expirationInfo.daysLeft === 1 
                        ? '⚠️ Ultima zi pentru descărcare!' 
                        : expirationInfo.daysLeft <= 3
                        ? `⚠️ Doar ${expirationInfo.daysLeft} zile rămase!`
                        : `Mai ai ${expirationInfo.daysLeft} zile pentru descărcare`
                      }
                    </p>
                    <p className={`text-sm ${
                      expirationInfo.daysLeft <= 3 ? 'text-red-600' : 'text-yellow-700'
                    }`}>
                      Pozele vor fi șterse automat pe {new Date(expirationInfo.expiresAt).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {expirationInfo && expirationInfo.isExpired && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-sm mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <p className="font-medium text-red-800">
                      Perioada de descărcare a expirat
                    </p>
                    <p className="text-sm text-red-600">
                      Contactează fotograful pentru a re-uploada pozele
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info și butoane selecție editate */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl mb-2">Poze Editate ✨</h2>
                  <p className="font-sans text-brown-medium">
                    {selectedEditedPhotos.length} {selectedEditedPhotos.length === 1 ? 'poză selectată' : 'poze selectate'} din {editedPhotos.length}
                  </p>
                  <p className="font-sans text-sm text-brown-medium mt-1">
                    📥 Selectează pozele pe care dorești să le descarci (calitate FULL)
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={selectAllEdited}
                    className="px-4 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors text-sm"
                  >
                    Selectează Toate
                  </button>
                  <button
                    onClick={deselectAllEdited}
                    className="px-4 py-2 bg-brown-light text-brown-dark rounded-sm hover:bg-brown-medium transition-colors text-sm"
                  >
                    Deselectează Toate
                  </button>
                  <button
                    onClick={downloadSelectedEdited}
                    disabled={selectedEditedPhotos.length === 0}
                    className={`px-4 py-2 rounded-sm transition-colors text-sm flex items-center space-x-1 ${
                      selectedEditedPhotos.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Download size={16} />
                    <span>Descarcă Selectate ({selectedEditedPhotos.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Galerie poze editate */}
            {editedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {editedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => toggleEditedPhotoSelection(photo.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                      selectedEditedPhotos.includes(photo.id)
                        ? 'ring-4 ring-green-600'
                        : 'hover:ring-2 hover:ring-brown-light'
                    }`}
                  >
                    <img
                      src={photo.thumbnail}
                      alt={photo.id}
                      className="w-full aspect-square object-cover"
                    />
                    
                    {selectedEditedPhotos.includes(photo.id) && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-2">
                        <Check size={20} />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-xs font-sans flex items-center">
                        <span className="mr-1">✨</span>
                        {photo.filename}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📸</div>
                <p className="font-sans text-brown-medium mb-2">
                  Fotograful nu a încărcat încă pozele editate
                </p>
                <p className="font-sans text-sm text-brown-medium">
                  Vei primi o notificare când pozele vor fi gata!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PortalClient;