const fs = require('fs');
const path = require('path');
const amazonPaapi = require('amazon-paapi');

// Load config
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/config.json'), 'utf8'));

console.log('🚀 Starting Amazon India Product Advertising API scraper...');
console.log(`📊 Target: ${config.amazonConfig.dealsPerDay} deals under ₹${config.amazonConfig.priceRange.max}`);

async function scrapeAmazonIndiaDeals() {
  try {
    // Check for API credentials
    const PA_API_ACCESS_KEY = process.env.AMAZON_PA_ACCESS_KEY;
    const PA_API_SECRET_KEY = process.env.AMAZON_PA_SECRET_KEY;
    const ASSOCIATE_TAG = config.amazonConfig.affiliateTag;

    if (!PA_API_ACCESS_KEY || !PA_API_SECRET_KEY) {
      throw new Error(`
❌ Amazon Product Advertising API credentials not found!

Please set these environment variables:
- AMAZON_PA_ACCESS_KEY
- AMAZON_PA_SECRET_KEY

Get them from: https://affiliate.amazon.in/assoc_credentials/home
      `);
    }

    // Initialize PA-API client for India
    const commonParameters = {
      AccessKey: PA_API_ACCESS_KEY,
      SecretKey: PA_API_SECRET_KEY,
      PartnerTag: ASSOCIATE_TAG,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.in'  // India marketplace
    };

    console.log('🔍 Fetching bestsellers from Amazon India...\n');

    // Categories to search (Amazon Browse Node IDs for India)
    const categories = [
      { name: 'Electronics', nodeId: '976419031' },
      { name: 'Home & Kitchen', nodeId: '976442031' },
      { name: 'Sports & Fitness', nodeId: '1984443031' },
      { name: 'Fashion', nodeId: '1571271031' },
      { name: 'Beauty', nodeId: '1374337031' }
    ];

    let allProducts = [];

    // Fetch products from each category
    for (const category of categories) {
      try {
        console.log(`Fetching ${category.name}...`);

        const requestParameters = {
          BrowseNodeId: category.nodeId,
          ItemCount: Math.ceil(config.amazonConfig.dealsPerDay / categories.length),
          Resources: [
            'Images.Primary.Large',
            'ItemInfo.Title',
            'ItemInfo.Features',
            'Offers.Listings.Price',
            'Offers.Listings.SavingBasis',
            'ItemInfo.Classifications'
          ]
        };

        const response = await amazonPaapi.GetBrowseNodes(commonParameters, requestParameters);

        if (response && response.BrowseNodesResult) {
          const items = response.BrowseNodesResult.BrowseNodes || [];
          console.log(`  Found ${items.length} items`);
          allProducts = allProducts.concat(
            items.map(item => ({ ...item, category: category.name }))
          );
        }

      } catch (error) {
        console.error(`  Error fetching ${category.name}:`, error.message);
      }
    }

    console.log(`\n📦 Total products found: ${allProducts.length}`);

    // Filter and format deals
    const deals = allProducts
      .filter(item => {
        const price = item.Offers?.Listings?.[0]?.Price?.Amount;
        return price && price <= config.amazonConfig.priceRange.max;
      })
      .slice(0, config.amazonConfig.dealsPerDay)
      .map(item => {
        const listing = item.Offers?.Listings?.[0];
        const currentPrice = listing?.Price?.Amount || 0;
        const originalPrice = listing?.SavingBasis?.Amount || Math.floor(currentPrice * 1.3);

        return {
          id: item.ASIN,
          name: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
          url: item.DetailPageURL,
          originalUrl: item.DetailPageURL?.split('?')[0],
          asin: item.ASIN,
          price: currentPrice,
          currency: '₹',
          rating: 0, // PA-API doesn't provide ratings
          reviewCount: 0,
          imageUrl: item.Images?.Primary?.Large?.URL || item.Images?.Primary?.Medium?.URL,
          category: item.category || 'General',
          position: 0,
          scrapedAt: new Date().toISOString(),
          status: 'pending',
          originalPrice: originalPrice
        };
      });

    console.log(`✅ Filtered to ${deals.length} deals under ₹${config.amazonConfig.priceRange.max}`);

    // Save deals
    const dealsFile = path.join(__dirname, '../data/deals.json');
    fs.writeFileSync(dealsFile, JSON.stringify(deals, null, 2));

    console.log(`💾 Saved ${deals.length} deals to deals.json`);
    console.log('✨ Scraping complete!');

    return deals;

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  scrapeAmazonIndiaDeals()
    .then(deals => {
      console.log('\n🎉 SUCCESS! Deals ready to post.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 FAILED');
      process.exit(1);
    });
}

module.exports = { scrapeAmazonIndiaDeals };
