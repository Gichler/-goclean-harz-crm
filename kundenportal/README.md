# GoClean Harz - Kundenportal

Das Kundenportal für GoClean Harz ist eine moderne React-Anwendung, die es Kunden ermöglicht, ihre Aufträge, Rechnungen und Termine zu verwalten.

## 🚀 Features

### ✅ Implementiert
- **Dashboard**: Übersicht über alle wichtigen Daten
- **Aufträge**: Anzeige und Verwaltung von Kundenaufträgen
- **Rechnungen**: Einsehen und Download von Rechnungen
- **Profil**: Bearbeitung der Kundendaten
- **Nachrichten**: Kommunikation mit GoClean Harz
- **Termine**: Übersicht über anstehende Termine

### 🎯 Hauptfunktionen
- Responsive Design für alle Geräte
- Echtzeit-Datenaktualisierung
- Intuitive Benutzeroberfläche
- Demo-Daten für Testzwecke

## 📁 Projektstruktur

```
kundenportal/
├── package.json              # Abhängigkeiten und Skripte
├── vite.config.js            # Vite-Konfiguration
├── tailwind.config.js        # Tailwind CSS-Konfiguration
├── postcss.config.js         # PostCSS-Konfiguration
├── index.html               # HTML-Template
├── src/
│   ├── main.jsx             # React-Einstiegspunkt
│   ├── App.jsx              # Haupt-App-Komponente
│   ├── App.css              # Globale Styles
│   ├── components/
│   │   ├── ui/              # UI-Komponenten
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── input.jsx
│   │   │   └── textarea.jsx
│   │   ├── Dashboard.jsx    # Dashboard-Komponente
│   │   ├── Orders.jsx       # Aufträge-Komponente
│   │   ├── Invoices.jsx     # Rechnungen-Komponente
│   │   ├── Profile.jsx      # Profil-Komponente
│   │   ├── Messages.jsx     # Nachrichten-Komponente
│   │   └── Calendar.jsx     # Termine-Komponente
│   └── utils/
│       └── api.js           # API-Konfiguration
└── public/                  # Statische Dateien
```

## 🛠️ Installation

### Voraussetzungen
- Node.js (Version 16 oder höher)
- npm oder yarn

### Installation der Abhängigkeiten
```bash
cd kundenportal
npm install
```

## 🚀 Entwicklung

### Entwicklungsserver starten
```bash
npm run dev
```

Das Kundenportal läuft dann auf `http://localhost:3000`

### Build erstellen
```bash
npm run build
```

### Preview des Builds
```bash
npm run preview
```

## 🔗 API-Verbindung

Das Kundenportal ist so konfiguriert, dass es mit dem GoClean Harz Backend kommuniziert:

- **Backend-URL**: `http://localhost:5000/api`
- **Port**: 3000 (kann in `vite.config.js` geändert werden)

### API-Endpunkte
- `GET /api/customer/{id}/orders` - Kundenaufträge abrufen
- `GET /api/customer/{id}/invoices` - Kundenrechnungen abrufen
- `GET /api/customer/{id}/profile` - Kundenprofil abrufen
- `PUT /api/customer/{id}/profile` - Kundenprofil aktualisieren
- `GET /api/customer/{id}/messages` - Nachrichten abrufen
- `POST /api/customer/{id}/messages` - Nachricht senden

## 🎨 Design-System

Das Kundenportal verwendet:
- **Tailwind CSS** für Styling
- **Lucide React** für Icons
- **Shadcn/ui** Design-Patterns
- **Responsive Design** für alle Bildschirmgrößen

## 📱 Responsive Design

Das Kundenportal ist vollständig responsive und funktioniert auf:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Konfiguration

### Umgebungsvariablen
Erstellen Sie eine `.env` Datei im `kundenportal` Verzeichnis:

```env
VITE_API_URL=http://localhost:5000/api
```

### Port ändern
Bearbeiten Sie `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Hier den gewünschten Port eintragen
    host: true
  }
})
```

## 🧪 Demo-Daten

Das Kundenportal enthält Demo-Daten für Testzwecke:
- **Kunde**: Max Mustermann (K-000001)
- **Aufträge**: 3 verschiedene Aufträge
- **Rechnungen**: 3 Rechnungen mit verschiedenen Status
- **Nachrichten**: 3 Beispiel-Nachrichten

## 🚀 Deployment

### Produktions-Build
```bash
npm run build
```

### Statischer Server
```bash
npm run preview
```

### Docker (optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues
- E-Mail: support@goclean-harz.de
- Telefon: +49 123 456789

## 📄 Lizenz

Dieses Projekt ist Teil des GoClean Harz CRM-Systems und unterliegt den entsprechenden Lizenzbedingungen.

---

**GoClean Harz - Ihr Partner für professionelle Reinigungsdienstleistungen**
