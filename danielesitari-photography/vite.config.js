import { defineConfig } from 'vite' //Importă funcția defineConfig din Vite.Această funcție ajută la autocompletare și verificarea erorilor în configurație
import react from '@vitejs/plugin-react' //Importă pluginul React pentru Vite.Acest plugin permite Vite să proceseze fișierele React și să le transforme în JavaScript compatibil cu browserul.

export default defineConfig({  //Exportă configurația Vite folosind defineConfig pentru a beneficia de autocompletare și verificare a erorilor.
  plugins: [react()], //Adaugă pluginul React la configurația Vite pentru a permite procesarea fișierelor React.
  server: { //Configurează serverul de dezvoltare Vite.
    port: 3000 //Setează portul pe care serverul de dezvoltare Vite va rula. În acest caz, este setat la 3000.
  }
})
