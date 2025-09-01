# GoClean Harz - Verbindung zwischen Frontend und Backend

## Übersicht

Das GoClean Harz CRM-System besteht aus zwei Hauptkomponenten:
1. **Backend (Flask)**: REST-API auf Port 5000
2. **Frontend (React)**: Benutzeroberfläche mit Vite

## Wie die Verbindung funktioniert

### 1. API-Konfiguration

Die Verbindung wird über die Datei `src/utils/api.js` verwaltet:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

### 2. Datenfluss

```
Frontend (React) ←→ HTTP Requests ←→ Backend (Flask) ←→ SQLite Database
```

### 3. API-Endpunkte

Das Backend stellt folgende Endpunkte zur Verfügung:

- **Kunden**: `/api/customers`
- **Aufträge**: `/api/orders`
- **Angebote**: `/api/quotes`
- **Rechnungen**: `/api/invoices`
- **Kommunikation**: `/api/communications`
- **Qualität**: `/api/quality`
- **Inventar**: `/api/inventory`
- **Zeiterfassung**: `/api/timetracking`

## Setup und Konfiguration

### 1. Umgebungsvariablen

Erstellen Sie eine `.env` Datei im Hauptverzeichnis:

```env
# API-Konfiguration
VITE_API_URL=http://localhost:5000/api

# Backend-Konfiguration
FLASK_ENV=development
FLASK_DEBUG=true
```

### 2. Backend starten

```bash
# Im Hauptverzeichnis
python main.py
```

Das Backend läuft dann auf `http://localhost:5000`

### 3. Frontend starten

```bash
# Im Hauptverzeichnis
npm run dev
```

Das Frontend läuft dann auf `http://localhost:5173`

## Verwendung in Komponenten

### Beispiel: Kunden laden

```javascript
import { customerAPI } from '../utils/api.js'

const fetchCustomers = async () => {
  try {
    const customers = await customerAPI.getAll()
    setCustomers(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
}
```

### Beispiel: Neuen Kunden erstellen

```javascript
const createCustomer = async (customerData) => {
  try {
    const newCustomer = await customerAPI.create(customerData)
    setCustomers(prev => [...prev, newCustomer])
  } catch (error) {
    console.error('Error creating customer:', error)
  }
}
```

## Fehlerbehandlung

### CORS-Probleme

Das Backend hat bereits CORS aktiviert:

```python
from flask_cors import CORS
CORS(app)
```

### Netzwerkfehler

Die API-Funktionen fangen Fehler automatisch ab und loggen sie:

```javascript
try {
  const data = await api.get('/customers')
  return data
} catch (error) {
  console.error('API Error:', error)
  throw error
}
```

## Datenstruktur

### Kunden-Daten

```javascript
{
  id: 1,
  customer_number: "K-12345678",
  company_name: "Musterfirma GmbH",
  first_name: "Max",
  last_name: "Mustermann",
  email: "max@musterfirma.de",
  phone: "+49 123 456789",
  street: "Musterstraße",
  house_number: "123",
  postal_code: "12345",
  city: "Musterstadt",
  customer_type: "business",
  preferred_contact_method: "email",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z"
}
```

### Auftrags-Daten

```javascript
{
  id: 1,
  order_number: "A-12345678",
  customer_id: 1,
  service_type: "reinigung",
  status: "pending",
  scheduled_date: "2024-01-15",
  estimated_duration: 120,
  price: 150.00,
  notes: "Besondere Anweisungen",
  created_at: "2024-01-01T00:00:00Z"
}
```

## Debugging

### Backend-Logs

Das Flask-Backend zeigt detaillierte Logs:

```bash
python main.py
# Zeigt alle API-Requests und Fehler
```

### Frontend-Logs

Öffnen Sie die Browser-Entwicklertools (F12) und schauen Sie in die Konsole:

```javascript
// API-Aufrufe werden automatisch geloggt
console.log('API Response:', data)
```

### Netzwerk-Monitoring

In den Browser-Entwicklertools unter "Network" können Sie alle HTTP-Requests sehen.

## Produktions-Setup

### 1. Backend-Deployment

```bash
# Produktions-Server
export FLASK_ENV=production
export FLASK_DEBUG=false
python main.py
```

### 2. Frontend-Build

```bash
npm run build
# Erstellt optimierte Dateien in dist/
```

### 3. Reverse Proxy

Verwenden Sie Nginx oder Apache als Reverse Proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location /api {
        proxy_pass http://localhost:5000;
    }
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## Sicherheit

### 1. API-Schlüssel

Fügen Sie Authentifizierung hinzu:

```python
# In main.py
from flask_jwt_extended import JWTManager, jwt_required

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

@app.route('/api/protected')
@jwt_required()
def protected():
    return jsonify({'message': 'Protected endpoint'})
```

### 2. HTTPS

Verwenden Sie HTTPS in der Produktion:

```javascript
// In api.js
const API_BASE_URL = 'https://your-domain.com/api'
```

## Troubleshooting

### Häufige Probleme

1. **CORS-Fehler**: Stellen Sie sicher, dass CORS im Backend aktiviert ist
2. **Port-Konflikte**: Überprüfen Sie, ob Port 5000 frei ist
3. **Datenbank-Fehler**: Überprüfen Sie die SQLite-Datenbank-Datei
4. **Netzwerk-Fehler**: Überprüfen Sie die Firewall-Einstellungen

### Debug-Schritte

1. Überprüfen Sie die Backend-Logs
2. Testen Sie die API-Endpunkte direkt (z.B. mit curl)
3. Überprüfen Sie die Browser-Netzwerk-Tab
4. Testen Sie die Datenbank-Verbindung

## Nächste Schritte

1. Implementieren Sie Authentifizierung
2. Fügen Sie Validierung hinzu
3. Implementieren Sie Caching
4. Fügen Sie Real-time Updates hinzu (WebSockets)
5. Implementieren Sie Offline-Funktionalität
