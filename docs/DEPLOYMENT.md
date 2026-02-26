# Deployment Guide - AIDEAS

**Version:** 2.0
**Last Updated:** February 2026

---

## Architecture Overview

AIDEAS uses a separated deployment model:

| Component | Technology | Hosting | Domain |
|-----------|------------|---------|--------|
| Landing | Static HTML/CSS/JS | Vercel | aideas.com |
| Frontend | Next.js 14 | Vercel | app.aideas.com |
| Backend | FastAPI | Railway | api.aideas.com |
| Database | PostgreSQL | Supabase | - |

---

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Configure:
   - **Name:** `aideas-production`
   - **Database Password:** Generate strong password
   - **Region:** Choose closest to users (e.g., `us-east-1`)
4. Wait for project to be ready (~2 minutes)

### Get Credentials

Go to **Settings > API** and copy:

| Setting | Environment Variable |
|---------|---------------------|
| Project URL | `SUPABASE_URL` |
| anon public key | `SUPABASE_ANON_KEY` |
| service_role key | `SUPABASE_SERVICE_KEY` |

### Apply Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or manually via SQL Editor in Supabase Dashboard.

---

## 2. Landing Deployment (Vercel)

### Option A: Vercel CLI

```bash
cd landing

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Option B: GitHub Integration

1. Push `landing/` to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure:
   - **Root Directory:** `landing`
   - **Framework Preset:** Other
   - **Build Command:** `npm run build` (if using SASS)
   - **Output Directory:** `.` (root)
5. Deploy

### Custom Domain

1. In Vercel dashboard, go to project settings
2. Add domain: `aideas.com`
3. Configure DNS at your registrar:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

---

## 3. Frontend Deployment (Vercel)

### Environment Variables

In Vercel dashboard, add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=https://api.aideas.com
```

### Deploy

```bash
cd web

# Install dependencies
npm install

# Deploy
vercel

# For production
vercel --prod
```

### Custom Domain

Add domain: `app.aideas.com`

```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

---

## 4. Backend Deployment (Railway)

### Create Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Configure:
   - **Root Directory:** `api`
   - **Start Command:** `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables

Add in Railway dashboard:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# AI (optional)
OPENAI_API_KEY=sk-...

# App
ENVIRONMENT=production
ALLOWED_ORIGINS=https://app.aideas.com,https://aideas.com
```

### Railway Configuration

Create `api/railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn src.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Custom Domain

1. In Railway dashboard, go to Settings > Domains
2. Add custom domain: `api.aideas.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: api
   Value: your-app.up.railway.app
   ```

### Add Redis (Optional)

For background jobs:

1. In Railway project, click "New"
2. Select "Database" > "Redis"
3. Copy `REDIS_URL` to environment variables

---

## 5. DNS Configuration (Cloudflare)

### Add Domain

1. Add `aideas.com` to Cloudflare
2. Update nameservers at your registrar

### DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | @ | cname.vercel-dns.com | DNS only |
| CNAME | app | cname.vercel-dns.com | DNS only |
| CNAME | api | your-app.up.railway.app | DNS only |
| CNAME | www | aideas.com | Yes |

**Note:** For Vercel, use "DNS only" (grey cloud). For Railway, you may use proxied (orange cloud) for DDoS protection.

### SSL Configuration

- **SSL/TLS Mode:** Full (strict)
- **Always Use HTTPS:** On
- **Automatic HTTPS Rewrites:** On

---

## 6. CI/CD Pipelines

### Landing (.github/workflows/deploy-landing.yml)

```yaml
name: Deploy Landing

on:
  push:
    branches: [main]
    paths:
      - 'landing/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build
        working-directory: ./landing
        run: |
          npm install
          npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_LANDING }}
          working-directory: ./landing
          vercel-args: '--prod'
```

### Frontend (.github/workflows/deploy-web.yml)

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'web/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build
        working-directory: ./web
        run: |
          npm install
          npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_WEB }}
          working-directory: ./web
          vercel-args: '--prod'
```

### Backend (.github/workflows/deploy-api.yml)

```yaml
name: Deploy API

on:
  push:
    branches: [main]
    paths:
      - 'api/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        working-directory: ./api
        run: |
          pip install -r requirements/dev.txt

      - name: Run tests
        working-directory: ./api
        run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Railway
        uses: berviantoleo/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: api
```

---

## 7. Database Migrations

### Create Migration

```bash
# Create new migration file
touch supabase/migrations/002_add_feature.sql
```

### Apply Migration

```bash
# Via CLI
supabase db push

# Or via Dashboard
# Go to SQL Editor > paste migration > Run
```

### Best Practices

- Always use `IF NOT EXISTS` / `IF EXISTS`
- Test migrations on staging first
- Keep migrations small and focused
- Never delete columns without deprecation period

---

## 8. Monitoring

### Error Tracking (Sentry)

1. Create project at [sentry.io](https://sentry.io)
2. Get DSN for each app
3. Add to environment variables:
   - Frontend: `NEXT_PUBLIC_SENTRY_DSN`
   - Backend: `SENTRY_DSN`

### Uptime Monitoring

Use [Better Uptime](https://betteruptime.com) or [UptimeRobot](https://uptimerobot.com):

| Endpoint | Check Interval |
|----------|----------------|
| https://aideas.com | 5 min |
| https://app.aideas.com | 1 min |
| https://api.aideas.com/health | 1 min |

### Logs

- **Landing:** Vercel Dashboard > Deployments > Logs
- **Frontend:** Vercel Dashboard > Deployments > Logs
- **Backend:** Railway Dashboard > Deployments > Logs
- **Database:** Supabase Dashboard > Logs

---

## 9. Security Checklist

### Before Go-Live

- [ ] All environment variables set in production
- [ ] Strong, unique `SECRET_KEY` for backend
- [ ] 2FA enabled on Supabase dashboard
- [ ] 2FA enabled on Railway dashboard
- [ ] 2FA enabled on Vercel dashboard
- [ ] RLS policies applied to all tables
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on API
- [ ] Cloudflare WAF rules configured

### Environment Variables

- [ ] Never commit `.env` files
- [ ] Use platform secrets management
- [ ] Rotate keys periodically
- [ ] Different keys per environment

---

## 10. Rollback Procedures

### Vercel Rollback

1. Go to project dashboard
2. Click "Deployments"
3. Find previous deployment
4. Click "..." > "Promote to Production"

### Railway Rollback

1. Go to project dashboard
2. Click "Deployments"
3. Find previous deployment
4. Click "Rollback"

### Database Rollback

1. Identify the issue
2. Create reverse migration
3. Apply to database
4. Deploy application rollback if needed

---

## Quick Reference

### URLs

| Environment | Landing | Frontend | Backend |
|-------------|---------|----------|---------|
| Production | aideas.com | app.aideas.com | api.aideas.com |
| Local | landing/index.html | localhost:3000 | localhost:8000 |

### Useful Commands

```bash
# Landing - Watch SASS
cd landing && npm run scss:watch

# Frontend - Dev server
cd web && npm run dev

# Backend - Dev server
cd api && uvicorn src.main:app --reload

# Database - Push migrations
supabase db push

# Deploy (manual)
vercel --prod          # Landing/Frontend
railway up             # Backend
```

### Health Checks

```bash
# Landing
curl https://aideas.com

# Frontend
curl https://app.aideas.com

# Backend
curl https://api.aideas.com/health
```

---

*Last Updated: February 2026*
