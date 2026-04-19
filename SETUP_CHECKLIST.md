# Setup Checklist for Amazing Deals India 🇮🇳

## ✅ What's Done

- [x] GitHub repository created: `amazingdeals17-in`
- [x] Code adapted for Amazon India (amazon.in URLs)
- [x] Currency changed to ₹ (Rupees)
- [x] Price range set to ₹0 - ₹5000
- [x] Branding updated: "Amazing Deals India 🇮🇳"
- [x] Instagram handle: `@amazingdeals_17_in`
- [x] Scraper configured for Amazon India bestsellers
- [x] GitHub Actions workflow ready
- [x] Code pushed to GitHub

## 🔧 What You Need to Do

### 1. Update Amazon India Affiliate Tag

**File:** `data/config.json`

```json
{
  "amazonConfig": {
    "affiliateTag": "YOUR-AMAZON-INDIA-TAG-21"  // ← Change this
  }
}
```

**Steps:**
1. Go to Amazon India Associates: https://affiliate.amazon.in/
2. Create/login to your account
3. Get your tracking ID (format: `yourname-21`)
4. Update in `data/config.json`
5. Commit and push:
   ```bash
   cd ~/Desktop/amazingdeals17-in
   git add data/config.json
   git commit -m "Add Amazon India affiliate tag"
   git push
   ```

### 2. Set Up GitHub Secret

**Add APIFY_TOKEN:**
1. Go to: https://github.com/deshpande-varun/amazingdeals17-in/settings/secrets/actions
2. Click "New repository secret"
3. Name: `APIFY_TOKEN`
4. Value: (same token from US site - it works for both)
5. Click "Add secret"

### 3. Deploy to Vercel

**Option A: Using Vercel Dashboard**
1. Go to: https://vercel.com/new
2. Import `deshpande-varun/amazingdeals17-in`
3. Add environment variable:
   - Name: `APIFY_TOKEN`
   - Value: (your Apify token)
4. Click "Deploy"

**Option B: Using CLI**
```bash
cd ~/Desktop/amazingdeals17-in
vercel
vercel --prod
```

### 4. Update Instagram Handle (Optional)

If you want a different Instagram handle, update in:
- `data/config.json` → `siteConfig.instagram`
- `public/index.html` → Instagram link

### 5. Test the Scraper

```bash
cd ~/Desktop/amazingdeals17-in
APIFY_TOKEN=<your-token> npm run scrape
```

Should see:
```
🔍 Scraping Amazon India bestsellers...
📦 Found XX products from Amazon India
✅ Filtered to XX deals under ₹5000
💾 Saved XX deals to deals.json
```

### 6. Enable GitHub Actions

1. Go to: https://github.com/deshpande-varun/amazingdeals17-in/actions
2. Click "I understand my workflows, go ahead and enable them"
3. Test manual run: Click "Daily Deals Scraper" → "Run workflow"

### 7. Test the Website

After Vercel deployment:
1. Visit: `https://amazingdeals17-in.vercel.app`
2. Check deals display with ₹ currency
3. Verify "Amazing Deals India 🇮🇳" branding
4. Test admin panel: `https://amazingdeals17-in.vercel.app/admin`

## 📅 Automation Schedule

Workflow runs daily at **9:30 AM IST (4:00 AM UTC)**

To change schedule, edit `.github/workflows/daily-scrape.yml`:
```yaml
schedule:
  - cron: '0 4 * * *'  # 9:30 AM IST
```

## 🌐 URLs

- **Repository:** https://github.com/deshpande-varun/amazingdeals17-in
- **Vercel Dashboard:** (after deployment)
- **Live Site:** (after deployment)
- **Admin Panel:** (after deployment)/admin

## 🆚 Differences from US Site

| Feature | US Site | India Site |
|---------|---------|------------|
| Domain | amazon.com | amazon.in |
| Currency | $ (USD) | ₹ (INR) |
| Price Range | $0-$100 | ₹0-₹5000 |
| Instagram | @amazingdeals_17 | @amazingdeals_17_in |
| Scrape Time | 9 AM UTC | 9:30 AM IST (4 AM UTC) |

## 🎯 Next Steps After Setup

1. Run first scrape to get deals
2. Deploy to Vercel
3. Create Instagram account
4. Start posting deals!

---

**Questions?** Everything is set up and ready to go once you add your affiliate tag! 🚀
