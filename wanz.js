// real-traffic.js
import { chromium } from 'playwright';

async function generateRealTraffic(targetUrl) {
  console.log(`🚀 Memulai kunjungan ke: ${targetUrl}`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--lang=en-US,en',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    permissions: ['geolocation'],
    geolocation: { latitude: 40.7128, longitude: -74.006 },
    httpCredentials: null,
  });

  const page = await context.newPage();

  // Menyembunyikan jejak otomatisasi
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });
  });

  try {
    // 1. Buka halaman
    await page.goto(targetUrl, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    console.log('✅ Halaman dimuat');

    // 2. Scroll perlahan seperti manusia
    await page.evaluate(async () => {
      const totalHeight = document.body.scrollHeight;
      let current = 0;
      while (current < totalHeight) {
        window.scrollBy(0, 100);
        current += 100;
        await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 100));
      }
    });
    console.log('ScrollIndicator: Scroll selesai');

    // 3. Tunggu sebentar (simulasi baca konten)
    await page.waitForTimeout(2000 + Math.random() * 3000);

    // 4. Coba klik elemen pertama yang bisa diklik
    const clickable = await page.$('a, button, [onclick], .btn, [role="button"]');
    if (clickable) {
      try {
        await clickable.click({ timeout: 3000 });
        console.log('🖱️ Klik berhasil pada elemen interaktif');
        await page.waitForTimeout(1500);
      } catch (e) {
        console.log('⚠️ Gagal klik, lanjut tanpa klik');
      }
    }

    // 5. Tinggalkan halaman setelah interaksi
    await page.waitForTimeout(1000);
    console.log('🔚 Kunjungan selesai — traffic seharusnya tercatat di analitik Anda.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }
}

// 🔴 GANTI DENGAN SITUS ANDA SENDIRI YANG SUDAH PAKAI CLOUDFLARE / GOOGLE TAGS
const YOUR_SITE = 'https://project48.xyz/home'; // ❌ GANTI INI!

generateRealTraffic(YOUR_SITE);