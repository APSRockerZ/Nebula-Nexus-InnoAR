# Nebula Nexus

An immersive, space-themed exploration game built with Next.js. Navigate a maze, solve questions, collect points, and race the clock.

<p align="center">
  <img src="public/aps-logo.png" alt="Nebula Nexus" width="150" />
</p>

## Features

- **Cosmic landing page** with animated space visuals and ambient audio.
- **Player registration** backed by PostgreSQL.
- **Maze exploration** with questions, progress tracking, and game-over flow.
- **Score tracking** with a leaderboard for other players.
- **Responsive interface** built with React, Tailwind CSS, and Three.js.

## Tech stack

| Area | Tools |
| --- | --- |
| Web app | Next.js 14, React 18 |
| Styling and motion | Tailwind CSS, Framer Motion |
| 3D visuals | Three.js, React Three Fiber, Drei |
| Authentication | Auth.js (NextAuth) |
| Database | PostgreSQL, Prisma |

## Run locally

### Requirements

- Node.js 18 or newer
- npm
- A PostgreSQL database

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_TRUST_HOST=true
```

Use the connection strings supplied by your PostgreSQL provider. Keep `.env.local` private and never commit real credentials. Generate an auth secret with:

```bash
openssl rand -base64 32
```

### 3. Set up the database

The repository contains a Prisma schema but no checked-in migrations. For a new development database, sync the schema and generate the client:

```bash
npx prisma db push
npx prisma generate
```

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run the Next.js ESLint checks |

## Main routes

| Route | Purpose |
| --- | --- |
| `/` | Nebula Nexus landing page |
| `/register` | Player registration |
| `/Onboarding` | Maze exploration game |
| `/Ondiving` | Alternate maze game route |

## Project structure

```text
app/          Next.js routes, layouts, API handlers, and styles
components/   Landing page, registration, and game interface components
Context/      Shared game state
data/         Database-backed user queries
lib/          Auth and Prisma client helpers
prisma/       PostgreSQL data model
public/       Images, audio, and video assets
schemas/      Input validation schemas
```

## Production build

```bash
npm run build
npm run start
```

Configure the same database and auth environment variables in your hosting provider before deploying. The app uses PostgreSQL for player accounts and game scores.

## Contributing

1. Create a branch for your change.
2. Make and verify the change locally.
3. Open a pull request with a clear summary.

---

Built for cosmic explorers. 🚀
