import { test, expect } from '@playwright/test';

test.describe('GoClean Harz CRM - Vollständige Systemtests', () => {
  test.beforeEach(async ({ page }) => {
    // Zur Startseite navigieren
    await page.goto('/');
    await expect(page).toHaveTitle(/GoClean Harz/);
  });

  test.describe('Dashboard', () => {
    test('Dashboard lädt korrekt und zeigt Kennzahlen', async ({ page }) => {
      // Dashboard sollte als Standard angezeigt werden
      await expect(page.locator('h1')).toContainText('Dashboard');
      
      // Kennzahlen sollten sichtbar sein
      await expect(page.locator('[data-testid="stats-card"]')).toHaveCount(4);
      await expect(page.locator('[data-testid="order-chart"]')).toBeVisible();
    });
  });

  test.describe('Kunden-Modul', () => {
    test('Kundenliste anzeigen', async ({ page }) => {
      await page.click('text=Kunden');
      await expect(page.locator('h1')).toContainText('Kunden');
      await expect(page.locator('[data-testid="customer-list"]')).toBeVisible();
    });

    test('Neuen Kunden erstellen', async ({ page }) => {
      await page.click('text=Kunden');
      await page.click('text=Neuer Kunde');
      
      // Formular ausfüllen
      await page.fill('[data-testid="first-name"]', 'Max');
      await page.fill('[data-testid="last-name"]', 'Mustermann');
      await page.fill('[data-testid="email"]', 'max@test.com');
      await page.fill('[data-testid="phone"]', '0123456789');
      
      await page.click('text=Speichern');
      
      // Erfolgsmeldung prüfen
      await expect(page.locator('.success-message')).toContainText('Kunde erfolgreich erstellt');
    });
  });

  test.describe('Aufträge-Modul', () => {
    test('Auftragsliste anzeigen', async ({ page }) => {
      await page.click('text=Aufträge');
      await expect(page.locator('h1')).toContainText('Aufträge');
      await expect(page.locator('[data-testid="order-list"]')).toBeVisible();
    });
  });

  test.describe('Angebote-Modul', () => {
    test('Angebotsliste anzeigen', async ({ page }) => {
      await page.click('text=Angebote');
      await expect(page.locator('h1')).toContainText('Angebote');
    });
  });

  test.describe('Rechnungen-Modul', () => {
    test('Rechnungsliste anzeigen', async ({ page }) => {
      await page.click('text=Rechnungen');
      await expect(page.locator('h1')).toContainText('Rechnungen');
    });
  });

  test.describe('Kommunikation-Modul', () => {
    test('Kommunikationsliste anzeigen', async ({ page }) => {
      await page.click('text=Kommunikation');
      await expect(page.locator('h1')).toContainText('Kommunikation');
    });
  });

  test.describe('Zeiterfassung-Modul', () => {
    test('Zeiterfassungsliste anzeigen', async ({ page }) => {
      await page.click('text=Zeiterfassung');
      await expect(page.locator('h1')).toContainText('Zeiterfassung');
    });
  });

  test.describe('Qualitätskontrolle-Modul', () => {
    test('Qualitätsprüfungsliste anzeigen', async ({ page }) => {
      await page.click('text=Qualitätskontrolle');
      await expect(page.locator('h1')).toContainText('Qualitätskontrolle');
    });
  });

  test.describe('Inventar-Modul', () => {
    test('Inventarliste anzeigen', async ({ page }) => {
      await page.click('text=Inventar');
      await expect(page.locator('h1')).toContainText('Inventar');
    });
  });
});
