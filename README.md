# Gatehouse

Open-source, self-hosted feature flag and remote configuration platform for Next.js. Think of it as a lightweight alternative to LaunchDarkly that runs inside your app with SQLite — no external services.

**To add Gatehouse to an existing Next.js app**, follow the step-by-step Getting started section on the Overview page at `/gatehouse/overview` (after you’ve integrated the app: copy the Gatehouse folders, install deps, and wire the root layout).

## Quick start

1. **Install**
   ```bash
   npm install
   ```

2. **Configure**
   - Copy `.env.example` to `.env.local` (or set `GATEHOUSE_SECRET` and optionally `GATEHOUSE_ENV`).
   - The database is created at `.gatehouse/flags.db` on first use.

3. **Run**
   ```bash
   npm run dev
   ```

4. **Dashboard**
   - Open [http://localhost:3000/gatehouse](http://localhost:3000/gatehouse) to manage flags.

## Usage

- **Server components / API**
  ```ts
  import { getFlag, getAllFlags } from "@/lib/gatehouse";
  const on = getFlag<boolean>("new-checkout-flow");
  const flags = await getAllFlags({ id: user.id });
  ```

- **Client components**
  - Wrap your app (or layout) with `<GatehouseProvider flags={flags}>` and pass `flags` from `getAllFlags()` in the root layout.
  - Then: `const on = useFlag("new-checkout-flow");`

- **Middleware (Edge)**
  ```ts
  import { getFlagInMiddleware } from "@/lib/gatehouse";
  const enabled = await getFlagInMiddleware("my-flag", request);
  ```

## Environment variables

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `GATEHOUSE_SECRET`   | Secret for protecting admin API      |
| `GATEHOUSE_ENV`      | Current environment slug (default: `development`) |
| `GATEHOUSE_DB_PATH`  | DB path (default: `.gatehouse/flags.db`) |

## Project layout

- `lib/gatehouse/` — DB, evaluator, SDK, types
- `app/api/gatehouse/[...path]/` — REST API
- `app/(gatehouse)/gatehouse/` — Admin UI (Flags, Environments, Audit)
