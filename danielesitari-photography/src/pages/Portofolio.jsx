import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categories, getAllImages, getImagesByCategory } from '../data/portfolio';

const Portofolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const images = getImagesByCategory(selectedCategory);

  const scrollToGallery = () => {
    document.getElementById('gallery')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920)',
            filter: 'brightness(0.5)'
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-7xl mb-4">
            Portofolio
          </h1>
          <p className="font-sans text-xl md:text-2xl mb-8">
            Momente capturate cu emoție și lumină
          </p>
          
          <button
            onClick={scrollToGallery}
            className="inline-flex items-center space-x-2 text-white hover:text-brown-light transition-colors"
          >
            <span className="font-sans">Explorează galeria</span>
            <ChevronDown className="animate-bounce" size={24} />
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <section id="gallery" className="py-12 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-8 py-3 rounded-full font-sans font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-brown-dark text-cream shadow-lg'
                    : 'bg-brown-light/40 text-brown-dark hover:bg-brown-light'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Link
                key={image.id}
                to={`/portofolio/${image.category}`}
                className="group relative overflow-hidden rounded-lg aspect-[4/5] cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/80 via-brown-dark/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-sans text-lg font-medium">
                      {image.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title">Să creăm ceva<br/>frumos împreună</h2>
          <p className="section-subtitle mb-8">
            Completează formularul și te voi contacta în maxim 24h<br/>
            pentru a stabili detaliile ședinței tale.
          </p>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-left">
                Nume/Prenume
              </label>
              <input
                type="text"
                placeholder="Numele tău"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-left">
                Data Ședinței foto
              </label>
              <input
                type="date"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-left">
                Numar telefon
              </label>
              <input
                type="tel"
                placeholder="Numărul tău"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-left">
                Locația
              </label>
              <input
                type="text"
                placeholder="Exemplu: Chișinău"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-left">
                Tipul ședinței foto
              </label>
              <select className="input-field">
                <option>Individual</option>
                <option>Familie</option>
                <option>Car/Moto</option>
                <option>Wedding</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2 text-left">
                Email
              </label>
              <input
                type="email"
                placeholder="email@exemplu.md"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-sans font-medium mb-2 text-left">
                Spune mai multe detalii despre ședință
              </label>
              <textarea
                rows="4"
                placeholder="Detalii suplimentare..."
                className="input-field resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="btn-primary w-full md:w-auto px-16">
                Trimite
              </button>
              <p className="text-sm text-brown-medium mt-4">
                Îți voi răspunde în cel mai scurt timp
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Portofolio;
