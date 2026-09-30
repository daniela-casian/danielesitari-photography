import { Link } from 'react-router-dom';
import { ChevronDown, Camera, Award, Users } from 'lucide-react';
import { categories, getImagesByCategory } from '../data/portfolio';

const Home = () => {
  const scrollToAbout = () => {
    document.getElementById('about-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const scrollToPortfolio = () => {
    document.getElementById('portfolio-preview')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const scrollToContact = () => {
    document.getElementById('contact-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/image.png)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-montecarlo text-6xl md:text-7xl lg:text-8xl mb-4 tracking-tight leading-none text-white">
  Daniel Sitari
</h1>
          <p className="font-sans text-xl md:text-2xl mb-8 tracking-wide">
            The art of photography
          </p>
          <button
            onClick={scrollToAbout}
            className="btn-secondary"
          >
            Rezerva acum
          </button>
          
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <button
              onClick={scrollToAbout}
              className="animate-bounce text-white hover:text-brown-light transition-colors"
              aria-label="Scroll down"
            >
              <ChevronDown size={40} />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="/images/daniels.png"
                  alt="Portrait 1"
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
                <img
                  src="/images/sitaridaniel.png"
                  alt="Portrait 2"
                  className="rounded-lg shadow-lg w-full h-64 object-cover mt-8"
                />
              </div>
            </div>

            {/* About Text */}
            <div>
              <h2 className="font-serif text-5xl mb-6">About Me</h2>
              <p className="font-sans text-lg text-brown-medium mb-4 leading-relaxed">
                Salut! Sunt Daniel, fotograf profesionist cu o pasiune pentru 
                capturarea momentelor speciale. Pentru mine, fotografia nu este 
                doar o meserie, ci o artă prin care transformăm emoțiile și 
                momentele trecătoare în amintiri veșnice.
              </p>
              <p className="font-sans text-lg text-brown-medium mb-6 leading-relaxed">
                Cu peste 5 ani de experiență în domeniu, am avut privilegiul să 
                lucrez cu sute de clienți, capturând cele mai importante momente 
                din viața lor - de la nunți și evenimente de familie, până la 
                portrete individuale și sesiuni foto auto.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-4xl font-serif text-brown-dark mb-2">+5</div>
                  <div className="text-sm font-sans text-brown-medium">
                    Ani de experiență
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif text-brown-dark mb-2">+150</div>
                  <div className="text-sm font-sans text-brown-medium">
                    Nunți capturate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-serif text-brown-dark mb-2">100%</div>
                  <div className="text-sm font-sans text-brown-medium">
                    Rată de satisfacție
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section id="portfolio-preview" className="py-20 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title">Portofolio</h2>
          <p className="section-subtitle">
            Momente capturate cu emoție și lumină
          </p>

          {/* Category Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.slice(1).map((category) => {
              const images = getImagesByCategory(category.id);
              return (
                <Link
                  key={category.id}
                  to={`/portofolio/${category.id}`}
                  className="group relative overflow-hidden rounded-lg aspect-square"
                >
                  <img
                    src={images[0]?.url}
                    alt={category.labelRo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-brown-dark/50 group-hover:bg-brown-dark/30 transition-colors flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-white font-sans text-xl font-semibold uppercase tracking-wide">
                        {category.label}
                      </h3>
                      <div className="w-12 h-0.5 bg-brown-light mx-auto mt-2 transform scale-0 group-hover:scale-100 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/portofolio" className="btn-primary">
              Explorează galeria
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-section" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title">Să creăm ceva<br/>frumos împreună</h2>
          <p className="section-subtitle mb-12">
            Completează formularul și te voi contacta în maxim 24h<br/>
            pentru a stabili detaliile ședinței tale.
          </p>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-sans font-medium mb-2">
                Nume/Prenume
              </label>
              <input
                type="text"
                placeholder="Numele tău"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2">
                Data Ședinței foto
              </label>
              <input
                type="date"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2">
                Numar telefon
              </label>
              <input
                type="tel"
                placeholder="Numărul tău"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2">
                Locația
              </label>
              <input
                type="text"
                placeholder="Exemplu: Chișinău"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium mb-2">
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
              <label className="block text-sm font-sans font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="email@exemplu.md"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-sans font-medium mb-2">
                Spune mai multe detalii despre ședință
              </label>
              <textarea
                rows="4"
                placeholder="Detalii suplimentare..."
                className="input-field resize-none"
              />
            </div>

            <div className="md:col-span-2 text-center">
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

      {/* Pozele pentru editare section */}
      <section className="py-20 px-4 bg-brown-dark text-cream">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl mb-6">
                Pozele pentru editare
              </h2>
              <h3 className="font-serif text-3xl mb-6">
                Fotografiile tale te așteaptă
              </h3>
              <p className="font-sans text-lg mb-6 leading-relaxed">
                Intră în portalul tău personal pentru a vizualiza și selecta 
                fotografiile preferate din ședința ta foto.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-brown-light mr-2">•</span>
                  <span>Vizualizează toate fotografiile din ședința ta</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brown-light mr-2">•</span>
                  <span>Selectează pozele tale preferate pentru editare</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brown-light mr-2">•</span>
                  <span>Trimite selecția direct către fotograf</span>
                </li>
                <li className="flex items-start">
                  <span className="text-brown-light mr-2">•</span>
                  <span>Primește pozele editate în format digital</span>
                </li>
              </ul>
              <Link to="/portal-client" className="btn-secondary">
                Accesează albumul
              </Link>
            </div>

            <div className="bg-cream/10 p-8 rounded-lg">
              <h4 className="font-sans text-xl mb-4">Fotografiile tale te așteaptă</h4>
              <p className="text-brown-light mb-6">
                Folosește codul primit prin email pentru a accesa galeria ta personală
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brown-light/20 rounded-full flex items-center justify-center">
                    <Camera className="text-brown-light" size={24} />
                  </div>
                  <span className="font-sans">Galerie privată securizată</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brown-light/20 rounded-full flex items-center justify-center">
                    <Award className="text-brown-light" size={24} />
                  </div>
                  <span className="font-sans">Fotografii în rezoluție înaltă</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brown-light/20 rounded-full flex items-center justify-center">
                    <Users className="text-brown-light" size={24} />
                  </div>
                  <span className="font-sans">Partajare ușoară cu familia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
