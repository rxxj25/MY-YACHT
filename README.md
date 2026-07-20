# MY YACHT — AI Concierge

An immersive luxury private-yacht web app with a cinematic fleet experience, private enquiry flow, PostgreSQL-backed contact storage, and a production deployment on Vercel.

[Live Production Site](https://my-yacht-fawn.vercel.app)

## OpenAI Build Week

MY YACHT was created for the OpenAI Build Week Challenge as a luxury yacht discovery and AI concierge concept. The project uses Codex as the core development partner and GPT-5.6 for product strategy, copywriting, feature planning, and shaping the concierge experience.

The long-term product vision is an AI-powered private travel concierge: guests describe their destination, dates, group size, occasion, and travel style, then GPT-5.6 helps generate a tailored yacht itinerary, client brief, and concierge follow-up plan.

## What It Does

MY YACHT gives visitors a premium yacht-club experience:

- Cinematic homepage for private yacht discovery
- Fleet showcase for Aurelia, Solenne, and Mistral
- Membership, events, academy, and contact pages
- Private enquiry form for charter or membership interest
- Backend API for saving and submitting enquiries
- PostgreSQL persistence through Neon-compatible database hosting
- Vercel deployment for public judging and testing

## Screenshots

### Home

![MY YACHT home hero](public/screenshots/pic1.png)

### Fleet

![MY YACHT fleet showcase](public/screenshots/pic3.png)

### Private Enquiry

![MY YACHT private enquiry page](public/screenshots/pic5.png)

## Built With

- React
- TypeScript
- Vite
- CSS
- Express
- Node.js
- PostgreSQL
- Neon
- Vercel
- Codex
- GPT-5.6
- GoogleFlow
- NanoBanana

## How Codex and GPT-5.6 Were Used

Codex was used throughout the build as the main coding agent. It helped inspect the codebase, implement React UI changes, refine styling, add and improve the contact/enquiry page, remove an experimental scroll splash effect that did not fit the luxury tone, debug build issues, and review the deployed Vercel app.

GPT-5.6 helped with the product direction and submission narrative. It was used to position the project as an AI concierge rather than only a static yacht website, develop the hackathon story, prepare the demo script, refine project copy, and identify the next AI features to build.

GoogleFlow and NanoBanana are part of the creative media workflow for generating cinematic yacht visuals, destination moodboards, and video-style assets that support the luxury travel concept.

## Architecture

```text
React + Vite frontend
        |
        | /api/*
        v
Express serverless API on Vercel
        |
        v
Neon PostgreSQL database
```

The frontend is built with React and Vite. API routes are handled by Express and adapted for Vercel serverless deployment. Enquiry data is stored in PostgreSQL using the `pg` package.

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd build-a-complete-luxury-private-yacht
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create an environment file

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, you can use:

```powershell
Copy-Item .env.example .env
```

### 4. Configure the database

Set `DATABASE_URL` in `.env`.

For a local PostgreSQL database:

```text
DATABASE_URL=postgres://postgres:postgres@localhost:5432/my_yacht
API_PORT=5175
PGSSL=false
```

For Neon or another hosted PostgreSQL database, use the provider connection string. If SSL is required, set:

```text
PGSSL=true
```

The backend creates the `contact_enquiries` table automatically from `server/schema.sql`.

### 5. Start the API server

```bash
npm run dev:api
```

By default, the API runs on:

```text
http://127.0.0.1:5175
```

### 6. Start the frontend

In a second terminal:

```bash
npm run dev
```

Vite will start the local frontend. During development, `/api` requests are proxied to the local API server.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run dev:api
```

Starts the Express API server locally.

```bash
npm run build
```

Builds the TypeScript and Vite production app.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint.

## API Routes

```text
GET  /api/health
GET  /api/contact-enquiries/:id
PUT  /api/contact-enquiries/:id
POST /api/contact-enquiries/:id/submit
```

## Database Schema

The project stores private enquiry records in the `contact_enquiries` table.

Useful query:

```sql
SELECT id, full_name, email, telephone, interest, message, status, updated_at, submitted_at
FROM contact_enquiries
ORDER BY updated_at DESC;
```

## Deployment

The project is configured for Vercel:

- Vite builds the static frontend
- Express is exposed through the `api/` directory
- `vercel.json` routes frontend paths to `index.html`
- API routes connect to PostgreSQL through `DATABASE_URL`

Required production environment variable:

```text
DATABASE_URL
```

Optional production environment variable:

```text
PGSSL=true
```

## Future Improvements

- Add a GPT-5.6-powered itinerary generator
- Store generated itineraries and AI media in PostgreSQL
- Add an admin dashboard for concierge teams
- Add authentication for private staff access
- Connect GoogleFlow and NanoBanana media assets into the user journey
- Improve SEO metadata and social preview cards
- Add automated tests and production monitoring

## Project Standard

The goal of MY YACHT is to feel like a high-value luxury product: restrained, cinematic, responsive, and complete enough to be presented as a real client-facing private yacht platform.
