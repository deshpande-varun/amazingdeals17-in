# Amazon Product Advertising API Setup Guide 🇮🇳

## Step 1: Access Your Amazon Associates Dashboard

1. Go to: **https://affiliate.amazon.in/**
2. Log in with your Associates credentials
3. Navigate to **Tools** → **Product Advertising API**
   - Or try: https://webservices.amazon.in/

## Step 2: Check API Access Status

### Option A: Already Approved
If you see **"Access Key"** and **"Secret Key"** on the dashboard:
- ✅ You already have API access!
- Copy both keys and skip to Step 4

### Option B: Need to Apply
If you don't see API credentials:

**Requirements:**
- ✅ Active Amazon Associates account (you have this)
- One of the following:
  - **3 qualified sales** in last 180 days, OR
  - **Active website** with published content (you have this!)

**To Apply:**
1. In Associates Central, go to **"Product Advertising API"**
2. Click **"Request Access"** or **"Sign Up"**
3. Provide your website: `https://amazingdeals17-in.vercel.app`
4. Wait for approval (usually instant if you meet requirements)

## Step 3: Alternative - Use SiteStripe (No Waiting)

If PA-API requires approval, you can start immediately with **SiteStripe**:
1. Install browser extension from Associates dashboard
2. Browse Amazon India deals
3. Click SiteStripe bar → Get link with your tag
4. Add deals manually to your site

## Step 4: Get Your API Credentials

Once approved, you'll get:
```
Access Key ID:     AKIAXXXXXXXXXXXXXXXX
Secret Access Key: wJalrXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Associate Tag:     amazingdeaz17-21 (you already have this)
```

## Step 5: Add to Your Environment

### Local Development:
Add to `~/.env`:
```bash
AMAZON_PA_ACCESS_KEY=your_access_key_here
AMAZON_PA_SECRET_KEY=your_secret_key_here
```

### GitHub Actions:
Add secrets at: https://github.com/deshpande-varun/amazingdeals17-in/settings/secrets/actions

1. `AMAZON_PA_ACCESS_KEY`
2. `AMAZON_PA_SECRET_KEY`

### Vercel:
```bash
cd ~/Desktop/amazingdeals17-in
vercel env add AMAZON_PA_ACCESS_KEY production
vercel env add AMAZON_PA_SECRET_KEY production
```

## Step 6: Update Scraper Script

Edit `package.json` to use the new scraper:
```json
{
  "scripts": {
    "scrape": "node scripts/scrape-deals-paapi.js"
  }
}
```

## Step 7: Test It!

```bash
cd ~/Desktop/amazingdeals17-in
AMAZON_PA_ACCESS_KEY=your_key AMAZON_PA_SECRET_KEY=your_secret npm run scrape
```

You should see:
```
🚀 Starting Amazon India Product Advertising API scraper...
📊 Target: 50 deals under ₹5000
🔍 Fetching bestsellers from Amazon India...

Fetching Electronics...
  Found 10 items
...
✅ Filtered to 50 deals under ₹5000
💾 Saved 50 deals to deals.json
✨ Scraping complete!
```

## Benefits of Official API

✅ **Real product images** that work  
✅ **Official API** - won't get blocked  
✅ **Better data** - titles, prices, images all correct  
✅ **Reliable** - Amazon maintains it  
✅ **Legal** - compliant with terms of service  

## Troubleshooting

### "403 Forbidden" or "Not Authorized"
- Check your Associate Tag is correct: `amazingdeaz17-21`
- Verify credentials are for **Amazon India** (not .com)
- Make sure API access is approved

### "Invalid Marketplace"
- Ensure using `www.amazon.in` as marketplace
- Not `.com` or other domains

### "No qualified sales"
- Your website is live - this should qualify you
- If rejected, make 3 purchases through your own affiliate links
- Contact Amazon Associates support

## Next Steps

Once you get API access:
1. ✅ Add credentials to environment
2. ✅ Run test scrape
3. ✅ Update GitHub Actions workflow
4. ✅ Deploy to Vercel with new env vars
5. ✅ Enjoy real product images! 🎉

---

**Need help?** Contact Amazon Associates India Support:
- Email: associates-india@amazon.in
- Support: https://affiliate.amazon.in/help

**Status of Setup:**
- [ ] API access requested/approved
- [ ] Credentials obtained
- [ ] Environment variables set
- [ ] Test scrape successful
- [ ] GitHub Actions updated
- [ ] Vercel env vars configured
