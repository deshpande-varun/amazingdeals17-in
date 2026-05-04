# Amazon Deals India — Project Context

## What This Is
Amazon India affiliate deals website. Scrapes deals from Amazon.in bestsellers daily, deploys to Vercel. India version of topdealzdaily.com (US site).

## Domain & Hosting
- **Live site:** amazingdeals17-in.vercel.app (no custom domain yet)
- **Hosting:** Vercel
- **Repo:** github.com/deshpande-varun/amazingdeals17-in

## Business Owner
Wife (H4 EAD) — all accounts and income must be in her name. Varun is on H1B.
- Amazon India Associates tag: `amazingdeaz17-21` — **NOT YET APPROVED**
- Instagram: @amazingdeals_17_in (not yet set up as Business account)

## ⚠️ Blocked — Waiting On
1. **Amazon India Associates account approval** — affiliate tag `amazingdeaz17-21` is pending. Until approved, affiliate links won't earn commission. Do NOT launch publicly until this is approved.
2. **Instagram Business account** — @amazingdeals_17_in needs to be converted to a Business account before Instagram Graph API auto-posting can be set up.
3. **Custom domain** — no domain purchased yet for India site.

## Key Files
- `scripts/scrape-all.js` — daily orchestrator (`npm run scrape`)
- `scripts/scrapers/amazon-bestsellers.js` — scrapes Amazon.in categories
- `scripts/scrapers/india-deals.js` — India-specific deals scraper
- `data/config.json` — affiliate tag, price range (₹0–₹5000), site config
- `data/deals.json` — accumulated deals
- `.github/workflows/daily-scrape.yml` — GitHub Actions cron at 4:30am UTC (10am IST)

## Daily Pipeline (current)
```
4:30am UTC (10am IST) → GitHub Actions → npm run scrape → commit deals.json → vercel --prod
```
Instagram auto-posting is NOT yet set up (blocked on affiliate approval + Instagram Business account).

## Config (data/config.json)
- Currency: ₹ (INR)
- Price range: ₹0 – ₹5000
- Affiliate domain: amazon.in
- Affiliate tag: `amazingdeaz17-21` (pending approval)
- Scrape schedule: 4:30am UTC = 10am IST
- Instagram handle: @amazingdeals_17_in

## TODO — When Amazon Associates India is Approved
1. Verify `affiliateTag` in `data/config.json` is set to the approved tag (`amazingdeaz17-21`)
2. Test that affiliate links on the site include `?tag=amazingdeaz17-21`
3. Launch site publicly / share on social media

## TODO — Instagram Auto-Posting (after approval)
Mirror exactly what was built for the US site (topdealzdaily-website). Steps:

1. **Convert @amazingdeals_17_in to Instagram Business account** (Settings → Account → Switch to Professional)
2. **Connect to a Facebook Page** (required for Graph API access)
3. **Create a Meta Developer App** at developers.facebook.com — add Instagram Graph API product
4. **Generate a long-lived access token** (expires every 60 days — set reminder)
5. **Add GitHub secret** `INSTAGRAM_ACCESS_TOKEN` in repo settings
6. **Copy and adapt these scripts from topdealzdaily-website:**
   - `scripts/create-deal-image.js` — generates 1080x1080 feed + 1080x1920 story images
     - Change currency symbol from `$` to `₹`
     - Change handle from `@topdealzzdaily` to `@amazingdeals_17_in`
     - Change footer domain to India site URL
     - Change hashtags to Indian ones (see config.json instagramConfig.hashtags)
   - `scripts/post-instagram.js` — posts feed + story per deal via Graph API
     - Update `INSTAGRAM_ACCOUNT_ID` to the India account's ID
     - Update caption hashtags to Indian ones
7. **Add Instagram posting step to `.github/workflows/daily-scrape.yml`:**
   ```yaml
   - name: Post deals to Instagram
     env:
       INSTAGRAM_ACCESS_TOKEN: ${{ secrets.INSTAGRAM_ACCESS_TOKEN }}
     run: node scripts/post-instagram.js
   ```
8. **Install canvas dependency:** `npm install canvas` (already in US site)

## Key Differences vs US Site (topdealzdaily-website)
| | US Site | India Site |
|---|---|---|
| Currency | $ USD | ₹ INR |
| Amazon domain | amazon.com | amazon.in |
| Price range | $0–$100 | ₹0–₹5000 |
| Instagram handle | @topdealzzdaily | @amazingdeals_17_in |
| Affiliate tag | amazingd0f292-20 | amazingdeaz17-21 |
| Scrape time | 9am UTC | 4:30am UTC (10am IST) |
| Instagram posting | ✅ Live | ❌ Not set up yet |
| Custom domain | topdealzdaily.com | ❌ None yet |

## Image Design Reference (copy from US site when setting up)
See topdealzdaily-website/scripts/create-deal-image.js for full design spec.
Key changes needed for India version:
- Replace `$` with `₹` everywhere prices appear
- Replace `@topdealzzdaily` with `@amazingdeals_17_in`
- Replace footer domain with India site URL
- Hashtags: #amazonindia #amazondealsindia #dailydeals #amazonfinds #dealoftheday #discounts #savingmoney #amazonin #dealfinder #indiandeals

## Color Palette (same as US site)
```js
BRAND_COLOR  = '#0e7490'  // teal
ACCENT_COLOR = '#dc2626'  // red — discount badge
AMBER        = '#f59e0b'  // amber — CTA button
EMERALD      = '#10b981'  // green — price
SLATE_BG1    = '#0f172a'  // dark navy
SLATE_BG2    = '#1e3a5f'  // deep blue
```

## GitHub Secrets (currently set)
- `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`
- `INSTAGRAM_ACCESS_TOKEN` — NOT YET SET (pending Business account setup)

## Known Gotchas (inherited from US site)
- Amazon image URLs: only `/images/I/` format works reliably — filter out `/images/P/`
- Imgur upload: `Authorization: Client-ID xxx` must go in HTTP **headers**, not request body
- Instagram Stories: must set `media_type: 'STORIES'` on container
- Canvas text: leave 60px+ gap between card bottom and first text line baseline to avoid overlap
- Instagram access token expires every 60 days — set a calendar reminder when token is issued
