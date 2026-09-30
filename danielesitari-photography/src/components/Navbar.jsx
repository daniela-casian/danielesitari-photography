import { useState } from 'react'; // pentru a salva date care se schimb un timp
import { Link, useLocation } from 'react-router-dom'; //permite sa obtii locatia corecte
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About me' },
    { path: '/portofolio', label: 'Portofolio' },
    { path: '/portal-client', label: 'Portal Client' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brown-dark/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
                 {/* Logo - Imagine */}
<Link to="/" className="z-10">
  <img 
    src={location.pathname === '/' ? "/images/logo.png" : "/images/logo.png"} 
    alt="Daniele Sitari" 
    className="h-12 md:h-14 w-auto"
  />
</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  isActive(item.path) ? 'text-brown-light' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-cream hover:text-brown-light transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-brown-dark border-t border-brown-medium">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 text-base font-sans text-cream hover:text-brown-light hover:bg-brown-medium/20 rounded-sm transition-colors ${
                  isActive(item.path) ? 'bg-brown-medium/30 text-brown-light' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
