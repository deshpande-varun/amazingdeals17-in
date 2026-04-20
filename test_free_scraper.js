const https = require('https');

const APIFY_TOKEN = process.env.APIFY_TOKEN;

// Test with free-amazon-product-scraper
const apifyInput = {
  searchKeywords: ["electronics"],
  domain: "in",  // India domain
  maxResults: 10
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

async function test() {
  console.log('🧪 Testing junglee/free-amazon-product-scraper for India...\n');

  try {
    const runResponse = await apifyRequest(
      'POST',
      `/v2/acts/junglee~free-amazon-product-scraper/runs?token=${APIFY_TOKEN}`,
      apifyInput
    );

    const runId = runResponse.data.id;
    console.log(`✓ Run started: ${runId}\n`);

    let status = 'RUNNING';
    let attempts = 0;
    while (status === 'RUNNING' && attempts < 24) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const statusResponse = await apifyRequest('GET', `/v2/acts/junglee~free-amazon-product-scraper/runs/${runId}?token=${APIFY_TOKEN}`);
      status = statusResponse.data.status;
      console.log(`Status: ${status}`);
      attempts++;
    }

    if (status === 'SUCCEEDED') {
      const datasetId = runResponse.data.defaultDatasetId;
      const results = await apifyRequest('GET', `/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
      console.log(`\n✅ SUCCESS! Found ${results.length} products\n`);
      
      if (results.length > 0) {
        console.log('Sample product:');
        console.log(JSON.stringify(results[0], null, 2));
      }
    } else {
      console.log(`\n❌ Run ${status}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
