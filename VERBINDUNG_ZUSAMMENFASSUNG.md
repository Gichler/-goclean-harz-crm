# GoClean Harz - Verbindung zwischen Frontend und Backend

## 🎯 Kurze Zusammenfassung

Die Verbindung zwischen Ihrer App und dem Kundenportal funktioniert über **HTTP-API-Aufrufe** zwischen dem React-Frontend und dem Flask-Backend.

## 🔗 Wie es funktioniert

```
Frontend (React) ←→ HTTP Requests ←→ Backend (Flask) ←→ SQLite Database
```

### 1. **Backend (Flask)**
- Läuft auf `http://localhost:5000`
- Stellt REST-API-Endpunkte bereit
- Speichert Daten in SQLite-Datenbank
- CORS ist bereits aktiviert

### 2. **Frontend (React)**
- Läuft auf `http://localhost:5173`
- Kommuniziert über `fetch()` mit dem Backend
- Zeigt Daten in der Benutzeroberfläche an

### 3. **API-Verbindung**
- Zentrale Konfiguration in `src/utils/api.js`
- Automatische Fehlerbehandlung
- Einfache Verwendung in Komponenten

## 🚀 Schnellstart

### 1. System starten
```bash
python start_system.py
```

### 2. Oder manuell:
```bash
# Terminal 1: Backend
python main.py

# Terminal 2: Frontend  
npm run dev
```

### 3. Verbindung testen
- Öffnen Sie `http://localhost:5173`
- Gehen Sie zu "Verbindungstest"
- Alle Tests sollten grün sein

## 📊 Daten werden angezeigt

### Kunden-Daten
- Werden über `/api/customers` geladen
- Angezeigt in der Kunden-Komponente
- Automatische Aktualisierung

### Auftrags-Daten  
- Werden über `/api/orders` geladen
- Angezeigt im Dashboard
- Status-Updates in Echtzeit

### Weitere Module
- Angebote: `/api/quotes`
- Rechnungen: `/api/invoices`
- Kommunikation: `/api/communications`
- Qualität: `/api/quality`
- Inventar: `/api/inventory`
- Zeiterfassung: `/api/timetracking`

## 🔧 Verwendung in Komponenten

```javascript
import { customerAPI } from '../utils/api.js'

// Kunden laden
const customers = await customerAPI.getAll()

// Neuen Kunden erstellen
const newCustomer = await customerAPI.create(customerData)

// Kunden aktualisieren
const updatedCustomer = await customerAPI.update(id, data)
```

## ✅ Status prüfen

1. **Backend läuft**: `http://localhost:5000/api/customers` sollte JSON zurückgeben
2. **Frontend läuft**: `http://localhost:5173` sollte die App anzeigen
3. **Verbindung OK**: Alle API-Tests in der Verbindungstest-Komponente sind grün

## 🛠️ Bei Problemen

1. **CORS-Fehler**: Backend hat bereits CORS aktiviert
2. **Port-Konflikte**: Stellen Sie sicher, dass Port 5000 frei ist
3. **Datenbank-Fehler**: Überprüfen Sie `database/app.db`
4. **Netzwerk-Fehler**: Überprüfen Sie Firewall-Einstellungen

## 📝 Nächste Schritte

1. ✅ Verbindung ist implementiert
2. ✅ API-Funktionen sind verfügbar
3. ✅ Daten werden korrekt angezeigt
4. 🔄 Implementieren Sie weitere Funktionen
5. 🔄 Fügen Sie Authentifizierung hinzu
6. 🔄 Optimieren Sie Performance

---

**Die Verbindung zwischen Frontend und Backend ist vollständig implementiert und funktionsfähig!** 🎉
