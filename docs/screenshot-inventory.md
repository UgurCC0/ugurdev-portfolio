# Screenshot inventory

All portfolio screenshots were captured from working sites with Playwright controlling installed Google Chrome 156.0.8078.48 on 28 October 2026. Fonts and decoded images were awaited, pages were scrolled to trigger vertical lazy loading, and full-page captures were checked visually.

## Required homepage captures

Each of the seven project folders contains:

- `desktop-home.png` — 1440×900 viewport
- `mobile-home.png` — 390×844 viewport
- `desktop-full.png` — 1440px wide, full page
- `mobile-full.png` — 390px wide, full page

| Project | Folder | Live capture result |
| --- | --- | --- |
| Industrial Electric | `assets/screenshots/industrial-electric/` | HTTP 200, 4/4 required captures |
| Automotive Gallery | `assets/screenshots/automotive-gallery/` | HTTP 200, 4/4 required captures |
| Clinic Website | `assets/screenshots/clinic-website/` | HTTP 200, 4/4 required captures |
| Appointment Website | `assets/screenshots/appointment-website/` | HTTP 200, 4/4 required captures |
| Barber Studio | `assets/screenshots/barber-studio/` | HTTP 200, 4/4 required captures |
| Hotel Booking | `assets/screenshots/hotel-booking/` | HTTP 200, 4/4 required captures |
| AULA Esports | `assets/screenshots/aula-esports/` | HTTP 200, 4/4 required captures |

## Additional AULA commerce captures

- `shop-desktop.png`
- `product-desktop.png`
- `product-mobile.png`
- `variable-product-desktop.png`
- `variable-product-mobile.png`
- `cart-desktop.png`
- `cart-mobile.png`
- `checkout-desktop.png`
- `checkout-mobile.png`

The Cart evidence records one real WooCommerce variation row, zero visible skeletons, and zero busy blocks. Checkout records a visible contact form, zero visible skeletons, and zero busy blocks. The browser cart was anonymous; checkout was not submitted.

## Totals

- 28 mandatory homepage screenshots
- 9 additional AULA commerce screenshots
- **37 authentic browser screenshots**

The README uses seven additional 1200×750 WebP derivatives under `assets/screenshots/readme/`. All 37 original PNG captures remain unchanged. The seven README files reduced their combined transfer size from 4,594,059 bytes to 440,292 bytes (90.4% smaller); details are recorded in [readme-image-optimization.json](readme-image-optimization.json).

Machine-readable details are in [screenshot-manifest.json](screenshot-manifest.json).

[Back to portfolio](../README.md)
