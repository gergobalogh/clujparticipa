# Deployment Plan

## Architecture

```
Internet
  │
  ├── Vercel (Next.js app)          — free tier, auto-deploys from GitHub
  │     │
  │     └── DATABASE_URL ──────────────────────┐
  │                                             │
  └── VPS: cluj.gbfcj.my                       │
        ├── pgbouncer :6543 (public) ◄──────────┘
        │     └── session pooling, TLS
        └── postgres :5432 (internal only)
```

**Test environment** (current): full stack on the VPS via docker-compose at `cluj.gbfcj.my:3030`  
**Production target**: app on Vercel, database stays on VPS

---

## VPS: Database Layer (docker-compose)

Three services defined in `docker-compose.yml`:

| Service | Image | Port | Purpose |
|---|---|---|---|
| `postgres` | postgres:16 | internal only | database |
| `pgbouncer` | edoburu/pgbouncer:latest | `0.0.0.0:6543` | connection pool + TLS |
| `app` | local build | `0.0.0.0:3030` | test environment only |

### First-time setup on the VPS

```bash
# 1. Generate TLS certs for pgbouncer (once — 10-year expiry)
./scripts/gen-pgbouncer-certs.sh

# 2. Set a strong DB password in .env
echo 'DB_PASSWORD=<strong-random-password>' >> .env

# 3. Start database services
docker compose up -d postgres pgbouncer

# 4. Run migrations
npx prisma migrate deploy

# 5. Seed demo data (optional)
npx prisma db seed

# 6. Start the test app (optional)
docker compose up -d app
```

### Updating the database

```bash
# After adding a new Prisma migration:
npx prisma migrate deploy

# Rebuild the test app after code changes:
docker compose up -d --build app
```

---

## Vercel: App Deployment

### One-time setup

1. Push the repo to GitHub
2. Import the repo in Vercel (Framework: Next.js, root directory: `.`)
3. Set these environment variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://clujparticipa:<DB_PASSWORD>@<VPS_IP>:6543/clujparticipa?sslmode=require&uselibpqcompat=true&connection_limit=1` |
| `ADMIN_SECRET` | strong random secret (`openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | `https://<your-vercel-domain>` |
| `AUTH_SECRET` | strong random secret (`openssl rand -hex 32`) |
| `AUTH_URL` | `https://<your-vercel-domain>` |
| `AUTH_TRUST_HOST` | `true` |
| `GOOGLE_ID` | from Google Cloud Console |
| `GOOGLE_SECRET` | from Google Cloud Console |
| `FACEBOOK_ID` | from Meta Developer Portal |
| `FACEBOOK_SECRET` | from Meta Developer Portal |
| `CLOUDFLARE_ACCOUNT_ID` | from Cloudflare dashboard |
| `CLOUDFLARE_IMAGES_API_TOKEN` | Cloudflare Images: Edit permission |
| `RESEND_API_KEY` | from Resend dashboard |
| `RESEND_FROM_EMAIL` | `noreply@clujparticipa.ro` |

4. Deploy — Vercel builds and deploys automatically.

### Deploying updates

Push to `main` → Vercel auto-deploys. No manual step needed.

If the push includes a new Prisma migration, **run it on the VPS before or immediately after merging**:

```bash
npx prisma migrate deploy
```

---

## Connection String Notes

`uselibpqcompat=true` — tells the Node.js `pg` library to treat `sslmode=require` as "encrypt, don't verify cert", which is the correct behavior for a self-signed certificate. Without it, `pg` treats `require` as `verify-full` and rejects the self-signed cert.

`connection_limit=1` — each Vercel serverless function instance holds at most 1 connection from pgbouncer's pool. pgbouncer's `DEFAULT_POOL_SIZE=10` allows up to 10 concurrent function instances.

---

## Firewall Checklist

Port `6543` is open to the internet so Vercel can reach pgbouncer. Keep postgres (`5432`) and all other internal ports closed externally.

```bash
ufw allow 6543    # pgbouncer
ufw allow 22      # SSH
ufw allow 80      # nginx / Let's Encrypt
ufw allow 443     # nginx HTTPS
ufw enable
```

---

## Ongoing Operations

| Task | Command |
|---|---|
| View logs | `docker compose logs -f pgbouncer` |
| Run a migration | `npx prisma migrate deploy` (from `/home/www/clujparticipa`) |
| Reseed demo data | `npx prisma db seed` |
| Renew TLS certs | `./scripts/gen-pgbouncer-certs.sh && docker compose restart pgbouncer` |
| Full restart | `docker compose restart` |
| Wipe and reseed | `docker compose down && docker volume rm clujparticipa_clujparticipa-pgdata && docker compose up -d postgres pgbouncer && npx prisma migrate deploy && npx prisma db seed` |
