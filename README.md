# STB Electrical Services Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/bf2c1989-c918-4575-8e25-156cdd9a4403/deploy-status)](https://app.netlify.com/projects/stbelectrical/deploys)

Professional website for STB Electrical Services, a licensed electrical contractor serving Wallan and Victoria, Australia.

**Live Site:** [https://stbelectrical.netlify.app](https://stbelectrical.netlify.app)

## About This Site

This is a modern, responsive website showcasing STB Electrical's services, gallery of completed work, and contact information. The site is designed to be fast, mobile-friendly, and optimized for search engines.

### Key Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Dynamic Content** - All content loaded from `data.json` for easy updates
- **Image Gallery** - Filterable gallery showcasing completed electrical work with lightbox viewer
- **Contact Form** - Integrated form with spam protection (honeypot + rate limiting)
- **SEO Optimized** - Meta tags, structured data (LocalBusiness schema), sitemap, and robots.txt
- **PWA Ready** - Includes web manifest and icons for mobile installation
- **Fast Loading** - Optimized CSS, deferred JavaScript, and preloaded resources

### Technology Stack

- Pure HTML5, CSS3, and vanilla JavaScript (no frameworks)
- Node.js/Express backend for contact form email handling
- Deployed and hosted on [Netlify](https://www.netlify.com)
- Continuous deployment from GitHub repository

## Deployment

The site is automatically deployed to Netlify whenever changes are pushed to the `main` branch. Netlify handles:
- Automatic HTTPS/SSL certificates
- Global CDN distribution
- Continuous deployment from Git
- Form handling and serverless functions

Any commit to this repository triggers a new build and deployment within 1-2 minutes.

## Site Structure

```
index.html              Main HTML page
assets/
  css/styles.css        Stylesheet
  js/script.js          JavaScript for dynamic content
  images/               Gallery images and icons
data.json               Content configuration (services, gallery, contact info)
server.js               Node.js backend for contact form
sitemap.xml             SEO sitemap for search engines
robots.txt              Search engine crawling instructions
site.webmanifest        PWA manifest
```

## Editing Content (`data.json`)
All content is managed through `data.json`. To update:
- `business` section – Business identity, contact details, address, and opening hours
- `about` section – Business description, key points, and license information
- `services[]` – List of services with titles and descriptions
- `gallery.items[]` – Gallery images with captions and categories
- `contact` section – Contact details and service areas

### Adding Images
Place image files (JPG/PNG/WebP) inside `assets/images/` and reference them in `data.json` like:
```json
{"src": "assets/images/new-switchboard.jpg", "caption": "New compliant switchboard", "category": "Switchboards"}
```
Use concise captions (max ~60 chars). Categories enable filter buttons.

### Recommended Image Sizes
- Standard gallery: 1200x900 or 800x600 (aspect 4:3) – keeps layout consistent.
- Optimize images (TinyPNG, Squoosh) before uploading for faster load.

## Running Locally
You can just open `index.html` in a browser. For some browsers, `fetch` of `data.json` via `file://` may be blocked. If content doesn't load, start a tiny local server:

### Option 1: VS Code Live Server Extension
1. Install "Live Server" extension.
2. Right‑click `index.html` -> "Open with Live Server".

### Option 2: Python Quick Server
```powershell
# From the project directory
python -m http.server 5500
# Then visit http://localhost:5500/
```

### Option 3: Node (if you have Node installed)
```powershell
npx serve .
```

## Updating Structured Data
The `<script type="application/ld+json">` block in `index.html` is auto‑updated at runtime from `business` fields in `data.json`. Ensure these fields stay accurate for SEO.

## Customisation
- Colors: adjust CSS variables at top of `styles.css`
- Hero text: change defaults in `index.html` or add to JSON & adapt script
- Add new sections: create markup in `index.html` and extend `script.js` logic

## Contact Form
The form now posts to a Node/Express backend endpoint `/api/quote` which sends an email via Nodemailer (SMTP).

### Configuring Email Sending
1. Copy `.env.example` to `.env`.
2. Fill in your SMTP provider details (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`). For many providers use port 587 with `SMTP_SECURE=false`.
3. Set `QUOTE_DEST` to the email address that should receive enquiries.
4. (Optional) Set `FROM_EMAIL` (e.g. `"STB Electrical <no-reply@yourdomain.com>"`).
5. Install dependencies and start the server.

### Running the Server
```powershell
npm install
npm start
# Server runs at http://localhost:3000
```
Then open `http://localhost:3000/` to use the site with the live form.

### Endpoint
`POST /api/quote`
JSON body:
```json
{
	"name": "John Smith",
	"email": "john@example.com",
	"phone": "+61 400 000 000",
	"message": "Need a switchboard upgrade",
	"honeypot": ""  
}
```
Returns `{ "ok": true }` on success or `{ "ok": false, "error": "..." }`.

### Anti-Spam Measures
- Rate limiting (default max 10 requests/minute per IP; tweak with `RATE_WINDOW_MS` & `RATE_MAX`).
- Honeypot hidden field (`honeypot`); bots filling it are silently ignored.
- Basic length trimming & newline stripping.

### Testing via curl
```powershell
curl -X POST http://localhost:3000/api/quote \ 
	-H "Content-Type: application/json" \ 
	-d '{"name":"Test","email":"test@example.com","message":"Hello"}'
```
Expect: `{ "ok": true }` (after SMTP configured).

If you see `Failed to send email.` check:
- SMTP credentials correct
- Less secure app access (if using a personal provider) / App password configured
- Port & secure flag match provider docs

### Deploying Backend
- Render / Railway / Fly.io / Heroku: push repo, set environment variables.
- If hosting statically elsewhere (e.g. Netlify), move only `server.js` + `package.json` to a small Node host or convert endpoint to a serverless function.

### Hardening Ideas (Future)
- Add CAPTCHA (hCaptcha or Cloudflare Turnstile) if spam increases.
- Log submissions to a database (SQLite / Postgres) for audit.
- Add HTML sanitization library if allowing rich text.

## Deployment Status

The site is live at **https://stbelectrical.netlify.app** and automatically deploys from this GitHub repository via Netlify's continuous deployment.

## SEO & Performance
- ✅ All business information, contact details, and licenses filled in
- ✅ Favicon & PWA icons (all sizes) installed
- ✅ Social sharing image (`og-image.jpg`) configured
- ✅ Structured data includes Facebook and Instagram profiles
- Consider WebP format for future gallery images for better compression
- Add alt text in `data.json` items using `alt` property for improved accessibility

Example:
```json
{"src": "assets/images/sample5.jpg", "caption": "Warehouse LED retrofit", "category": "Lighting", "alt": "Rows of new LED high bay lights in warehouse"}
```

## Gallery Item Format (Enhanced)
Each entry can use these properties:

```jsonc
{
	"src": "assets/images/your_image.jpg", // required
	"caption": "Short descriptive caption", // shown under image (lightbox label)
	"category": "Lighting",                // legacy single category (still supported)
	"categories": ["Lighting", "Commercial"], // preferred multi-category list
	"alt": "Accessible alt text for screen readers" // optional but recommended
}
```

If `categories` exists it is used for filter buttons; otherwise `category` is used. Add new categories freely—buttons are generated dynamically.

## Lightbox Usage & Accessibility
- Click any gallery image to open an enlarged view.
- Press ESC or click the overlay / close button (×) to exit.
- Keyboard focus is trapped inside the lightbox while open (Close button then image). Shift+Tab reverses.
- ARIA: Uses `role="dialog"` + `aria-modal="true"` with a dynamic `aria-label` based on each image caption.

## Favicon & PWA Icons
✅ **Complete** - All favicon and PWA icons are installed and configured:

Included files:
- `assets/images/favicon-16.png` - Browser tab icon (16x16)
- `assets/images/favicon-32.png` - Browser tab icon (32x32)
- `assets/images/favicon-192.png` - PWA home screen icon (192x192)
- `assets/images/favicon-512.png` - PWA splash screen icon (512x512)
- `assets/images/apple-touch-icon.png` - iOS home screen icon
- `assets/images/safari-pinned-tab.svg` - Safari pinned tab icon
- `site.webmanifest` - PWA configuration file

The site is fully configured as a Progressive Web App. Users can add it to their mobile home screen for quick access.


## Safety & Compliance Notes (Optional)
You may add a paragraph focused on Victorian regulations (e.g. AS/NZS 3000 standards, RCD requirements). This helps trust & SEO.

## Making Updates

To update the live site:

1. Edit `data.json` for content changes (services, gallery, contact info)
2. Add new images to `assets/images/` if needed
3. Commit and push changes to GitHub:
   ```powershell
   git add .
   git commit -m "Update content"
   git push
   ```
4. Netlify will automatically deploy within 1-2 minutes

## Search Engine Optimization

The site is registered with:
- ✅ Google Search Console - Sitemap submitted
- ✅ Bing Webmaster Tools - Sitemap submitted

Structured data includes LocalBusiness schema with:
- Business name and contact information
- GPS coordinates for Wallan, VIC
- Service area and opening hours
- Social media links

---

**STB Electrical Services** - Licensed electricians serving Victoria, Australia
