# Rainforest API Setup (Temporary Solution) 🌧️

## Why Rainforest API?

✅ **Free tier:** 100 requests/month  
✅ **Built for Amazon:** Specifically designed for Amazon scraping  
✅ **Works with Amazon India:** Full support for amazon.in  
✅ **Real images:** Product images that work  
✅ **No VPN needed:** Works from anywhere  
✅ **Quick setup:** 5 minutes to get started  

## Setup Steps

### 1. Sign Up (Free)

Go to: **https://www.rainforestapi.com/pricing**

- Click **"Start Free Trial"**
- No credit card required for free tier
- Get **100 free API calls/month**

### 2. Get Your API Key

After signup:
1. Go to dashboard
2. Copy your **API Key**

### 3. Add to Environment

**Local:**
```bash
echo "RAINFOREST_API_KEY=your_api_key_here" >> ~/.env
```

**GitHub Actions:**
```bash
cd ~/Desktop/amazingdeals17-in
gh secret set RAINFOREST_API_KEY --body "your_api_key_here"
```

**Vercel:**
```bash
vercel env add RAINFOREST_API_KEY production
```

### 4. Update Scraper

Edit `package.json`:
```json
{
  "scripts": {
    "scrape": "node scripts/scrape-deals-rainforest.js"
  }
}
```

### 5. Test It!

```bash
cd ~/Desktop/amazingdeals17-in
RAINFOREST_API_KEY=your_key npm run scrape
```

Should output:
```
🌧️ Starting Rainforest API scraper for Amazon India...
📊 Target: 50 deals under ₹5000

Fetching electronics bestsellers...
  Found 20 products

Fetching home-kitchen bestsellers...
  Found 20 products
...

📦 Total products scraped: 100
✅ Filtered to 50 deals under ₹5000
💾 Saved 50 deals to deals.json
✨ Scraping complete!

🎉 SUCCESS! Ready to post deals.
```

## Free Tier Limits

- **100 requests/month** = ~3 scrapes/month (5 categories each)
- Perfect for testing!
- Upgrade if you need more (starts at $49/mo for 5000 calls)

## Temporary Solution

Use this **until you get Amazon PA-API access**:

| Timeline | Solution |
|----------|----------|
| **Now** | Rainforest API (100 calls/month) |
| **1-3 days** | Associates account approved |
| **After 10 sales** | Amazon PA-API (unlimited, free) |

## Next Steps

1. ✅ Sign up for Rainforest API
2. ✅ Add API key to environment
3. ✅ Test scraper
4. ✅ Deploy to production
5. ✅ Get real product images!

Then work toward PA-API:
- Complete Associates profile
- Get account approved
- Make 10 qualifying sales
- Switch to official Amazon API

---

**Questions?** Rainforest support: support@rainforestapi.com
