# Evidence matrix

This matrix documents what supports each public claim and prevents a static demo from being mistaken for a live dynamic backend.

| Project | Public visual evidence | Dynamic capability evidence inspected | Important boundary |
| --- | --- | --- | --- |
| Industrial Electric | Live Cloudflare static demo and fresh Chrome captures | Theme manifest/README, Site Core architecture, Admin/SEO documentation, product feature record | Static demo has no Client Admin or PHP/MySQL processing |
| Automotive Gallery | Live Cloudflare static demo and fresh Chrome captures | Theme manifest/README, Vehicle Inventory architecture, product feature record | Exported demo inventory is representative; real records live in the private module/database |
| Clinic Website | Live Cloudflare static demo and fresh Chrome captures | Theme manifest/README, Site Core Admin/SEO/security architecture, product feature record | No booking, patient record, payment, or telehealth claim |
| Appointment Website | Live Cloudflare static demo and fresh Chrome captures | Theme manifest/README, Appointments architecture, product feature record | Public form is disabled and collects no personal data |
| Barber Studio | Live Cloudflare static demo and fresh Chrome captures | Theme manifest/README, Appointments and operations documentation, product feature record | Public form is disabled; optional push requires separate production prerequisites |
| Hotel Booking | Live Cloudflare static demo and fresh Chrome captures | Theme manifest/README, Hotel Booking architecture, product feature record | Public reservation form is disabled; no online payment or OTA claim |
| AULA Esports | Loopback WordPress site and fresh homepage/Shop/product/Cart/Checkout Chrome captures | Current source-project redesign report, case study, test evidence, WooCommerce runtime | Fictional local portfolio project; no public deployment, real payment, delivery, client, or official-brand claim |

## Source boundaries

The private `site-core` and `atesogluelektrik-website` repositories were inspected read-only and remain private. Their source files, commercial packages, databases, configuration, runtime storage, and customer material are not part of this portfolio.

The AULA WordPress installation also remains private and local. Only screenshots and evidence-backed descriptions are included.

[Back to portfolio](../README.md)
