const fs = require('fs');
const path = require('path');

const { scrapeAmazonBestsellers } = require('./scrapers/amazon-bestsellers');
const { scrapeIndiaCouponDeals } = require('./scrapers/india-deals');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/config.json'), 'utf8'));
const MAX_TOTAL = 1000;
const MAX_PRICE = config.amazonConfig.priceRange.max || 5000;
const AFFILIATE_TAG = config.amazonConfig.affiliateTag;

console.log('Starting India deal scraper — cap: ' + MAX_TOTAL + ' deals under ₹' + MAX_PRICE);

async function runAll() {
  const dealsFile = path.join(__dirname, '../data/deals.json');
  let existingDeals = [];
  if (fs.existsSync(dealsFile)) {
    try {
      const raw = fs.readFileSync(dealsFile, 'utf8');
      existingDeals = JSON.parse(raw);
      console.log('Loaded ' + existingDeals.length + ' existing deals');
    } catch (e) {
      console.warn('Could not parse existing deals.json, starting fresh');
    }
  }

  // Amazon bestsellers first (polite delays built in), then coupon deals in parallel
  let amazonDeals = [];
  try {
    amazonDeals = await scrapeAmazonBestsellers(10, MAX_PRICE);
  } catch (err) {
    console.warn('Amazon bestsellers scraper failed: ' + err.message);
  }

  let couponDeals = [];
  try {
    couponDeals = await scrapeIndiaCouponDeals(MAX_PRICE);
  } catch (err) {
    console.warn('India coupon deals scraper failed: ' + err.message);
  }

  const todayRaw = [...couponDeals, ...amazonDeals];

  // Deduplicate today's batch, apply filters, add affiliate tag
  const seenToday = new Set();
  const todayDeals = [];
  for (const deal of todayRaw) {
    if (!deal.asin || seenToday.has(deal.asin)) continue;
    if (!deal.price || deal.price <= 0 || deal.price > MAX_PRICE) continue;
    seenToday.add(deal.asin);
    todayDeals.push({
      ...deal,
      url: 'https://www.amazon.in/dp/' + deal.asin + '?tag=' + AFFILIATE_TAG + '&linkCode=ogi&th=1&psc=1',
    });
  }

  console.log('New deals today: ' + todayDeals.length);

  // Coupon deals float above plain deals within today's batch
  const sortedToday = [...todayDeals].sort((a, b) => {
    const aHasCoupon = !!(a.couponCode || a.couponType);
    const bHasCoupon = !!(b.couponCode || b.couponType);
    if (aHasCoupon && !bHasCoupon) return -1;
    if (!aHasCoupon && bHasCoupon) return 1;
    return 0;
  });

  const existingFiltered = existingDeals.filter(d => !seenToday.has(d.asin));
  const merged = [...sortedToday, ...existingFiltered].slice(0, MAX_TOTAL);

  console.log('Total after merge: ' + merged.length + ' deals (dropped ' +
    Math.max(0, sortedToday.length + existingFiltered.length - MAX_TOTAL) + ' oldest)');

  fs.writeFileSync(dealsFile, JSON.stringify(merged, null, 2));
  console.log('Saved ' + merged.length + ' deals to deals.json');

  return merged;
}

if (require.main === module) {
  runAll()
    .then(deals => {
      console.log('Done. ' + deals.length + ' deals ready.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed: ' + err.message);
      process.exit(1);
    });
}

module.exports = { runAll };
