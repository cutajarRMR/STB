# STB Electrical Services Website

A simple, static, easily editable website for STB Electrical Services (Victoria, Australia). Content is driven by a single JSON file so you can update business details without touching HTML.

## Structure
```
index.html              Main page
assets/css/styles.css   Styles
assets/js/script.js     Logic to load JSON & populate sections
assets/images/          Put your image files here
data.json               Editable content file
```

## Editing Content (`data.json`)
Open `data.json` and change placeholder values:
- `business.name`, `telephone`, `url` – Public business identity
- `business.address` – Street/locality/postal code for schema & display
- `business.geo` – Lat/lng (optional) for Google/SEO rich results
- `business.openingHours` – Adjust days/hours or add weekend/emergency
- `about.paragraphs` – Free‑form description paragraphs
- `about.points` – Bullet list for quick selling points
- `about.licenses` – License numbers, accreditations, insurance notes
- `services[]` – Each service has `title` + optional `description`
- `gallery.items[]` – Update `src` (relative path), `caption`, `category`
- `contact.phone`, `email`, `address.full`, `emergencyHours`, `serviceAreas[]`

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

## Deployment Suggestions
- GitHub Pages (copy repo, push, configure) – fast & free
- Netlify / Vercel – drag & drop folder or connect repo
- Traditional hosting (upload contents via FTP)

## SEO & Performance Tips
- Fill real telephone, address, license numbers
- Favicon & PWA icons already included (see section below) – replace with branded versions for best results
- Provide an `og-image.jpg` (1200x630) for social sharing
- Compress images & consider WebP for gallery
- Add alt text in `data.json` items using `alt` property if needed

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
The `<head>` includes a full multi-platform favicon setup:

Included files:
- `assets/images/favicon-16.png`
- `assets/images/favicon-32.png`
- `assets/images/apple-touch-icon.png`
- `assets/images/safari-pinned-tab.svg`
- `site.webmanifest` (declares 192px & 512px icons for installs – add the PNGs referenced inside to complete)

To replace with your own logo versions:
1. Generate square PNGs (transparent where possible): 16x16, 32x32, 192x192, 512x512.
2. Overwrite existing files (add `favicon-192.png` & `favicon-512.png` under `assets/images/`).
3. Replace the Apple touch icon (at least 180x180; current file will scale).
4. Provide a monochrome SVG for Safari pinned tabs (single solid color) – Safari applies mask color defined in the HTML.
5. Hard refresh browser (Ctrl+Shift+R) or clear cache.

Manifest snippet (already present):
```json
{
	"name": "STB Electrical Services",
	"short_name": "STB Electrical",
	"start_url": "/index.html",
	"display": "standalone",
	"background_color": "#111111",
	"theme_color": "#111111",
	"icons": [
		{ "src": "assets/images/favicon-192.png", "sizes": "192x192", "type": "image/png" },
		{ "src": "assets/images/favicon-512.png", "sizes": "512x512", "type": "image/png" }
	]
}
```

You can change `theme_color` to match a brand background (also reflect it in `<meta name="theme-color">`).


## Safety & Compliance Notes (Optional)
You may add a paragraph focused on Victorian regulations (e.g. AS/NZS 3000 standards, RCD requirements). This helps trust & SEO.

## Version Control
If using Git, commit changes after editing `data.json` or adding images:
```powershell
git add data.json assets/images/*
git commit -m "Update content"
```

## Support
If you need to add features (testimonials, FAQ, quote form), just ask!

---
Made for STB Electrical Services.
