require('dotenv').config();
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
  res.render('index');
});

app.post('/analyze', async (req, res) => {
  const { url, device } = req.body;
  let result = { url, screenshots: [], error: null };

  if (!url.startsWith('http')) {
    return res.render('index', { result: { error: 'URL harus diawali http:// atau https://' } });
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const viewport = device === 'mobile'
      ? { width: 375, height: 667 }
      : { width: 1366, height: 768 };

    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const links = await page.$$eval('a[href]', as => as.map(a => a.href).filter(href => href.startsWith('http')));
    result.linksCount = links.length;

    const buffer = await page.screenshot({ fullPage: true });
    const uploadResult = await cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, cldResult) => {
        if (error) throw error;
      }
    ).end(buffer);

    result.screenshots.push({ url: uploadResult.secure_url, device });

    await context.close();
  } catch (err) {
    result.error = err.message;
  } finally {
    if (browser) await browser.close();
  }

  res.render('index', { result });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});