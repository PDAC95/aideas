# Test Users — AIDEAS Customer Portal

**Source:** `supabase/seed.sql`
**Password (todos):** `Password123`

> Si los logins fallan: re-corre el seed con `supabase db reset` (esto recrea TODO desde cero).

---

## Para UAT de Phase 20 (Admin de Automations)

Necesitas **dos pestañas/sesiones** abiertas en paralelo:

### 1. Admin (`/admin/...`)
| Email | Rol | Notas |
|-------|-----|-------|
| `pdmckinster@gmail.com` | `super_admin` (platform_staff) | Sin org membership — entra directo a `/admin` |

### 2. Customer (`/dashboard/...`)
Para ver el lado cliente de las transiciones del admin. Cualquiera de estos:

| Email | Org | Rol | Para qué sirve |
|-------|-----|-----|---------------|
| `alice@acmecorp.com` | Acme Corp | owner | Ver notificaciones / dashboard como dueña |
| `bob@acmecorp.com` | Acme Corp | operator | Ver dashboard como operador |
| `dev@jappi.ca` | Acme Corp | (depende del seed) | Cuenta de dev histórica |
| `carol@globaltech.io` | GlobalTech | owner | Segunda org — útil para probar que el admin filtra cross-org |
| `dave@globaltech.io` | GlobalTech | viewer | Solo lectura |

---

## Flujo recomendado de UAT

1. Pestaña A → login como `pdmckinster@gmail.com` → `/admin/automations`
2. Pestaña B (incognito o otro browser) → login como `alice@acmecorp.com` → `/dashboard/automations`
3. En A, haz una transición sobre una automation de Acme Corp
4. En B, refresca → la transición debe verse reflejada y debe haber notificación nueva

---

## Si NADA funciona

```bash
# Reset total de la DB local
supabase db reset

# Verifica que el dev server esté corriendo
cd web
npm run dev
```

Si el browser muestra `chrome-error://chromewebdata/` el problema NO es de auth — el dev server no está respondiendo. Revisa la terminal donde corre `npm run dev`.
