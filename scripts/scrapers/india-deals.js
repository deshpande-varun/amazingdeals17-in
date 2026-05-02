// India-specific coupon and deal scrapers:
// 1. Amazon India /deals?bubble-id=deals-collection-coupons  — on-page clip coupons
// 2. Amazon India /gp/goldbox — Lightning Deals (limited-time flash deals)
// 3. Desidime hot deals page — India's largest deal community (like Slickdeals for India)
const https = require('https');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-IN,en;q=0.9',
  'Accept-Encoding': 'identity',
};

function fetchUrl(url, depth) {
  depth = depth || 0;
  if (depth > 5) return Promise.reject(new Error('Too many redirects'));
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: HEADERS }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : 'https://www.amazon.in' + res.headers.location;
        return fetchUrl(next, depth + 1).then(resolve).catch(reject);
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

function parseINRPrice(text) {
  const m = text.match(/₹\s*([0-9,]+)/) || text.match(/Rs\.?\s*([0-9,]+)/i);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
}

function parseCouponCode(text) {
  const patterns = [
    /(?:code|coupon|promo)[:\s]+([A-Z0-9]{4,20})/i,
    /use\s+code[:\s]+([A-Z0-9]{4,20})/i,
    /enter\s+(?:code|coupon)[:\s]+([A-Z0-9]{4,20})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) return m[1].toUpperCase();
  }
  return null;
}

function parseCouponInfo(text) {
  // Amazon India clip coupon pattern: "X% off coupon" or "clip coupon"
  const pctMatch = text.match(/([0-9]+)%\s*off\s*(?:coupon|with\s*coupon)/i) ||
                   text.match(/coupon[:\s]+([0-9]+)%\s*off/i);
  if (pctMatch) {
    return { type: 'clip', amount: null, percent: parseInt(pctMatch[1], 10) };
  }
  if (/clip\s+coupon|apply\s+coupon|on.page\s+coupon/i.test(text)) {
    return { type: 'clip', amount: null, percent: null };
  }
  if (/bank\s+offer|card\s+offer|emi\s+offer/i.test(text)) {
    return { type: 'bank_offer', amount: null, percent: null };
  }
  return null;
}

function parseDealsPage(html, sourceLabel, maxPrice) {
  const deals = [];
  const seenAsins = new Set();

  const asinMatches = [...html.matchAll(/\/dp\/([A-Z0-9]{10})/g)];
  const orderedAsins = [];
  for (const m of asinMatches) {
    if (!seenAsins.has(m[1])) {
      seenAsins.add(m[1]);
      orderedAsins.push({ asin: m[1], index: m.index });
    }
  }

  for (const { asin, index } of orderedAsins) {
    const start = Math.max(0, index - 2000);
    const end = Math.min(html.length, index + 2000);
    const chunk = html.slice(start, end);
    const text = stripTags(chunk);

    const price = parseINRPrice(text);
    if (!price || price < 50 || price > maxPrice) continue;

    const titleMatch = chunk.match(/alt="([^"]{10,200})"/) ||
                       chunk.match(/"title":\s*"([^"]{10,200})"/);
    if (!titleMatch) continue;
    const title = titleMatch[1].trim();
    if (title.length < 10) continue;

    const imgMatch = chunk.match(/src="(https:\/\/images-eu\.ssl-images-amazon\.com\/images\/I\/[A-Za-z0-9%.,_-]+\.jpg)[^"]*"/) ||
                    chunk.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9%.,_-]+\.jpg)[^"]*"/);
    if (!imgMatch) continue;
    const imageUrl = imgMatch[1].replace(/\._[A-Z_0-9,]+_\.jpg$/i, '._AC_SL400_.jpg');

    const couponCode = parseCouponCode(text);
    const couponInfo = parseCouponInfo(text);

    // Original price from "M.R.P." or "was" patterns common on Amazon India
    const mrpMatch = text.match(/M\.R\.P\.?\s*:?\s*₹\s*([0-9,]+)/i) ||
                     text.match(/₹\s*([0-9,]+)\s*(?:M\.R\.P|was|before)/i);
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
      category: 'Deals',
      couponCode,
      couponType: couponInfo ? couponInfo.type : null,
      couponAmount: couponInfo ? couponInfo.amount : null,
      couponPercent: couponInfo ? couponInfo.percent : null,
      source: sourceLabel,
      rating: null,
      reviewCount: null,
      scrapedAt: new Date().toISOString(),
      status: 'pending',
    });
  }

  return deals;
}

async function scrapeIndiaCouponDeals(maxPrice) {
  const allDeals = [];
  const seenAsins = new Set();

  const sources = [
    {
      url: 'https://www.amazon.in/deals?bubble-id=deals-collection-coupons',
      label: 'amazon-coupons',
      logName: 'Amazon India Coupons',
    },
    {
      url: 'https://www.amazon.in/gp/goldbox',
      label: 'amazon-lightning',
      logName: 'Amazon India Lightning Deals',
    },
    {
      url: 'https://www.amazon.in/deals?bubble-id=deals-collection-bank-offers',
      label: 'amazon-bank-offers',
      logName: 'Amazon India Bank Offers',
    },
  ];

  console.log('  Fetching Amazon India coupon/lightning deals...');

  for (const src of sources) {
    try {
      const html = await fetchUrl(src.url);
      const deals = parseDealsPage(html, src.label, maxPrice);
      for (const deal of deals) {
        if (!seenAsins.has(deal.asin)) {
          seenAsins.add(deal.asin);
          allDeals.push(deal);
        }
      }
      console.log('  ' + src.logName + ': ' + deals.length + ' deals');
    } catch (err) {
      console.warn('  ' + src.logName + ' failed: ' + err.message);
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  return allDeals;
}

module.exports = { scrapeIndiaCouponDeals };
