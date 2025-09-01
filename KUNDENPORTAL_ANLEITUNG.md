# 🎯 GoClean Harz - Kundenportal Anleitung

## Übersicht

Das **Kundenportal** ist die zweite Anwendung im GoClean Harz CRM-System. Es ermöglicht Kunden, ihre Aufträge, Rechnungen und Termine zu verwalten.

## 🏗️ Architektur

```
GoClean Harz System
├── Backend (Flask) - Port 5000
├── Admin-Portal (React) - Port 5173
└── Kundenportal (React) - Port 3000 ← NEU!
```

## 🚀 Schnellstart

### 1. Kundenportal starten
```bash
# Einfach mit dem Start-Skript:
python start_kundenportal.py

# Oder manuell:
cd kundenportal
npm install
npm run dev
```

### 2. Browser öffnen
Öffnen Sie `http://localhost:3000` in Ihrem Browser.

## 📱 Features

### ✅ Dashboard
- **Willkommensbereich** mit Kundennummer
- **Statistik-Karten** (aktive Aufträge, offene Rechnungen, etc.)
- **Letzte Aufträge** Übersicht
- **Schnellaktionen** für häufige Aufgaben

### ✅ Meine Aufträge
- **Filterung** nach Status (Alle, Ausstehend, In Bearbeitung, Abgeschlossen)
- **Detaillierte Ansicht** mit Termin, Dauer, Preis
- **Status-Badges** für schnelle Übersicht
- **Service-Typen** (Reinigung, Gartenpflege, Winterdienst)

### ✅ Meine Rechnungen
- **Zusammenfassung** (Gesamtbetrag, offene Beträge, Anzahl)
- **Filterung** nach Status (Alle, Offen, Bezahlt, Überfällig)
- **Download-Funktion** für PDF-Rechnungen
- **Fälligkeitsdatum** Anzeige

### ✅ Termine
- **Heutige Termine** hervorgehoben
- **Anstehende Termine** chronologisch sortiert
- **Termin-Details** (Datum, Uhrzeit, Dauer)
- **Status-Übersicht** (Anstehend, Heute, Abgeschlossen)

### ✅ Nachrichten
- **Nachrichtenliste** mit Betreff und Inhalt
- **Neue Nachricht senden** an GoClean Harz
- **Nachrichten-Typen** (E-Mail, Benachrichtigung)
- **Zeitstempel** für alle Nachrichten

### ✅ Profil
- **Persönliche Daten** bearbeiten
- **Firmendaten** verwalten
- **Adresse** aktualisieren
- **Speichern/Abbrechen** Funktionen

## 🔗 API-Verbindung

Das Kundenportal kommuniziert mit dem Backend über folgende Endpunkte:

### Kunden-spezifische Endpunkte
```javascript
// Aufträge abrufen
GET /api/customer/{id}/orders

// Rechnungen abrufen
GET /api/customer/{id}/invoices

// Profil abrufen
GET /api/customer/{id}/profile

// Profil aktualisieren
PUT /api/customer/{id}/profile

// Nachrichten abrufen
GET /api/customer/{id}/messages

// Nachricht senden
POST /api/customer/{id}/messages
```

### Demo-Daten
Für Testzwecke sind Demo-Daten integriert:
- **Kunde**: Max Mustermann (ID: 1)
- **Aufträge**: 3 verschiedene Aufträge
- **Rechnungen**: 3 Rechnungen mit verschiedenen Status
- **Nachrichten**: 3 Beispiel-Nachrichten

## 🎨 Design-System

### Farben
- **Primär**: Blau (#3B82F6)
- **Sekundär**: Grau (#6B7280)
- **Erfolg**: Grün (#10B981)
- **Warnung**: Gelb (#F59E0B)
- **Fehler**: Rot (#EF4444)

### Komponenten
- **Cards** für Inhaltsblöcke
- **Badges** für Status-Anzeigen
- **Buttons** mit verschiedenen Varianten
- **Input-Felder** für Formulare
- **Icons** von Lucide React

## 📱 Responsive Design

Das Kundenportal ist vollständig responsive:

### Desktop (1200px+)
- **Sidebar-Navigation** links
- **Hauptinhalt** rechts
- **Grid-Layout** für Statistiken

### Tablet (768px - 1199px)
- **Angepasste Grids** für bessere Lesbarkeit
- **Optimierte Touch-Targets**

### Mobile (320px - 767px)
- **Stacked Layout** für alle Komponenten
- **Touch-optimierte Buttons**
- **Vollständige Funktionalität**

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

## 🚀 Deployment

### Entwicklung
```bash
cd kundenportal
npm run dev
```

### Produktion
```bash
cd kundenportal
npm run build
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

## 🔄 Integration mit Admin-Portal

### Datenfluss
```
Admin-Portal (Port 5173) ←→ Backend (Port 5000) ←→ Kundenportal (Port 3000)
```

### Gemeinsame Datenbank
- **Kunden** werden im Admin-Portal verwaltet
- **Aufträge** werden im Admin-Portal erstellt
- **Rechnungen** werden im Admin-Portal generiert
- **Kundenportal** zeigt nur kunden-spezifische Daten an

### Sicherheit
- **Kunden-ID** basierte Filterung
- **Keine Admin-Funktionen** im Kundenportal
- **Nur lesender Zugriff** auf andere Kundendaten

## 🧪 Testing

### Demo-Kunde
- **ID**: 1
- **Name**: Max Mustermann
- **E-Mail**: max@mustermann.de
- **Firma**: Mustermann GmbH

### Test-Szenarien
1. **Dashboard** - Übersicht anzeigen
2. **Aufträge** - Filterung testen
3. **Rechnungen** - Status-Übersicht
4. **Profil** - Daten bearbeiten
5. **Nachrichten** - Neue Nachricht senden
6. **Termine** - Anstehende Termine anzeigen

## 📞 Support

### Häufige Probleme

**Kundenportal startet nicht**
```bash
# Abhängigkeiten installieren
cd kundenportal
npm install

# Port prüfen
netstat -an | grep 3000
```

**Keine Verbindung zum Backend**
```bash
# Backend starten
python main.py

# API-URL prüfen
echo $VITE_API_URL
```

**Demo-Daten nicht sichtbar**
- Browser-Cache leeren
- Seite neu laden (F5)
- Entwickler-Tools prüfen (F12)

### Kontakt
- **E-Mail**: support@goclean-harz.de
- **Telefon**: +49 123 456789
- **GitHub**: Issues im Projekt-Repository

## 🎯 Nächste Schritte

### Geplante Features
- [ ] **Echtzeit-Updates** über WebSocket
- [ ] **Push-Benachrichtigungen** für neue Nachrichten
- [ ] **Kalender-Integration** (Google Calendar, Outlook)
- [ ] **Mobile App** (React Native)
- [ ] **Offline-Funktionalität**
- [ ] **Mehrsprachigkeit** (EN, DE)

### Verbesserungen
- [ ] **Performance-Optimierung** für große Datenmengen
- [ ] **Erweiterte Filter** für Aufträge und Rechnungen
- [ ] **Export-Funktionen** (PDF, Excel)
- [ ] **Benachrichtigungs-Einstellungen**

---

**🎉 Das Kundenportal ist bereit für den Einsatz!**

Öffnen Sie `http://localhost:3000` und testen Sie alle Features mit den Demo-Daten.
