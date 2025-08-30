# 🧹 GoClean Harz CRM - Digitales Assistenzsystem

Ein vollständig integriertes CRM-System für Reinigungsunternehmen, entwickelt mit modernen Technologien.

## 🚀 Features

- **👥 Kundenverwaltung (CRM)** - Vollständige Kundenverwaltung mit Kontaktdaten
- **📋 Auftragsverwaltung** - Aufträge erstellen, verwalten und verfolgen
- **📄 Angebotserstellung** - Professionelle Angebote mit Vorlagen
- **🧾 Rechnungsstellung** - Automatische Rechnungserstellung
- **💬 Kommunikationsverwaltung** - Kundenkommunikation dokumentieren
- **⏰ Zeiterfassung** - Arbeitszeiten erfassen und auswerten
- **🛡️ Qualitätskontrolle** - Qualitätsprüfungen durchführen
- **📦 Lagerverwaltung** - Bestandsüberwachung und Lieferantenverwaltung
- **📊 Dashboard** - Zentrale Übersicht aller Kennzahlen
- **⚙️ Einstellungen** - Unternehmensdaten und Konfiguration

## 🏗️ Technologie-Stack

### Backend
- **Python 3.11+** - Hauptprogrammiersprache
- **Flask** - Web-Framework
- **SQLAlchemy** - ORM für Datenbankoperationen
- **SQLite** - Datenbank (produktionsbereit für PostgreSQL/MySQL)

### Frontend
- **React 18** - Moderne Benutzeroberfläche
- **Vite** - Build-Tool und Development-Server
- **Tailwind CSS** - Utility-First CSS-Framework
- **Lucide React** - Moderne Icons

## 📦 Installation

### Voraussetzungen
- Python 3.11 oder höher
- Node.js 18 oder höher
- npm oder yarn

### Backend einrichten
```bash
# Python-Dependencies installieren
pip install -r requirements.txt

# Backend starten
python main.py
```

### Frontend einrichten
```bash
# Node.js-Dependencies installieren
npm install

# Development-Server starten
npm run dev
```

## 🌐 Zugriff

- **Frontend:** http://localhost:5173 (Development)
- **Backend API:** http://localhost:5000
- **Datenbank:** SQLite (automatisch erstellt)

## 📁 Projektstruktur

```
goclean/
├── src/
│   ├── components/          # React-Komponenten
│   │   ├── ui/             # UI-Komponenten (Button, Card, Badge)
│   │   └── Dashboard.jsx   # Haupt-Dashboard
│   ├── models/              # Datenbankmodelle
│   │   ├── user.py         # Benutzer-Model
│   │   ├── customer.py     # Kunden-Model
│   │   └── order.py        # Auftrags-Model
│   ├── routes/              # API-Endpunkte
│   │   ├── customer.py     # Kunden-API
│   │   └── order.py        # Auftrags-API
│   ├── static/              # Statische Dateien
│   ├── App.jsx             # Haupt-React-App
│   └── main.jsx            # React-Einstiegspunkt
├── main.py                  # Flask-Server
├── requirements.txt         # Python-Dependencies
├── package.json            # Node.js-Dependencies
├── tailwind.config.js      # Tailwind-Konfiguration
└── vite.config.js          # Vite-Konfiguration
```

## 🔧 Konfiguration

### Umgebungsvariablen
```bash
# .env Datei erstellen
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///database/app.db
FLASK_ENV=development
```

### Datenbank
Die SQLite-Datenbank wird automatisch erstellt. Für Produktion empfehlen wir:
- PostgreSQL
- MySQL
- Microsoft SQL Server

## 🚀 Deployment

### Lokale Entwicklung
```bash
# Beide Server starten
python main.py          # Backend (Port 5000)
npm run dev             # Frontend (Port 5173)
```

### Produktion
```bash
# Frontend bauen
npm run build

# Backend mit Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

## 📊 API-Endpunkte

### Kunden
- `GET /api/customers` - Alle Kunden abrufen
- `POST /api/customers` - Neuen Kunden erstellen
- `PUT /api/customers/{id}` - Kunden bearbeiten
- `DELETE /api/customers/{id}` - Kunden löschen

### Aufträge
- `GET /api/orders` - Alle Aufträge abrufen
- `POST /api/orders` - Neuen Auftrag erstellen
- `PUT /api/orders/{id}` - Auftrag bearbeiten
- `DELETE /api/orders/{id}` - Auftrag löschen
- `GET /api/orders/dashboard` - Dashboard-Daten

## 🤝 Beitragen

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues erstellen
- Dokumentation durchgehen
- Code-Beispiele in der README prüfen

## 🎯 Roadmap

- [ ] **Kundenportal** - Kunden können sich einloggen
- [ ] **E-Mail-Integration** - Automatischer Versand
- [ ] **Mobile App** - iOS und Android
- [ ] **Backup-System** - Automatische Datensicherung
- [ ] **Reporting** - Erweiterte Auswertungen
- [ ] **Multi-User** - Benutzerverwaltung mit Rechten

---

**Entwickelt mit ❤️ für GoClean Harz**
