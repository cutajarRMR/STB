# STB Electrical Services Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/bf2c1989-c918-4575-8e25-156cdd9a4403/deploy-status)](https://app.netlify.com/projects/stbelectrical/deploys)

Professional website for STB Electrical Services serving Wallan and Victoria, Australia.

**Live Site:** [https://stbelectrical.netlify.app](https://stbelectrical.netlify.app)

## About This Site
This is a static website running for STB Electrical Services. 
- Deployed and hosted on [Netlify](https://www.netlify.com)
- Continuous deployment from GitHub repository



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

## Running Locally
You can just open `index.html` in a browser. For some browsers, `fetch` of `data.json` via `file://` may be blocked. If content doesn't load, start a tiny local server:

```powershell
# From the project directory
python -m http.server 5500
# Then visit http://localhost:5500/
```

**STB Electrical Services** - Licensed electricians serving Victoria, Australia
