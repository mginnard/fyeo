# fyeo

Open-source, self-hosted feature flag and remote configuration platform for Next.js. Think of it as a lightweight alternative to LaunchDarkly that runs inside your app with SQLite — no external services.

**To add fyeo to an existing Next.js app**, follow the step-by-step Getting started section on the Overview page at `/overview` (after you’ve integrated the app: copy the fyeo folders, install deps, and wire the root layout).

## Quick start

1. **Install**
   ```bash
   npm install
   ```

2. **Configure**
   - Copy `.env.example` to `.env.local` (or set `FYEO_SECRET` and optionally `FYEO_ENV`).
   - The database is created at `.fyeo/flags.db` on first use.

3. **Run**
   ```bash
   npm run dev
   ```

4. **Dashboard**
   - Open [http://localhost:3000/flags](http://localhost:3000/flags) to manage flags.

## Usage

- **Server components / API**
  ```ts
  import { getFlag, getAllFlags } from "@/lib/fyeo";
  const on = getFlag<boolean>("new-checkout-flow");
  const flags = await getAllFlags({ id: user.id });
  ```

- **Client components**
  - Wrap your app (or layout) with `<FyeoProvider flags={flags}>` and pass `flags` from `getAllFlags()` in the root layout.
  - Then: `const on = useFlag("new-checkout-flow");`

- **Middleware (Edge)**
  ```ts
  import { getFlagInMiddleware } from "@/lib/fyeo";
  const enabled = await getFlagInMiddleware("my-flag", request);
  ```

## Environment variables

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `FYEO_SECRET`   | Secret for protecting admin API      |
| `FYEO_ENV`      | Current environment slug (default: `development`) |
| `FYEO_DB_PATH`  | DB path (default: `.fyeo/flags.db`) |

## Project layout

- `lib/fyeo/` — DB, evaluator, SDK, types
- `app/api/fyeo/[...path]/` — REST API
- `app/(dashboard)/` — Admin UI (Overview, Flags, Environments, Audit) at top-level routes
