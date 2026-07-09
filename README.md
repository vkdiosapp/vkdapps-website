# VKD Apps — Official Website

Production-ready static website for VKD Apps, a premium software development studio building Android, iOS, and web applications.

## Structure

```
/
├── index.html                    Homepage
├── services.html                 Services overview
├── products.html                 Products overview
├── pickspin.html                 Product page — PickSpin
├── brainboost.html               Product page — BrainBoost
├── rent-agreement-maker.html     Product page — Rent Agreement Maker
├── flowcare.html                 Product page — FlowCare (Coming Soon)
├── about.html                    Company story, mission, values
├── technology.html               Technology stack and engineering practices
├── contact.html                  Contact form and inquiry details
├── privacy-policy.html
├── terms-and-conditions.html
├── cookie-policy.html
├── disclaimer.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── manifest.json
└── assets/
    ├── css/       variables.css, base.css, components.css, animations.css
    ├── js/        main.js (nav, reveals, accordion, counters, cursor), contact.js (form handling)
    ├── images/    screenshots and marketing imagery (add as available)
    ├── icons/     favicon.svg, apple-touch-icon.png
    └── fonts/     (Google Fonts are loaded via CDN; folder reserved for self-hosted fallback)
```

## Tech Stack

- HTML5 semantic markup
- CSS3 with custom properties (no framework, no Tailwind/Bootstrap CDN)
- Vanilla JavaScript (ES6+), no jQuery
- GSAP + ScrollTrigger (CDN) for enhanced scroll reveals, with a vanilla IntersectionObserver fallback
- Lenis (CDN) for smooth scrolling, respecting `prefers-reduced-motion`

## Local Preview

Any static file server works. Example using `serve`:

```
npx serve .
```

Then open the printed local URL in your browser.

## Deployment

This site is fully static and can be uploaded directly to any web server, CDN, or static hosting provider (Netlify, Vercel, GitHub Pages, S3 + CloudFront, etc.). No build step is required.

Before going live:

1. Replace screenshot placeholders in each product page with real app screenshots.
2. Replace `assets/images/og-cover.jpg` with a real Open Graph preview image (1200×630).
3. Update `sitemap.xml` and canonical URLs if the domain changes.
4. Wire the contact form (`contact.html` + `assets/js/contact.js`) to a real backend or form service — it currently validates and shows a success state client-side only.
