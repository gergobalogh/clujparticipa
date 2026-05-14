import { chromium } from 'playwright';

const query = process.argv[2];
if (!query) { console.error('Usage: node google_search.mjs "query"'); process.exit(1); }

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&num=20`, { waitUntil: 'domcontentloaded' });

const results = await page.evaluate(() => {
  const items = [];
  document.querySelectorAll('div.g').forEach(el => {
    const title = el.querySelector('h3')?.textContent || '';
    const link = el.querySelector('a')?.href || '';
    const snippet = el.querySelector('.VwiC3b')?.textContent || '';
    if (title && link) items.push({ title, link, snippet });
  });
  return items;
});

console.log(JSON.stringify(results, null, 2));
await browser.close();
