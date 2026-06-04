# RiseOS AI

RiseOS AI is a full-stack personal operating system with a Vite React client, Express API, MongoDB persistence, Socket.IO realtime updates, and AI/news integrations.

## Local Development

Requirements:

- Node.js `>=20.19.0`
- npm
- MongoDB connection string for full persistence

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`, then run the API and client in separate terminals:

```bash
npm run server
npm run dev
```

Local defaults:

- Client: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:5000/api`
- Health: `http://127.0.0.1:5000/api/health`

## Environment

Required for production:

- `NODE_ENV=production`
- `PORT`
- `CLIENT_URL`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

Optional integrations:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `NEWS_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`

Use 32+ character random values for both JWT secrets. `CLIENT_URL` should be the public frontend origin, comma-separated if you serve multiple origins.

For a single same-origin deployment, leave `VITE_API_URL` unset or set it to `/api` before `npm run build`. For split frontend/API hosting, set `VITE_API_URL` to the public API URL ending in `/api`.

## Production Build

Run the full verification gate:

```bash
npm run check
```

Build and start the combined production app:

```bash
npm run build
npm start
```

In production, the Express server serves the built `dist` client and all API routes from the same process.

## Docker

Build:

```bash
docker build -t riseos-ai .
```

Run:

```bash
docker run --env-file .env -p 5000:5000 riseos-ai
```

If the frontend and backend are hosted separately, bake the API URL into the client build:

```bash
docker build --build-arg VITE_API_URL=https://api.example.com/api -t riseos-ai .
```

## Render

`render.yaml` defines a single web service:

- Build: `npm ci --include=dev && npm run build && npm prune --omit=dev`
- Start: `npm start`
- Health check: `/api/health`

Set the secret environment variables in Render before deploying. Do not commit real `.env` values.

## Vercel

`vercel.json` routes `/api/*` to the Express serverless entry at `api/index.js` and routes all other paths to the Vite SPA. Set these Vercel environment variables before deploying:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL` if you want to allow a custom domain in addition to the automatic Vercel URL
- Optional integration keys listed above

Leave `VITE_API_URL` unset for the same-origin Vercel deployment. The client will call `/api`. Do not set Vercel's `VITE_API_URL` to `localhost` or `127.0.0.1`; those addresses point to the visitor's machine, not the deployed API.
