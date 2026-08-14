# Local Moto — PRD

## Original Problem Statement
"build me a web page called local moto where its a web page for a small company that repairs motorcycles"

User choices: showcase + working contact form + service booking request form; services = repairs, maintenance, tyres, MOT/inspection, custom work; vibe = dark garage/workshop + vintage retro. Real business details to be supplied later (placeholders in use).

Follow-up requests (2026-08-13): gallery with deep shadows and mechanical details; main headings fade in / track out on scroll.

Scope change (2026-08-13): owner removed Custom Builds & Restoration as an offered service — removed from services grid, marquee, booking form (incl. custom-quote panel), hero copy and testimonial; gallery re-themed from "custom work" to general workshop/repair frames. Backend still accepts optional budget_range/project_vision (harmless legacy fields, unused by UI).

## Architecture
- Frontend: React (CRA/craco), Tailwind, framer-motion (scroll reveals, kinetic hero, scroll-linked heading tracking), lenis (momentum scroll), react-fast-marquee (editorial ribbon), sonner toasts.
- Backend: FastAPI, MongoDB (motor), `/api` prefix. Endpoints: `GET /api/` health, `POST/GET /api/bookings`, `POST/GET /api/enquiries`.
- Design system: Bebas Neue display, Cormorant Garamond editorial italic, Manrope body, IBM Plex Mono labels; bg #0A0A0A, cards #121212, rust accent #D35400; noise overlay, 1px industrial borders, spotlight gallery frames.

## User Personas
- Local rider needing repair/service/MOT — wants fast trust and an easy booking path.
- Custom build dreamer — wants proof of craft (gallery, manifesto) and a clear quote path.
- Shop owner — wants enquiries and booking requests captured reliably.

## Core Requirements (static)
1. Award-worthy dark industrial single-page site. 2. Kinetic hero with masked line reveal + parallax. 3. Editorial marquee. 4. Numbered services (01–05). 5. Manifesto chapters. 6. Custom-work gallery with deep shadows. 7. Booking form with custom-quote path (budget + vision). 8. Contact enquiry form. 9. Placeholder contact details, swappable.

## Implemented
- 2026-08-13: Full site (hero, marquee, services, manifesto, gallery, testimonials, contact/booking, footer); backend bookings + enquiries stored in MongoDB; scroll-linked tracked headings; custom-quote panel with budget chips + project vision; verified end-to-end (curl + browser form submission with toasts).

## Backlog
- P0: Replace placeholder address/phone/hours/email with real business details (user to supply).
- P1: Email notification to owner on new booking/enquiry (Resend managed integration).
- P1: Simple admin view to read bookings/enquiries (or auto-forward).
- P2: Real customer testimonials + real build photos; Google Maps embed; SEO meta/OG images; Instagram feed.
