import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Portofolio from './pages/Portofolio';
import CategoryView from './pages/CategoryView';
import PortalClient from './pages/PortalClient';
import AdminPanel from './pages/AdminPanel';
import { initializeStorage, runAutoCleanup } from './utils/clientManager';

function App() {
  // Inițializează IndexedDB și cleanup automat
  useEffect(() => {
    initializeStorage().then(() => {
      console.log('✅ IndexedDB inițializat! Storage nelimitat activat.');
      
      // Rulează cleanup automat pentru poze expirate
      runAutoCleanup().then(result => {
        if (result.deleted > 0) {
          console.log(`🧹 Cleanup: ${result.deleted} poze expirate șterse (${result.freedMB} MB eliberat)`);
          if (result.cloudinaryIds && result.cloudinaryIds.length > 0) {
            console.log('📋 Poze de șters din Cloudinary:', result.cloudinaryIds);
          }
        }
      });
    }).catch(error => {
      console.error('❌ Eroare inițializare IndexedDB:', error);
    });
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Home />} />
            <Route path="/portofolio" element={<Portofolio />} />
            <Route path="/portofolio/:category" element={<CategoryView />} />
            <Route path="/portal-client" element={<PortalClient />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;