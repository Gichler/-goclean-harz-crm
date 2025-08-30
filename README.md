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

## 📚 Git-Workflow: Commit, Merge, Squash, Rebase

### Commit
- Ein einzelner gespeicherter Änderungsstand mit Nachricht; kleinste Einheit der Historie.
- Best Practices: kleine, thematisch klare Commits mit präziser Message.
- Beispiele:
  - `git add . && git commit -m "Fix: Telefonnummern-Validierung in Kundenformular"`

### Merge (mit Merge-Commit)
- Vereinigt zwei Branches; erstellt einen Merge-Commit (mit zwei Eltern), Historien bleiben unverändert.
- Einsatz: wenn Team-Kontext/Verzweigungen sichtbar bleiben sollen.
- Beispiele:
  - `git checkout main && git pull`
  - `git merge feature/kunden-suchen`

### Merge-Commit
- Der besondere Commit, der beim „normalen“ Merge entsteht und die beiden Entwicklungszweige verbindet.

### Squash Merge
- Fasst alle Commits eines Feature-Branches zu EINEM Commit zusammen und legt diesen auf dem Ziel-Branch ab.
- Vorteile: sehr aufgeräumte Historie („ein Feature = ein Commit“). Nachteil: Detailverlauf des Features geht verloren.
- Lokal:
  - `git checkout main && git pull`
  - `git merge --squash feature/angebote`
  - `git commit -m "Feat: Angebote – Listen & Erstellen"`
- In GitHub/GitLab: Option „Squash and merge“ im PR/MR.

### Rebase
- Spielt Commits eines Branches auf eine neue Basis (z. B. aktuellen `main`) um; erzeugt eine lineare Historie und schreibt Commits um.
- Achtung: Nicht auf bereits gemeinsam genutzten/remote-geteilten Branches rebasen (History-Rewrite). Falls nötig, `--force-with-lease` verwenden.
- Beispiele (lokal auf aktuellen `main` bringen):
  - `git fetch origin`
  - `git rebase origin/main`
  - Konflikte lösen → `git rebase --continue`
  - `git push --force-with-lease`

### Rebase and merge (Hosting-Plattform-Option)
- Rebased den Branch auf den Ziel-Branch und fast-forwarded ohne Merge-Commit; Historie bleibt linear, einzelne Commits bleiben erhalten.

### Entscheidungshilfe (kurz)
- Willst du lineare Historie und einzelne Commits behalten? → Rebase and merge.
- Willst du lineare Historie, aber nur EIN Commit je Feature? → Squash merge.
- Willst du Verzweigungen sichtbar behalten (Audit/Timeline)? → Normaler Merge (mit Merge-Commit).

### Mini-Cheatsheet
```bash
# Commit
git add -A
git commit -m "<präzise Nachricht>"

# Normaler Merge
git checkout main && git pull
git merge feature/x

# Squash Merge (lokal)
git checkout main && git pull
git merge --squash feature/x
git commit -m "Feat: ..."

# Rebase auf aktuellen main
git fetch origin
git rebase origin/main
git push --force-with-lease
```
