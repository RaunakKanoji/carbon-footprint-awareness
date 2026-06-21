/**
 * Carbon Compass – README Screenshot Capture Script
 * Run with: node scripts/capture-readme-screenshots.mjs
 * Requires: npx playwright install chromium (first time)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '../docs/screenshots');
const BASE_URL = 'http://localhost:3001';
const DESKTOP_VIEWPORT = { width: 1440, height: 900 };

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const routes = [
  { path: '/', name: 'landing-page', wait: 4000 },
  { path: '/dashboard', name: 'dashboard', wait: 5000 },
  { path: '/activity', name: 'activity', wait: 3000 },
  { path: '/simulator', name: 'simulation', wait: 3000 },
  { path: '/challenges', name: 'challenges', wait: 3000 },
  { path: '/profile', name: 'profile', wait: 3000 },
  { path: '/insights', name: 'insights', wait: 3000 },
  { path: '/products', name: 'products', wait: 3000 },
  { path: '/coach', name: 'coach', wait: 3000 },
];

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: DESKTOP_VIEWPORT,
    deviceScaleFactor: 1,
  });

  const results = [];

  for (const route of routes) {
    const page = await context.newPage();
    const url = `${BASE_URL}${route.path}`;
    
    try {
      console.log(`→ Navigating to ${url}`);
      await page.goto(url, { timeout: 30000, waitUntil: 'load' });
      await page.waitForTimeout(route.wait);
      
      const finalUrl = page.url();
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${route.name}.png`);
      
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  ✓ Saved ${route.name}.png (final URL: ${finalUrl})`);
      results.push({ name: route.name, status: 'ok', finalUrl });
    } catch (err) {
      console.error(`  ✗ Failed ${route.name}: ${err.message}`);
      results.push({ name: route.name, status: 'failed', error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  
  console.log('\n=== Screenshot Summary ===');
  results.forEach(r => {
    if (r.status === 'ok') {
      console.log(`✓ ${r.name} → ${r.finalUrl}`);
    } else {
      console.log(`✗ ${r.name} → ${r.error}`);
    }
  });
}

captureScreenshots().catch(console.error);
