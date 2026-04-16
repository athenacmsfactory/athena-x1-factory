# Lessons Learned: Image Path Resolution in Athena V10 (Vite)

## 1. Probleemstelling
Tijdens de migratie van `gentse-dakwerken-v9.2` naar `gentse-dakwerken-v10` bleven afbeeldingen (zoals `roof.webp`, `solar.webp`) 404-fouten geven, ondanks dat ze fysiek aanwezig waren in de `public/images/` map.

## 2. Oorzaak: Vite Base URL
De kern van het probleem lag in de `vite.config.js` instelling:
```javascript
base: isDev ? `/${path.basename(__dirname)}/` : './',
```
In development mode wordt de site geserveerd onder een submap (bijv. `/gentse-dakwerken-v10/`). 

### Waarom absolute paden falen:
- Een pad dat begint met een `/` (bijv. `/images/roof.webp`) wordt door de browser geïnterpreteerd als absoluut vanaf de **domein-root** (`http://localhost:6159/images/roof.webp`).
- Vite verwacht echter dat assets relatief aan de `base` geladen worden (`http://localhost:6159/gentse-dakwerken-v10/images/roof.webp`).

## 3. De Oplossing
Om dit robuust op te lossen voor zowel development (dashboard) als productie, moeten we paden "Base-URL aware" maken.

### Strategie A: Gebruik `import.meta.env.BASE_URL`
In React componenten kunnen we het pad dynamisch opbouwen:
```javascript
const base = import.meta.env.BASE_URL || '/';
const finalPath = (base + cleanUrl).replace(/\/+/g, '/');
```

### Strategie B: Relatieve paden in Data
Soms is het beter om de leidende slash in `all_data.json` te vermijden:
- ❌ `/images/roof.webp` (Gedwongen root)
- ✅ `images/roof.webp` (Relatief aan de basis van de app)

## 4. Richtlijnen voor Athena Factory Sitetypes
1. **Helper Functies**: Implementeer in elke component die media toont een `getImgPath` helper die de `BASE_URL` injecteert.
2. **Fallback naar /images/**: Als een pad geen folder bevat, moet de helper automatisch `images/` prefxen voor consistentie met de Athena mappenstructuur.
3. **Leading Slash Stripping**: Zorg dat de helper leading slashes stript voordat hij de `BASE_URL` toevoegt om dubbele slashes of verkeerde resolutie te voorkomen.

## 5. Voorbeeld Robuuste Image Helper
```javascript
const getImgPath = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    const base = import.meta.env.BASE_URL || '/';
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    
    // Voeg 'images/' toe als er nog geen folder-structuur is
    const pathPrefix = (cleanUrl.includes('/') || cleanUrl.endsWith('.svg')) ? '' : 'images/';
    
    return (base + pathPrefix + cleanUrl).replace(/\/+/g, '/');
};
```

---
**Datum:** Maart 2026  
**Project:** Athena V10 Replication Mode
