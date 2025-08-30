#!/usr/bin/env python3
"""
Setup script to create default quote templates for GoClean Harz
"""

import os
import sys
sys.path.insert(0, os.path.dirname(__file__))

from src.main import app
from src.models.user import db
from src.models.quote import QuoteTemplate, QuoteTemplateItem

def create_building_cleaning_template():
    """Create template for building cleaning services"""
    template = QuoteTemplate(
        name="Standard Gebäudereinigung",
        service_type="building_cleaning",
        description="Standard-Vorlage für Gebäudereinigungsdienstleistungen",
        default_title="Angebot für Gebäudereinigung",
        default_description="Professionelle Reinigungsdienstleistungen für Ihr Gebäude",
        default_terms_conditions="""Allgemeine Geschäftsbedingungen:

1. Leistungsumfang: Die Reinigungsarbeiten werden gemäß der vereinbarten Spezifikation durchgeführt.

2. Preise: Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer.

3. Zahlungsbedingungen: Zahlung innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug.

4. Haftung: Wir haften für Schäden nur bei grober Fahrlässigkeit oder Vorsatz.

5. Ausführung: Die Arbeiten werden zu den vereinbarten Terminen durchgeführt.

6. Materialien: Alle Reinigungsmittel und -geräte werden von uns gestellt.

7. Gültigkeit: Dieses Angebot ist 30 Tage gültig.

GoClean Harz - Ihr Partner für professionelle Reinigungsdienstleistungen""",
        default_validity_days=30
    )
    
    db.session.add(template)
    db.session.flush()
    
    # Template items for building cleaning
    items = [
        {
            'description': 'Grundreinigung Büroräume',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 2.50,
            'sort_order': 1,
            'notes': 'Staubsaugen, Wischen, Mülleimer leeren'
        },
        {
            'description': 'Sanitärbereich Grundreinigung',
            'default_quantity': 1.0,
            'unit': 'Stück',
            'unit_price': 15.00,
            'sort_order': 2,
            'notes': 'WC, Waschbecken, Spiegel, Boden'
        },
        {
            'description': 'Fensterreinigung innen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 3.00,
            'sort_order': 3,
            'notes': 'Scheiben und Rahmen'
        },
        {
            'description': 'Treppenhaus reinigen',
            'default_quantity': 1.0,
            'unit': 'Etage',
            'unit_price': 25.00,
            'sort_order': 4,
            'notes': 'Stufen, Geländer, Handläufe'
        },
        {
            'description': 'Küche/Teeküche reinigen',
            'default_quantity': 1.0,
            'unit': 'Stück',
            'unit_price': 20.00,
            'sort_order': 5,
            'notes': 'Arbeitsflächen, Spüle, Geräte außen'
        },
        {
            'description': 'Fensterreinigung außen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 4.50,
            'sort_order': 6,
            'notes': 'Nur bei ebenerdigen Fenstern',
            'is_optional': True
        }
    ]
    
    for item_data in items:
        item = QuoteTemplateItem(
            template_id=template.id,
            **item_data
        )
        db.session.add(item)
    
    return template

def create_garden_maintenance_template():
    """Create template for garden maintenance services"""
    template = QuoteTemplate(
        name="Standard Gartenpflege",
        service_type="garden_maintenance",
        description="Standard-Vorlage für Gartenpflegedienstleistungen",
        default_title="Angebot für Gartenpflege",
        default_description="Professionelle Gartenpflege für Ihr Grundstück",
        default_terms_conditions="""Allgemeine Geschäftsbedingungen:

1. Leistungsumfang: Die Gartenpflegearbeiten werden gemäß der vereinbarten Spezifikation durchgeführt.

2. Preise: Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer.

3. Zahlungsbedingungen: Zahlung innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug.

4. Witterung: Bei ungünstigen Witterungsbedingungen können Termine verschoben werden.

5. Entsorgung: Grünschnitt wird fachgerecht entsorgt (Kosten inklusive).

6. Geräte: Alle erforderlichen Geräte und Werkzeuge werden von uns gestellt.

7. Gültigkeit: Dieses Angebot ist 30 Tage gültig.

GoClean Harz - Ihr Partner für professionelle Gartenpflege""",
        default_validity_days=30
    )
    
    db.session.add(template)
    db.session.flush()
    
    # Template items for garden maintenance
    items = [
        {
            'description': 'Rasenmähen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 0.15,
            'sort_order': 1,
            'notes': 'Inkl. Rasenkantenschnitt'
        },
        {
            'description': 'Hecke schneiden',
            'default_quantity': 1.0,
            'unit': 'lfd. Meter',
            'unit_price': 8.00,
            'sort_order': 2,
            'notes': 'Bis 2m Höhe, inkl. Entsorgung'
        },
        {
            'description': 'Beete jäten und harken',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 12.00,
            'sort_order': 3,
            'notes': 'Unkraut entfernen, Boden lockern'
        },
        {
            'description': 'Laub entfernen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 0.25,
            'sort_order': 4,
            'notes': 'Zusammenrechen und entsorgen'
        },
        {
            'description': 'Gehwege reinigen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 2.00,
            'sort_order': 5,
            'notes': 'Kehren und bei Bedarf Hochdruckreiniger'
        },
        {
            'description': 'Baumschnitt',
            'default_quantity': 1.0,
            'unit': 'Stunden',
            'unit_price': 45.00,
            'sort_order': 6,
            'notes': 'Fachgerechter Schnitt, inkl. Entsorgung',
            'is_optional': True
        },
        {
            'description': 'Düngen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 0.50,
            'sort_order': 7,
            'notes': 'Rasendünger ausbringen',
            'is_optional': True
        }
    ]
    
    for item_data in items:
        item = QuoteTemplateItem(
            template_id=template.id,
            **item_data
        )
        db.session.add(item)
    
    return template

def create_winter_service_template():
    """Create template for winter service"""
    template = QuoteTemplate(
        name="Standard Winterdienst",
        service_type="winter_service",
        description="Standard-Vorlage für Winterdienstleistungen",
        default_title="Angebot für Winterdienst",
        default_description="Zuverlässiger Winterdienst für Ihre Verkehrsflächen",
        default_terms_conditions="""Allgemeine Geschäftsbedingungen:

1. Leistungsumfang: Räum- und Streudienst gemäß vereinbarter Spezifikation.

2. Preise: Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer.

3. Zahlungsbedingungen: Zahlung innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug.

4. Einsatzzeiten: Räumung erfolgt bei Schneehöhe ab 3cm oder bei Glätte.

5. Bereitschaft: Winterdienst von Dezember bis März.

6. Streumaterial: Umweltfreundliches Streugut wird verwendet.

7. Haftung: Verkehrssicherungspflicht wird übernommen.

8. Gültigkeit: Dieses Angebot ist 30 Tage gültig.

GoClean Harz - Ihr zuverlässiger Partner für den Winterdienst""",
        default_validity_days=30
    )
    
    db.session.add(template)
    db.session.flush()
    
    # Template items for winter service
    items = [
        {
            'description': 'Gehwege räumen und streuen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 0.80,
            'sort_order': 1,
            'notes': 'Pro Einsatz, inkl. Streugut'
        },
        {
            'description': 'Parkplätze räumen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 0.60,
            'sort_order': 2,
            'notes': 'Pro Einsatz, Schnee schieben'
        },
        {
            'description': 'Zufahrten räumen',
            'default_quantity': 1.0,
            'unit': 'm²',
            'unit_price': 0.70,
            'sort_order': 3,
            'notes': 'Pro Einsatz, inkl. Streuen'
        },
        {
            'description': 'Treppen räumen und streuen',
            'default_quantity': 1.0,
            'unit': 'lfd. Meter',
            'unit_price': 3.00,
            'sort_order': 4,
            'notes': 'Pro Einsatz, besondere Sorgfalt'
        },
        {
            'description': 'Bereitschaftspauschale',
            'default_quantity': 1.0,
            'unit': 'Monat',
            'unit_price': 50.00,
            'sort_order': 5,
            'notes': 'Dezember bis März'
        },
        {
            'description': 'Wochenend-/Feiertagszuschlag',
            'default_quantity': 1.0,
            'unit': 'Einsatz',
            'unit_price': 25.00,
            'sort_order': 6,
            'notes': '50% Aufschlag auf Grundpreise',
            'is_optional': True
        }
    ]
    
    for item_data in items:
        item = QuoteTemplateItem(
            template_id=template.id,
            **item_data
        )
        db.session.add(item)
    
    return template

def main():
    """Main function to set up quote templates"""
    with app.app_context():
        print("Setting up quote templates for GoClean Harz...")
        
        # Check if templates already exist
        existing_templates = QuoteTemplate.query.count()
        if existing_templates > 0:
            print(f"Found {existing_templates} existing templates. Skipping setup.")
            return
        
        # Create templates
        building_template = create_building_cleaning_template()
        garden_template = create_garden_maintenance_template()
        winter_template = create_winter_service_template()
        
        # Commit all changes
        db.session.commit()
        
        print("✅ Successfully created quote templates:")
        print(f"   - {building_template.name}")
        print(f"   - {garden_template.name}")
        print(f"   - {winter_template.name}")
        print("\nTemplates are ready for use in the quote system!")

if __name__ == '__main__':
    main()

