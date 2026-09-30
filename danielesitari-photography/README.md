# DanieleSitari Photography Website

Website profesional pentru fotograf cu portal client și sistem de management fotografii.

## 🎯 Funcționalități

### Pentru Vizitatori:
- **Home Page** - Prezentare fotograf, portofoliu preview, formular contact
- **Portofolio** - Galerie completă cu filtre pe categorii (Individual, Familie, Car/Moto, Wedding)
- **Categorii** - Pagini dedicate pentru fiecare categorie de fotografii

### Pentru Clienți:
- **Portal Client** - Autentificare cu cod unic și PIN
- **Galerie Privată** - Vizualizare fotografii din ședința personală
- **Selecție Fotografii** - Alegere poze preferate pentru editare
- **Trimitere Selecție** - Comunicare directă cu fotograful

### Pentru Fotograf (Admin):
- **Panou Admin** - Acces la `/admin` cu parolă: `admin2024`
- **Creare Clienți** - Generare automată cod client și PIN unic
- **Upload Fotografii** - Încărcare poze direct din browser pentru fiecare client
- **Monitorizare** - Vizualizare selecții clienți în timp real
- **Management** - Editare și ștergere clienți

## 📁 Structura Proiectului

```
danielesitari-photography/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigare principală
│   │   └── Footer.jsx          # Footer cu info contact
│   ├── pages/
│   │   ├── Home.jsx            # Pagina principală
│   │   ├── Portofolio.jsx      # Galerie cu filtre
│   │   ├── CategoryView.jsx    # Vizualizare categorie specifică
│   │   ├── PortalClient.jsx    # Portal pentru clienți
│   │   └── AdminPanel.jsx      # Panou administrare
│   ├── utils/
│   │   └── clientManager.js    # Logică gestionare clienți
│   ├── data/
│   │   └── portfolio.js        # Date portofoliu
│   ├── App.jsx                 # Componenta principală
│   ├── main.jsx               # Entry point
│   └── index.css              # Stiluri globale
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 Instalare și Rulare

### Cerințe:
- Node.js 18+ 
- npm sau yarn

### Pași:

1. **Instalare dependențe:**
```bash
cd danielesitari-photography
npm install
```

2. **Pornire server dezvoltare:**
```bash
npm run dev
```

Aplicația va rula la `http://localhost:3000`

3. **Build pentru producție:**
```bash
npm run build
```

## 📖 Ghid de Utilizare

### Pentru Fotograf (Admin):

1. **Accesare Panou Admin:**
   - Navighează la `/admin`
   - Parolă: `admin2024`

2. **Adăugare Client Nou:**
   - Click pe "Client Nou"
   - Completează formularul
   - Sistemul generează automat:
     - Cod client (ex: DAN-ABC123)
     - PIN 6 cifre (ex: 123456)
   - **IMPORTANT:** Notează și trimite aceste date clientului!

3. **Încărcare Fotografii:**
   - În lista de clienți, găsește clientul dorit
   - Click pe butonul "Upload" (săgeată sus)
   - Selectează multiplele fotografii de pe calculator
   - Pozele vor fi disponibile instant în portalul clientului

4. **Vizualizare Selecții Client:**
   - Click pe butonul "Eye" pentru a vedea detaliile clientului
   - Vezi care poze au fost selectate de client (marcate cu bifă verde)

### Pentru Clienți:

1. **Accesare Portal:**
   - Click pe "Portal Client" în meniu
   - Introdu codul primit de la fotograf (ex: DAN-ABC123)
   - Introdu PIN-ul (6 cifre)

2. **Selecție Fotografii:**
   - Click pe fiecare fotografie pe care o dorești
   - Pozele selectate vor avea bifă verde
   - Poți selecta/deselecta oricând
   - Folosește butoanele "Selectează Toate" / "Deselectează Toate"

3. **Trimitere Selecție:**
   - După ce ai ales toate pozele, click pe "Trimite Selecția"
   - Fotograful va primi notificare cu selecția ta

## 🎨 Personalizare Design

### Culori (în `tailwind.config.js`):
```javascript
colors: {
  cream: '#F5F1E8',        // Fundal principal
  brown: {
    dark: '#3D2817',       // Maro închis (text, butoane)
    medium: '#6B4E37',     // Maro mediu
    light: '#D4C4B0',      // Maro deschis (accente)
  }
}
```

### Fonturi:
- **Serif (Titluri):** Playfair Display
- **Sans (Text):** Montserrat

## 🔐 Securitate

**IMPORTANT pentru Producție:**

1. **Backend Real:**
   - Înlocuiește `localStorage` cu API backend real
   - Implementează autentificare JWT
   - Stochează datele în bază de date (PostgreSQL, MongoDB)

2. **Upload Fotografii:**
   - Implementează upload la cloud storage (AWS S3, Cloudinary)
   - Adaugă compresie și optimizare imagini
   - Limitează dimensiunea fișierelor

3. **Autentificare:**
   - Implementează rate limiting
   - Hash-uire PIN-uri cu bcrypt
   - Sesiuni cu expirare

4. **Email Notificări:**
   - Integrează SendGrid / Mailgun
   - Trimite automat cod și PIN la email client
   - Notifică fotograful când clientul trimite selecția

## 📦 Tehnologii Utilizate

- **React 18** - Framework UI
- **Vite** - Build tool
- **React Router** - Navigare
- **Tailwind CSS** - Stilizare
- **Lucide React** - Iconițe
- **LocalStorage** - Stocare temporară (demo)

## 🌐 Deploy

### Opțiuni recomandate:

1. **Vercel** (Recomandat):
```bash
npm install -g vercel
vercel
```

2. **Netlify**:
```bash
npm run build
# Încarcă folderul 'dist' pe Netlify
```

3. **GitHub Pages**:
```bash
npm run build
# Configurează GitHub Pages să servească din folderul 'dist'
```

## 📝 Features Viitoare

- [ ] Integrare backend real (Node.js + Express)
- [ ] Bază de date (PostgreSQL)
- [ ] Autentificare OAuth (Google, Facebook)
- [ ] Plată online pentru servicii foto
- [ ] Calendar booking pentru programări
- [ ] Blog fotografie
- [ ] Galerie privată cu expirare automată
- [ ] Descărcare ZIP cu pozele selectate
- [ ] Watermark automat pe preview-uri
- [ ] Multi-limba (RO/EN/RU)
- [ ] Analytics și statistici

## 🐛 Debugging

### Problemă: Pozele nu se încarcă
- Verifică console-ul browser (F12)
- Asigură-te că fișierele sunt imagini valide (JPG, PNG)
- Limitează dimensiunea la max 5MB per imagine

### Problemă: Client nu poate face login
- Verifică că ai copiat corect codul și PIN-ul
- Codurile sunt case-sensitive
- Verifică în Admin Panel dacă clientul există

## 📧 Contact

Pentru suport: contact@danielesitari.md

## 📄 Licență

© 2026 DanieleSitari Photography. Toate drepturile rezervate.

---

**Dezvoltat cu ❤️ pentru fotografi profesioniști**
