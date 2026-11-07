# Ramesh Choudhary – official website

A static, single-page storytelling site. It needs no build step.

## Deploy on Vercel
- **Drag and drop:** vercel.com → Add New → Project → upload this folder. Leave Framework Preset as "Other".
- **CLI:** `npx vercel --prod` from this folder.
- **GitHub:** push this folder to a repo and import it in Vercel.

## Before going live
1. If you use a custom domain, find-and-replace `https://ramesh-choudhary.vercel.app` with the new domain in `index.html`, `robots.txt` and `sitemap.xml`.
2. Add a real headshot and point the JSON-LD `image` at it.
3. `.vercelignore` keeps the notes and `og.html` off the live site.

## Files
- `index.html`: content, SEO meta tags, and schema.org JSON-LD (ProfilePage + Person + Organization)
- `styles.css`, `script.js`: design and animations (no libraries; respects reduced-motion)
- `og-image.png`: the 1200×630 social sharing image (source: `og.html`)
- `robots.txt`, `sitemap.xml`, `vercel.json`, `favicon.svg`
