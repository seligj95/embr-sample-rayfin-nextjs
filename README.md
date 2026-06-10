# Embr × Rayfin — Next.js sample

A [Next.js](https://nextjs.org/) (App Router) app hosted on **Embr**, backed by a
**Fabric-managed [Rayfin](https://github.com/microsoft/rayfin)** backend
(Microsoft's Backend-as-a-Service). It's a shared "notes board": sign in with
Microsoft Fabric, post a note, and the data is stored — and governed — in
Microsoft Fabric via Rayfin's Data API.

- **Rayfin** provides the backend: data model, database, and Data API on Fabric.
- **Embr** hosts the app: `git push` → build → run on Azure, with a Node server
  runtime, SSR, routing, and a health-checked deployment.

## Architecture

```
Browser ──(interactive Fabric sign-in)──► Rayfin Auth (Fabric)
   │
   │  RayfinClient (browser SDK, holds the session)
   ▼
Rayfin Data API (GraphQL) ──► data stored & governed in Microsoft Fabric

Next.js server on Embr: serves the SSR shell, routing, and /api/health
```

The page shell is server-rendered on Embr's Node runtime; the interactive auth
and data access run client-side through the Rayfin browser SDK. **This split is
deliberate — see "Why client-side data?" below.**

## Project layout

```
app/
  layout.tsx            # root layout
  page.tsx              # server component shell (SSR on Embr)
  api/health/route.ts   # Embr health-check endpoint
components/
  NotesApp.tsx          # client component: Fabric sign-in + notes CRUD
lib/
  rayfinBrowser.ts      # browser RayfinClient + Fabric auth options
rayfin/
  rayfin.yml            # Rayfin backend config (auth + data, mssql)
  data/Note.ts          # the Note entity (@authenticated)
  data/schema.ts        # schema export
embr.yaml               # Embr deploy config (nodejs, port 3000, health check)
```

## Run it yourself

### Prerequisites
- Node.js 20+
- A Microsoft Fabric workspace on a **Fabric capacity** (FT1/FTL64 trial or
  paid). A Power BI **Premium-Per-User (PPU)** capacity will **not** work.
- The Rayfin CLI (`npx @microsoft/rayfin-cli`) and an Embr-authenticated CLI.

### 1. Provision the Rayfin backend on Fabric
```bash
npx @microsoft/rayfin-cli up --workspace-id <your-fabric-workspace-id>
```
This creates the Rayfin AppBackend, applies the data model, and prints the
**API URL** and **publishable key**. It also writes `.env.local` (via
`rayfin env --framework nextjs`) for local development.

### 2. Run locally
```bash
npm install
npm run dev
# open http://localhost:3000, click "Sign in with Fabric", post a note
```

### 3. Deploy to Embr
Push this folder to a GitHub repo, then create an Embr project/environment from
it. Set the Rayfin connection as Embr variables (they are client-visible
`NEXT_PUBLIC_*` values — the publishable key is public by design):

```bash
embr variables set -p <projectId> -e <envId> \
  NEXT_PUBLIC_RAYFIN_API_URL="<api-url>" \
  NEXT_PUBLIC_RAYFIN_PUBLISHABLE_KEY="<pk-...>" \
  NEXT_PUBLIC_FABRIC_WORKSPACE_ID="<workspace-guid>" \
  NEXT_PUBLIC_FABRIC_ITEM_ID="<appbackend-guid>" \
  NEXT_PUBLIC_FABRIC_PORTAL_URL="https://app.fabric.microsoft.com"
```

Then add your deployed Embr app URL to `allowedRedirectUris` in
`rayfin/rayfin.yml` and re-run `rayfin up` so Fabric sign-in can redirect back.

## Why client-side data? (important findings)

While building this sample we validated the Fabric-managed Rayfin model
empirically. The constraints below shaped the design:

1. **Data access requires an interactive-user token.** Calling the Rayfin Data
   API (`/graphql`) with only the publishable key returns
   `401 "Authentication token is required"`. There is **no anonymous and no
   service-principal / app-only** data path on Fabric-managed Rayfin today.
2. **The session is opaque.** After Fabric sign-in, the browser `RayfinClient`
   holds an `OpaqueSession`; the access token is **not exposed** to app code, so
   forwarding it to a server-side BFF is not a first-class pattern.
3. Therefore the supported shape is **client-side data access**: the browser
   client performs interactive Fabric sign-in and talks to the Data API directly.
4. **Fabric-managed Rayfin is `mssql`-only** (PostgreSQL is rejected at deploy),
   and the **Auth service must be enabled** even when you only need data.
5. **Capacity matters.** Provisioning failed with `429 capacity exceeded` on a
   busy FT1 trial capacity; a dedicated workspace on a less-loaded Fabric
   capacity succeeded.

### What this means for "Embr vs. Rayfin hosting"
Because data access is client-side, this app is effectively a SPA-with-Fabric-auth
that Rayfin's own static hosting could also serve. Embr still adds the Node
server runtime (SSR shell, custom server routes like `/api/health`, full app
lifecycle), but a server-side BFF calling Rayfin is **not** currently possible.
The strongest Embr/Rayfin story today is a non-Rayfin or server-runtime app that
*also* needs governed Fabric data — once Rayfin offers app-only/server data
access, a true BFF integration becomes possible.

## Verified vs. needs-a-human
- ✅ Builds (`npm run build`), runs, `/api/health` returns 200, SSR shell renders.
- ✅ Backend is real: the Data API rejects unauthenticated calls (401), proving
  the wiring and the auth model.
- 👤 The interactive **Fabric sign-in + data round-trip** requires a human to
  complete the browser consent flow; it is not automated here.
