const express = require('express');
const path = require('path');
const { chromium } = require('playwright');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: 'dvptl0puc',
  api_key: '973667497323419',
  api_secret: '3Ak-OCX-YNLsRPZP0WPmMPr1CFg'
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { result: null });
});

app.post('/screenshot', async (req, res) => {
  const { url, device } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.render('index', {
      result: { error: 'URL harus diawali dengan http:// atau https://' }
    });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const viewport = device === 'mobile'
      ? { width: 375, height: 667 }
      : { width: 1920, height: 1080 };

    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const buffer = await page.screenshot({ fullPage: true });

    const uploadResult = await cloudinary.uploader.upload_stream(
      { folder: 'screenshots', resource_type: 'image' },
      (error, result) => {
        if (error) throw error;
      }
    ).end(buffer);

    await context.close();

    const result = {
      url,
      screenshotUrl: uploadResult.secure_url,
      device: device === 'mobile' ? 'Mobile' : 'Desktop'
    };

    res.render('index', { result });

  } catch (err) {
    console.error(err);
    res.render('index', {
      result: { error: 'Gagal mengambil screenshot: ' + err.message }
    });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});