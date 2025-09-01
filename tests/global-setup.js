import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Warte bis das Backend läuft
  try {
    await page.goto('http://localhost:5000/api/customers');
    console.log('✅ Backend läuft auf Port 5000');
  } catch (error) {
    console.log('❌ Backend nicht erreichbar auf Port 5000');
  }
  
  await browser.close();
}

export default globalSetup;
