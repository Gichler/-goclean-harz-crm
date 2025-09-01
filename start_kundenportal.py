#!/usr/bin/env python3
"""
GoClean Harz Kundenportal Starter
Startet das Kundenportal auf Port 3000
"""

import subprocess
import sys
import os
import time
import signal
from pathlib import Path

class KundenportalStarter:
    def __init__(self):
        self.frontend_process = None
        self.running = True
        
    def start_kundenportal(self):
        """Startet das Kundenportal"""
        print("🚀 Starte Kundenportal...")
        
        # Prüfe ob das kundenportal Verzeichnis existiert
        if not Path("kundenportal").exists():
            print("❌ Kundenportal Verzeichnis nicht gefunden!")
            print("   Bitte stellen Sie sicher, dass das kundenportal Verzeichnis existiert.")
            return False
            
        try:
            # Wechsle ins kundenportal Verzeichnis
            os.chdir("kundenportal")
            
            # Prüfe ob node_modules existiert, sonst installiere Abhängigkeiten
            if not Path("node_modules").exists():
                print("📦 Installiere Abhängigkeiten...")
                subprocess.run([sys.executable, "-m", "npm", "install"], check=True)
            
            # Starte das Kundenportal
            print("🌐 Starte Kundenportal auf http://localhost:3000")
            self.frontend_process = subprocess.Popen(
                [sys.executable, "-m", "npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            print("✅ Kundenportal gestartet!")
            print("📱 Öffnen Sie http://localhost:3000 in Ihrem Browser")
            print("🛑 Drücken Sie Ctrl+C zum Beenden")
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Fehler beim Starten des Kundenportals: {e}")
            return False
        except Exception as e:
            print(f"❌ Unerwarteter Fehler: {e}")
            return False
    
    def stop_kundenportal(self):
        """Stoppt das Kundenportal"""
        if self.frontend_process:
            print("\n🛑 Stoppe Kundenportal...")
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
                print("✅ Kundenportal gestoppt")
            except subprocess.TimeoutExpired:
                print("⚠️  Kundenportal konnte nicht sauber gestoppt werden")
                self.frontend_process.kill()
    
    def run(self):
        """Hauptfunktion"""
        print("=" * 50)
        print("🎯 GoClean Harz - Kundenportal Starter")
        print("=" * 50)
        
        # Signal Handler für sauberes Beenden
        def signal_handler(signum, frame):
            print("\n🛑 Beende Kundenportal...")
            self.running = False
            self.stop_kundenportal()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # Starte Kundenportal
        if self.start_kundenportal():
            try:
                # Warte auf Beendigung
                while self.running:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n🛑 Beende Kundenportal...")
            finally:
                self.stop_kundenportal()
        else:
            print("❌ Kundenportal konnte nicht gestartet werden")
            sys.exit(1)

def main():
    """Hauptfunktion"""
    starter = KundenportalStarter()
    starter.run()

if __name__ == "__main__":
    main()
