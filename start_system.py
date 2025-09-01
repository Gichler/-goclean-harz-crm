#!/usr/bin/env python3
"""
GoClean Harz CRM System Starter
Startet sowohl Backend als auch Frontend
"""

import subprocess
import sys
import os
import time
import threading
import signal
from pathlib import Path

class GoCleanStarter:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        
    def start_backend(self):
        """Startet das Flask-Backend"""
        print("🚀 Starte Backend (Flask)...")
        try:
            self.backend_process = subprocess.Popen(
                [sys.executable, "main.py"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            print("✅ Backend gestartet auf http://localhost:5000")
        except Exception as e:
            print(f"❌ Fehler beim Starten des Backends: {e}")
            
    def start_frontend(self):
        """Startet das React-Frontend"""
        print("🎨 Starte Frontend (React)...")
        try:
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            print("✅ Frontend gestartet auf http://localhost:5173")
        except Exception as e:
            print(f"❌ Fehler beim Starten des Frontends: {e}")
    
    def check_dependencies(self):
        """Überprüft ob alle Abhängigkeiten installiert sind"""
        print("🔍 Überprüfe Abhängigkeiten...")
        
        # Python-Abhängigkeiten
        try:
            import flask
            import flask_cors
            print("✅ Python-Abhängigkeiten OK")
        except ImportError as e:
            print(f"❌ Python-Abhängigkeiten fehlen: {e}")
            print("📦 Installiere mit: pip install -r requirements.txt")
            return False
            
        # Node.js-Abhängigkeiten
        if not os.path.exists("node_modules"):
            print("📦 Node.js-Abhängigkeiten fehlen")
            print("📦 Installiere mit: npm install")
            return False
        else:
            print("✅ Node.js-Abhängigkeiten OK")
            
        return True
    
    def create_env_file(self):
        """Erstellt .env Datei falls nicht vorhanden"""
        env_file = Path(".env")
        if not env_file.exists():
            print("📝 Erstelle .env Datei...")
            env_content = """# API-Konfiguration
VITE_API_URL=http://localhost:5000/api

# Backend-Konfiguration
FLASK_ENV=development
FLASK_DEBUG=true
"""
            with open(env_file, "w") as f:
                f.write(env_content)
            print("✅ .env Datei erstellt")
    
    def monitor_processes(self):
        """Überwacht die laufenden Prozesse"""
        while self.running:
            if self.backend_process and self.backend_process.poll() is not None:
                print("⚠️  Backend-Prozess beendet")
                self.running = False
                break
                
            if self.frontend_process and self.frontend_process.poll() is not None:
                print("⚠️  Frontend-Prozess beendet")
                self.running = False
                break
                
            time.sleep(1)
    
    def cleanup(self):
        """Beendet alle Prozesse"""
        print("\n🛑 Beende System...")
        
        if self.backend_process:
            self.backend_process.terminate()
            print("✅ Backend beendet")
            
        if self.frontend_process:
            self.frontend_process.terminate()
            print("✅ Frontend beendet")
    
    def run(self):
        """Hauptfunktion"""
        print("=" * 50)
        print("🎯 GoClean Harz CRM System")
        print("=" * 50)
        
        # Abhängigkeiten prüfen
        if not self.check_dependencies():
            print("❌ Abhängigkeiten nicht erfüllt. Beende...")
            return
        
        # .env Datei erstellen
        self.create_env_file()
        
        # Backend starten
        self.start_backend()
        time.sleep(2)  # Kurz warten
        
        # Frontend starten
        self.start_frontend()
        time.sleep(2)  # Kurz warten
        
        print("\n" + "=" * 50)
        print("🎉 System erfolgreich gestartet!")
        print("📊 Dashboard: http://localhost:5173")
        print("🔧 API: http://localhost:5000/api")
        print("=" * 50)
        print("Drücken Sie Ctrl+C zum Beenden")
        print("=" * 50)
        
        # Signal Handler für sauberes Beenden
        def signal_handler(signum, frame):
            self.running = False
            self.cleanup()
            sys.exit(0)
            
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Prozesse überwachen
        self.monitor_processes()

if __name__ == "__main__":
    starter = GoCleanStarter()
    try:
        starter.run()
    except KeyboardInterrupt:
        starter.cleanup()
        print("\n👋 Auf Wiedersehen!")
