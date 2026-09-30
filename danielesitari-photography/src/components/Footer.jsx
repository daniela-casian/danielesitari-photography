import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brown-dark text-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl mb-2">DanieleSitari</h3>
            <p className="font-sans text-sm text-brown-light">
              The art of photography
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+373 233 123 45</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>
                  @danielsitari@gmail.com</span>
              </div>
            </div>
          </div>
  
          {/* Social Media */}
          <div>
            <h4 className="font-sans font-semibold mb-3">Urmărește-mă</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="hover:text-brown-light transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a
                href="#"
                className="hover:text-brown-light transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-brown-medium text-center text-sm">
          <p>© 2026 DanieleSitari Photography. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
