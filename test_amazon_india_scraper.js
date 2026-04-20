const https = require('https');

const APIFY_TOKEN = process.env.APIFY_TOKEN || 'test';

// Test with junglee/Amazon-crawler (note the capital A)
const apifyInput = {
  startUrls: [
    { "url": "https://www.amazon.in/gp/bestsellers/electronics/" }
  ],
  maxItems: 10,
  proxy: {
    useApifyProxy: true
  }
};

function apifyRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.apify.com',
      path: endpoint,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAmazonIndiaScraper() {
  console.log('🧪 Testing junglee/Amazon-crawler with Amazon India...\n');

  try {
    // Start the actor
    const runResponse = await apifyRequest(
      'POST',
      `/v2/acts/junglee~Amazon-crawler/runs?token=${APIFY_TOKEN}`,
      apifyInput
    );

    const runId = runResponse.data.id;
    const datasetId = runResponse.data.defaultDatasetId;

    console.log(`✓ Run started: ${runId}`);
    console.log(`✓ Dataset: ${datasetId}`);
    console.log('\nWaiting for completion...');

    // Poll for status
    let status = 'RUNNING';
    let attempts = 0;
    while (status === 'RUNNING' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await apifyRequest('GET', `/v2/acts/junglee~Amazon-crawler/runs/${runId}?token=${APIFY_TOKEN}`);
      status = statusResponse.data.status;
      console.log(`Status: ${status}`);
      attempts++;
    }

    if (status === 'SUCCEEDED') {
      // Get results
      const results = await apifyRequest('GET', `/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
      console.log(`\n✅ SUCCESS! Found ${results.length} products\n`);
      
      if (results.length > 0) {
        const sample = results[0];
        console.log('Sample product:');
        console.log(`- Name: ${sample.title || sample.name}`);
        console.log(`- Price: ${sample.price}`);
        console.log(`- Image: ${sample.image || sample.thumbnailImage}`);
        console.log(`- ASIN: ${sample.asin}`);
        console.log('\nThis actor works for Amazon India! ✓');
      }
    } else {
      console.log(`\n❌ Run ${status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAmazonIndiaScraper();
