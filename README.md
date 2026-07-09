# MY YACHT

An immersive luxury private-yacht web experience with a full-stack enquiry system, cinematic fleet presentation, and production deployment on Vercel.

[Live Production Site](https://my-yacht-fawn.vercel.app)

## Screenshots

### Home

![MY YACHT home hero](public/screenshots/pic1.png)

### Fleet

![MY YACHT fleet showcase](public/screenshots/pic3.png)

### Private Enquiry

![MY YACHT private enquiry page](public/screenshots/pic5.png)

## Overview

MY YACHT is designed as a premium digital showroom for private yacht discovery. The interface combines editorial typography, motion-rich media, curated fleet storytelling, and a discreet concierge enquiry flow built for high-intent clients.

This is not a static landing page. It is a complete React, Express, and PostgreSQL project deployed to production with hosted API routes and persistent enquiry storage.

## Highlights

- Cinematic yacht-first visual direction with custom media assets
- Distinct fleet, membership, academy, events, and contact experiences
- Premium private enquiry form with draft saving and submitted status handling
- PostgreSQL-backed contact enquiry persistence
- Express API adapted for Vercel serverless deployment
- Responsive navigation with polished mobile menu interaction
- Production deployment on Vercel with Neon-hosted database connectivity

## Live Stack

- Frontend: React 19, TypeScript, Vite
- Motion: GSAP, Motion
- Styling: CSS with custom responsive layout system
- Backend: Express 5
- Database: PostgreSQL via `pg`
- Hosting: Vercel
- Database Hosting: Neon

## Production URL

```text
https://my-yacht-fawn.vercel.app
```

## Local Development

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set `DATABASE_URL` in `.env`, then run the API:

```bash
npm run dev:api
```

Run the website:

```bash
npm run dev
```

During development, Vite proxies `/api` requests to `http://127.0.0.1:5175`.

## Database

The backend creates the `contact_enquiries` table automatically from `server/schema.sql`.

Useful query:

```sql
SELECT id, full_name, email, telephone, interest, message, status, updated_at, submitted_at
FROM contact_enquiries
ORDER BY updated_at DESC;
```

## API Routes

```text
GET  /api/health
GET  /api/contact-enquiries/:id
PUT  /api/contact-enquiries/:id
POST /api/contact-enquiries/:id/submit
```

## Build

```bash
npm run build
```

## Deployment

The project is configured for Vercel:

- Static frontend is built by Vite
- Express is exported for serverless API handling
- `vercel.json` routes frontend paths to `index.html`
- API endpoints are exposed through the `api/` directory

Required production environment variable:

```text
DATABASE_URL
```

## Project Standard

The goal of this project is to feel like a high-value luxury product: restrained, cinematic, responsive, and complete enough to be presented as a real client-facing private yacht platform.
