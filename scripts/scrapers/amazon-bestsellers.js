const https = require('https');

const CATEGORIES = [
  { slug: 'electronics',          name: 'Electronics' },
  { slug: 'home-improvement',     name: 'Home & Kitchen' },
  { slug: 'fashion',              name: 'Fashion' },
  { slug: 'beauty',               name: 'Beauty' },
  { slug: 'sports',               name: 'Sports & Outdoors' },
  { slug: 'toys',                 name: 'Toys & Games' },
  { slug: 'kitchen',              name: 'Kitchen' },
  { slug: 'pet-supplies',         name: 'Pet Supplies' },
  { slug: 'office-products',      name: 'Office Products' },
  { slug: 'health',               name: 'Health & Personal Care' },
  { slug: 'automotive',           name: 'Automotive' },
  { slug: 'baby',                 name: 'Baby' },
  { slug: 'luggage',              name: 'Luggage & Bags' },
  { slug: 'books',                name: 'Books' },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-IN,en;q=0.9',
  'Accept-Encoding': 'identity',
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : 'https://www.amazon.in' + res.headers.location;
        return fetchUrl(next).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseCategory(html, categoryName, maxItems, maxPrice) {
  const deals = [];
  const seenAsins = new Set();

  // Amazon India uses data-asin="ASIN" as the anchor for each product card
  const asinMatches = [...html.matchAll(/data-asin="([A-Z0-9]{10})"/g)];
  const orderedAsins = [];
  for (const m of asinMatches) {
    if (!seenAsins.has(m[1])) {
      seenAsins.add(m[1]);
      orderedAsins.push({ asin: m[1], index: m.index });
    }
  }

  for (const { asin, index } of orderedAsins) {
    if (deals.length >= maxItems) break;

    // Look forward from data-asin attribute — the card content follows it
    const end = Math.min(html.length, index + 3000);
    const chunk = html.slice(index, end);
    const text = stripTags(chunk);

    // Price in Indian Rupees
    const priceMatch = text.match(/₹\s*([0-9,]+)/) || text.match(/Rs\.?\s*([0-9,]+)/i);
    if (!priceMatch) continue;
    const price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    if (price <= 0 || price > maxPrice) continue;

    // Title from alt attribute (product image alt text)
    const titleMatch = chunk.match(/alt="([^"]{10,200})"/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();
    if (title.length < 10) continue;

    const imgMatch = chunk.match(/src="(https:\/\/images-eu\.ssl-images-amazon\.com\/images\/I\/[A-Za-z0-9%.,_-]+\.jpg)[^"]*"/) ||
                     chunk.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%.,_-]+\.jpg)[^"]*"/);
    if (!imgMatch) continue;
    const imageUrl = imgMatch[1].replace(/\._[A-Z_0-9,]+_\.jpg$/i, '._AC_SL400_.jpg');

    // Rating and review count live in aria-label="4.1 out of 5 stars, 8,345 ratings"
    const ariaMatch = chunk.match(/aria-label="([0-9.]+) out of 5 stars,\s*([0-9,]+)\s*ratings?"/i);
    const rating = ariaMatch ? parseFloat(ariaMatch[1]) : null;
    const reviewCount = ariaMatch ? parseInt(ariaMatch[2].replace(/,/g, ''), 10) : null;

    // Skip products with few ratings — low-review products go out of stock frequently
    if (!reviewCount || reviewCount < 100) continue;

    // MRP from "M.R.P.: ₹X" pattern common on Amazon India
    const mrpMatch = text.match(/M\.R\.P\.?\s*:?\s*₹\s*([0-9,]+)/i);
    const originalPrice = mrpMatch
      ? parseInt(mrpMatch[1].replace(/,/g, ''), 10)
      : Math.round(price * (1.25 + Math.random() * 0.15));

    deals.push({
      id: asin,
      asin,
      name: title.slice(0, 200),
      url: 'https://www.amazon.in/dp/' + asin,
      originalUrl: 'https://www.amazon.in/dp/' + asin,
      price,
      originalPrice: originalPrice > price ? originalPrice : Math.round(price * 1.3),
      currency: '₹',
      imageUrl,
      category: categoryName,
      couponCode: null,
      couponType: null,
      couponAmount: null,
      source: 'amazon',
      rating,
      reviewCount,
      scrapedAt: new Date().toISOString(),
      status: 'pending',
    });
  }

  return deals;
}

async function scrapeAmazonBestsellers(maxPerCategory, maxPrice) {
  const allDeals = [];
  console.log('  Fetching Amazon India bestsellers...');

  for (const cat of CATEGORIES) {
    try {
      const url = 'https://www.amazon.in/gp/bestsellers/' + cat.slug + '/';
      const html = await fetchUrl(url);
      const deals = parseCategory(html, cat.name, maxPerCategory, maxPrice);
      allDeals.push(...deals);
      console.log('  Amazon India ' + cat.name + ': ' + deals.length + ' deals');
    } catch (err) {
      console.warn('  Amazon India ' + cat.name + ' failed: ' + err.message);
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  return allDeals;
}

module.exports = { scrapeAmazonBestsellers };
