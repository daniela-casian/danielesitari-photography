import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getImagesByCategory, categories } from '../data/portfolio';

const CategoryView = () => {
  const { category } = useParams();
  const images = getImagesByCategory(category);
  const categoryInfo = categories.find(cat => cat.id === category);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-4xl mb-4">Categoria nu a fost găsită</h2>
          <Link to="/portofolio" className="btn-primary">
            Înapoi la Portofolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-cream">
      {/* Header */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/portofolio" 
            className="inline-flex items-center space-x-2 text-brown-medium hover:text-brown-dark transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-sans">Înapoi la Portofolio</span>
          </Link>
          
          <h1 className="font-serif text-5xl md:text-6xl mb-4">
            {categoryInfo.label}
          </h1>
          <p className="font-sans text-lg text-brown-medium">
            Momente capturate cu emoție și lumină
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`group relative overflow-hidden rounded-lg cursor-pointer ${
                  index % 7 === 0 ? 'sm:col-span-2 sm:row-span-2' : 'aspect-square'
                }`}
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
              </div>
            ))}
          </div>
        </div>
      </div>

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
              <input
                type="text"
                placeholder="Numele tău"
                className="input-field"
              />
            </div>

            <div>
              <input
                type="date"
                className="input-field"
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Numărul tău"
                className="input-field"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Locația"
                className="input-field"
              />
            </div>

            <div>
              <select className="input-field" defaultValue={category}>
                <option value="individual">Individual</option>
                <option value="family">Familie</option>
                <option value="carmoto">Car/Moto</option>
                <option value="wedding">Wedding</option>
              </select>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <textarea
                rows="4"
                placeholder="Spune mai multe detalii despre ședință"
                className="input-field resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="btn-primary w-full md:w-auto px-16">
                Trimite
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CategoryView;
