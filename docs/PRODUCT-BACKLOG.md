# Product Backlog

**Product:** AIDEAS
**Version:** 2.0
**Last Updated:** February 2026
**Owner:** AIDEAS Team
**Sprint Duration:** 1 week

---

## Backlog Summary

| Metric | Value |
|--------|-------|
| **Total Items** | 32 |
| **Total Épicas** | 6 |
| **Must Have (MVP)** | 32 |
| **Estimated MVP Duration** | 12-16 sprints |

### Size Distribution

| Size | Count | Capacity per Sprint | Description |
|------|-------|---------------------|-------------|
| XS | 2 | 4-5 items | Muy simple, pocas horas |
| S | 8 | 3-4 items | Simple, 1-2 días |
| M | 15 | 2-3 items | Moderado, 2-3 días |
| L | 7 | 1-2 items | Complejo, casi todo el sprint |

---

## Tech Stack Summary

**Landing (aideas.com) - Static:**
- HTML/CSS/JS
- Bootstrap 5 + Custom SCSS
- GSAP + jQuery
- Hosted on Vercel

**Frontend (app.aideas.com) - Next.js:**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Client (Auth + Realtime)
- Hosted on Vercel

**Backend (api.aideas.com) - FastAPI:**
- FastAPI + Python 3.12
- Supabase (PostgreSQL)
- Redis (optional, Railway)
- Hosted on Railway

**Services:**
- Supabase (DB + Auth + Realtime + Storage)
- Stripe (Payments)
- Resend (Email)
- Cloudflare (CDN + DNS)

---

## Epic Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORDEN DE DESARROLLO                                  │
│                  (De afuera hacia adentro)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 1: LANDING PAGE (Static)              4 stories          │   │
│   │  Lo primero que ve el mundo                                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 2: AUTENTICACIÓN (Next.js + Supabase) 5 stories          │   │
│   │  Entrada al sistema                                             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 3: PORTAL CLIENTE - CORE              6 stories          │   │
│   │  Dashboard, catálogo, automatizaciones                          │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 4: PORTAL CLIENTE - GESTIÓN           7 stories          │   │
│   │  Chat, team, billing, settings                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 5: ADMIN PANEL                        5 stories          │   │
│   │  Panel de administración de AIDEAS (Phase 2)                    │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 6: BACKEND FOUNDATION                 5 stories          │   │
│   │  Base técnica (se desarrolla en paralelo)                       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Epic Summary Table

| Epic | Name | Stories | Priority |
|------|------|---------|----------|
| 1 | Landing Page (Static) | 4 | 🔴 Must Have |
| 2 | Autenticación | 5 | 🔴 Must Have |
| 3 | Portal Cliente - Core | 6 | 🔴 Must Have |
| 4 | Portal Cliente - Gestión | 7 | 🔴 Must Have |
| 5 | Admin Panel | 5 | 🟡 Should Have (Phase 2) |
| 6 | Backend Foundation | 5 | 🔴 Must Have |

---

## Prioritized Backlog

---

## 🔴 ÉPICA 1: LANDING PAGE (Static)

**Objetivo:** Primera impresión del producto, captar leads, convertir visitantes en registros.
**URL:** aideas.com
**Stack:** HTML/CSS/JS + Bootstrap 5 + SCSS + GSAP
**Hosting:** Vercel (Static)
**Dependencies:** Ninguna (puede desarrollarse independientemente)

---

### US-1.1: Home Page

**ID:** US-1.1
**Epic:** Landing Page
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero ver una página de inicio atractiva y clara para entender qué es AIDEAS y cómo puede ayudar a mi negocio.

**Acceptance Criteria:**
- [ ] Hero section con headline claro y CTA principal
- [ ] Sección de propuesta de valor (3-4 beneficios clave)
- [ ] Sección de cómo funciona (3 pasos)
- [ ] Sección de automatizaciones destacadas
- [ ] Sección de testimonios/social proof (placeholder)
- [ ] Footer con links, redes sociales, legal
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Animaciones con GSAP
- [ ] CTA buttons → app.aideas.com/signup

**Technical Notes:**
- Files: `landing/index.html`, `landing/assets/scss/`, `landing/assets/js/`
- Stack: Bootstrap 5 + Custom SCSS + GSAP + jQuery
- Template base: Xpovio template adaptado
- SEO: Meta tags, Open Graph
- Analytics: Google Analytics

**Dependencies:** Ninguna

---

### US-1.2: Pricing Page

**ID:** US-1.2
**Epic:** Landing Page
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero ver los planes y precios claramente para decidir si AIDEAS se ajusta a mi presupuesto.

**Acceptance Criteria:**
- [ ] 3 planes mostrados (Starter, Pro, Business)
- [ ] Toggle mensual/anual (con descuento anual)
- [ ] Tabla comparativa de features por plan
- [ ] CTA por cada plan → app.aideas.com/signup?plan=X
- [ ] FAQ section debajo de pricing
- [ ] Responsive design

**Technical Notes:**
- File: `landing/pages/pricing.html`
- Stack: Bootstrap 5 + SCSS
- Toggle: Vanilla JS o jQuery
- Precios desde JSON config (fácil de cambiar)

**Dependencies:** Ninguna

---

### US-1.3: Features Page

**ID:** US-1.3
**Epic:** Landing Page
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero explorar todas las funcionalidades de AIDEAS para entender el valor completo del producto.

**Acceptance Criteria:**
- [ ] Lista de todas las categorías de automatizaciones
- [ ] Descripción de cada categoría con iconos
- [ ] Ejemplos de casos de uso por categoría
- [ ] CTA a registro en cada sección
- [ ] Responsive design

**Technical Notes:**
- File: `landing/pages/features.html`
- Stack: Bootstrap 5 + SCSS
- Icons: Font Awesome o Lucide

**Dependencies:** Ninguna

---

### US-1.4: Contact Page

**ID:** US-1.4
**Epic:** Landing Page
**Size:** XS
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero poder contactar al equipo de AIDEAS si tengo preguntas antes de registrarme.

**Acceptance Criteria:**
- [ ] Formulario de contacto (nombre, email, empresa, mensaje)
- [ ] Validación de campos (HTML5 + JS)
- [ ] Envío via Formspree o similar (no requiere backend)
- [ ] Confirmación de envío
- [ ] Responsive design

**Technical Notes:**
- File: `landing/pages/contact.html`
- Stack: Bootstrap 5 + SCSS
- Form submission: Formspree.io (free tier)
- Validation: HTML5 + vanilla JS

**Dependencies:** Ninguna

---

## 🔴 ÉPICA 2: AUTENTICACIÓN

**Objetivo:** Sistema de registro, login, y gestión de acceso.
**Stack:** Next.js + Supabase Auth
**Dependencies:** Supabase configurado

---

### US-2.1: Registro de Usuario

**ID:** US-2.1
**Epic:** Autenticación
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero registrarme en AIDEAS para acceder a la plataforma.

**Acceptance Criteria:**
- [ ] Página `/signup` con formulario
- [ ] Campos: email, password, nombre, empresa
- [ ] Validación con Zod
- [ ] Crear cuenta con Supabase Auth
- [ ] Email de verificación enviado (Supabase)
- [ ] Redirect a `/verify-email`
- [ ] Mensaje de error si email ya existe
- [ ] Opción de login con Google (OAuth)

**Technical Notes:**
- Route: `web/app/(auth)/signup/page.tsx`
- Stack: Next.js 14 + React Hook Form + Zod + Supabase
- Components: shadcn/ui form components
- OAuth: Supabase Social Auth

**Dependencies:**
- US-6.3 (Supabase Auth configurado)

---

### US-2.2: Login de Usuario

**ID:** US-2.2
**Epic:** Autenticación
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario registrado, quiero hacer login para acceder al portal.

**Acceptance Criteria:**
- [ ] Página `/login` con formulario
- [ ] Campos: email + password
- [ ] Login con Supabase Auth
- [ ] JWT manejado por Supabase client
- [ ] Redirect a `/dashboard` después de login
- [ ] Mensaje de error si credenciales incorrectas
- [ ] Link a "Forgot password"
- [ ] Opción de login con Google

**Technical Notes:**
- Route: `web/app/(auth)/login/page.tsx`
- Stack: Next.js + Supabase Auth
- Session: Supabase handles JWT in cookies

**Dependencies:**
- US-6.3 (Supabase Auth)

---

### US-2.3: Recuperación de Contraseña

**ID:** US-2.3
**Epic:** Autenticación
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero recuperar mi contraseña si la olvido.

**Acceptance Criteria:**
- [ ] Página `/forgot-password` con input de email
- [ ] Envío de email con link de reset (Supabase)
- [ ] Página `/reset-password` con nuevo password
- [ ] Validación de password strength
- [ ] Confirmación de password cambiado
- [ ] Redirect a login

**Technical Notes:**
- Routes: `web/app/(auth)/forgot-password/`, `reset-password/`
- Stack: Next.js + Supabase Auth
- Password reset: Supabase handles magic links

**Dependencies:**
- US-6.3 (Supabase Auth)

---

### US-2.4: Verificación de Email

**ID:** US-2.4
**Epic:** Autenticación
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero verificar mi email para activar mi cuenta.

**Acceptance Criteria:**
- [ ] Email automático enviado al registrarse
- [ ] Link de verificación en email
- [ ] Página `/verify-email` de confirmación
- [ ] Usuario puede hacer login solo después de verificar
- [ ] Opción de reenviar email

**Technical Notes:**
- Route: `web/app/(auth)/verify-email/page.tsx`
- Stack: Next.js + Supabase Auth
- Email verification: Automatic via Supabase

**Dependencies:**
- US-6.3 (Supabase Auth)

---

### US-2.5: Invitaciones a Organización

**ID:** US-2.5
**Epic:** Autenticación
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de organización, quiero invitar miembros de mi equipo.

**Acceptance Criteria:**
- [ ] Formulario para enviar invitación (email + role)
- [ ] Email de invitación enviado (Resend via API)
- [ ] Link único de invitación
- [ ] Página de aceptación de invitación
- [ ] Usuario invitado crea cuenta (o usa existente)
- [ ] Usuario añadido a organización
- [ ] Admin puede ver invitaciones pendientes
- [ ] Admin puede cancelar invitación

**Technical Notes:**
- Routes: `/team/invite`, `/invite/[token]`
- Stack: Next.js + FastAPI (for email) + Supabase
- Invitation tokens: JWT signed
- Email: Resend via FastAPI endpoint

**Dependencies:**
- US-6.1 (API setup)
- US-3.1 (Organization setup)

---

## 🔴 ÉPICA 3: PORTAL CLIENTE - CORE

**Objetivo:** Dashboard principal y funcionalidades core del portal.
**URL:** app.aideas.com
**Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui
**Dependencies:** Auth funcionando

---

### US-3.1: Dashboard Principal

**ID:** US-3.1
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero ver un dashboard con resumen de mis automatizaciones y métricas clave.

**Acceptance Criteria:**
- [ ] Layout con sidebar de navegación
- [ ] Header con user profile dropdown
- [ ] Cards con métricas principales:
  - Automatizaciones activas
  - Ejecuciones este mes
  - Tiempo ahorrado estimado
  - Status general
- [ ] Lista de automatizaciones recientes
- [ ] Gráfico de ejecuciones (últimos 7 días)
- [ ] CTAs: "Request automation", "View all"
- [ ] Responsive design

**Technical Notes:**
- Route: `web/app/(dashboard)/dashboard/page.tsx`
- Layout: `web/app/(dashboard)/layout.tsx`
- Components: Sidebar, Header, MetricCard, Chart (recharts)
- Data: From Supabase via React Query
- Charts: Recharts library

**Dependencies:**
- US-2.1, US-2.2 (Auth)
- US-6.1 (Database models)

---

### US-3.2: Catálogo de Automatizaciones

**ID:** US-3.2
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero ver el catálogo de automatizaciones disponibles.

**Acceptance Criteria:**
- [ ] Lista de templates de automatizaciones
- [ ] Categorías/filtros (por industria, tipo)
- [ ] Cada card muestra: nombre, descripción, categoría
- [ ] CTA: "Request this automation"
- [ ] Búsqueda por keyword
- [ ] Paginación
- [ ] Responsive design

**Technical Notes:**
- Route: `web/app/(dashboard)/catalog/page.tsx`
- Components: CatalogFilters, AutomationCard, SearchInput
- Data: From Supabase `automation_templates` table
- Search: Client-side filtering or Supabase full-text search

**Dependencies:**
- US-6.2 (Templates en database)

---

### US-3.3: Detalle de Automatización Template

**ID:** US-3.3
**Epic:** Portal Cliente - Core
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero ver detalles de una automatización para decidir si la necesito.

**Acceptance Criteria:**
- [ ] Descripción completa
- [ ] Casos de uso detallados
- [ ] Beneficios/valor
- [ ] CTA: "Request this automation"
- [ ] Screenshots/ejemplos (si disponibles)

**Technical Notes:**
- Route: `web/app/(dashboard)/catalog/[id]/page.tsx`
- Data: From Supabase by template ID

**Dependencies:**
- US-3.2 (Catálogo)

---

### US-3.4: Solicitar Automatización

**ID:** US-3.4
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero solicitar una automatización para que AIDEAS la configure para mi organización.

**Acceptance Criteria:**
- [ ] Formulario:
  - Template seleccionado (pre-filled)
  - Descripción de necesidad específica
  - Urgencia (baja/media/alta)
- [ ] Validación de campos
- [ ] Request guardado en database
- [ ] Email de confirmación (via API)
- [ ] Email de notificación al equipo AIDEAS
- [ ] Redirect a "Request submitted"
- [ ] Usuario puede ver status de request

**Technical Notes:**
- Route: `web/app/(dashboard)/request/page.tsx`
- Stack: Next.js + React Hook Form + Zod
- Database: Supabase `automation_requests` table
- Email: FastAPI endpoint → Resend

**Dependencies:**
- US-6.1 (API endpoint for email)
- US-6.2 (Database models)

---

### US-3.5: Mis Automatizaciones

**ID:** US-3.5
**Epic:** Portal Cliente - Core
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero ver todas mis automatizaciones activas y su estado.

**Acceptance Criteria:**
- [ ] Lista de automatizaciones de mi organización
- [ ] Cada item: nombre, status, última ejecución, métricas
- [ ] Filtros: status (activa/pausada/error)
- [ ] Click → detalle
- [ ] Opción de pausar/reactivar (si admin)
- [ ] Responsive design

**Technical Notes:**
- Route: `web/app/(dashboard)/automations/page.tsx`
- Data: From Supabase `automations` table (org filtered)
- Real-time updates: Supabase Realtime subscription

**Dependencies:**
- US-3.1 (Dashboard setup)

---

### US-3.6: Detalle de Mi Automatización

**ID:** US-3.6
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero ver detalles y métricas de una automatización específica.

**Acceptance Criteria:**
- [ ] Información general (nombre, status, creado)
- [ ] Métricas: ejecuciones, tasa de éxito, tiempo ahorrado
- [ ] Historial de ejecuciones recientes
- [ ] Gráfico de ejecuciones over time
- [ ] Logs de errores (si hay)
- [ ] Acciones: pausar/reactivar (si admin)

**Technical Notes:**
- Route: `web/app/(dashboard)/automations/[id]/page.tsx`
- Data: Supabase + `automation_executions` table
- Charts: Recharts

**Dependencies:**
- US-3.5 (Lista de automatizaciones)

---

## 🔴 ÉPICA 4: PORTAL CLIENTE - GESTIÓN

**Objetivo:** Funcionalidades de administración: chat, team, billing, settings.

---

### US-4.1: Chat en Tiempo Real

**ID:** US-4.1
**Epic:** Portal Cliente - Gestión
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero chatear en tiempo real con el equipo AIDEAS para comunicar mis necesidades.

**Acceptance Criteria:**
- [ ] Página/componente de chat accesible desde dashboard
- [ ] Mensajes en tiempo real (Supabase Realtime)
- [ ] Historial de conversación preservado
- [ ] Indicador de "typing"
- [ ] Timestamps en mensajes
- [ ] Soporte para attachments (imágenes, archivos)
- [ ] Notificaciones de nuevos mensajes
- [ ] Responsive design

**Technical Notes:**
- Route: `web/app/(dashboard)/chat/page.tsx`
- Stack: Next.js + Supabase Realtime
- Database: `chat_messages` table
- Storage: Supabase Storage for attachments
- Realtime: Supabase Realtime subscriptions

**Dependencies:**
- US-6.2 (Database models)
- Supabase Realtime configurado

---

### US-4.2: Gestión de Equipo

**ID:** US-4.2
**Epic:** Portal Cliente - Gestión
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin, quiero gestionar los miembros de mi organización.

**Acceptance Criteria:**
- [ ] Lista de miembros actuales
- [ ] Cada miembro: nombre, email, role, fecha join
- [ ] Botón "Invite member" (modal)
- [ ] Cambiar role de miembro
- [ ] Remover miembro (con confirmación)
- [ ] Solo admin puede gestionar equipo
- [ ] Tabla de invitaciones pendientes

**Technical Notes:**
- Route: `web/app/(dashboard)/team/page.tsx`
- Components: MemberList, InviteModal, RoleSelector
- Data: Supabase `organization_members` + `invitations`
- Permissions: Check role in middleware

**Dependencies:**
- US-2.5 (Invitaciones)
- US-6.2 (Database models)

---

### US-4.3: Métricas y Analytics

**ID:** US-4.3
**Epic:** Portal Cliente - Gestión
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero ver métricas detalladas de mis automatizaciones.

**Acceptance Criteria:**
- [ ] Página dedicada de analytics
- [ ] Filtro por período (7d, 30d, 90d, custom)
- [ ] Filtro por automatización
- [ ] Métricas:
  - Ejecuciones totales
  - Tasa de éxito
  - Tiempo ahorrado estimado
  - Errores/fallas
- [ ] Gráficos:
  - Ejecuciones over time
  - Success rate
  - Top automations
- [ ] Tabla de ejecuciones recientes

**Technical Notes:**
- Route: `web/app/(dashboard)/analytics/page.tsx`
- Charts: Recharts
- Data: From Supabase with aggregations
- Date picker: shadcn/ui calendar

**Dependencies:**
- US-3.5 (Mis automatizaciones)

---

### US-4.4: Billing - Ver Subscription

**ID:** US-4.4
**Epic:** Portal Cliente - Gestión
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin, quiero ver mi plan actual y detalles de billing.

**Acceptance Criteria:**
- [ ] Muestra plan actual (Starter/Pro/Business)
- [ ] Features incluidas en el plan
- [ ] Precio mensual/anual
- [ ] Fecha del próximo cobro
- [ ] Payment method (últimos 4 dígitos)
- [ ] Botón "Manage billing" → Stripe Portal
- [ ] Botón "Upgrade plan" → Stripe Checkout

**Technical Notes:**
- Route: `web/app/(dashboard)/billing/page.tsx`
- Data: From FastAPI endpoint (Stripe API)
- Customer Portal: FastAPI creates portal session
- Checkout: FastAPI creates checkout session

**Dependencies:**
- US-6.4 (Stripe configurado)

---

### US-4.5: Billing - Ver Invoices

**ID:** US-4.5
**Epic:** Portal Cliente - Gestión
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin, quiero ver mis facturas pasadas.

**Acceptance Criteria:**
- [ ] Lista de invoices (newest first)
- [ ] Cada invoice: date, amount, status, plan
- [ ] Link para download PDF
- [ ] Filtro por año

**Technical Notes:**
- Route: `web/app/(dashboard)/billing/invoices/page.tsx`
- Data: From FastAPI endpoint (Stripe `invoices.list()`)
- PDF: Stripe invoice.pdf URL

**Dependencies:**
- US-4.4 (Billing setup)

---

### US-4.6: Profile & Settings

**ID:** US-4.6
**Epic:** Portal Cliente - Gestión
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero actualizar mi perfil y configuraciones.

**Acceptance Criteria:**
- [ ] Ver/editar: nombre, apellido, email
- [ ] Ver/editar: idioma preferido (EN/ES/PT)
- [ ] Ver/editar: timezone
- [ ] Cambiar contraseña (form separado)
- [ ] Ver mi role en organización (read-only)
- [ ] Botón "Save changes"
- [ ] Confirmación de cambios guardados

**Technical Notes:**
- Route: `web/app/(dashboard)/settings/page.tsx`
- Forms: React Hook Form + Zod
- Update: Supabase Auth + database profile

**Dependencies:**
- US-2.1 (Auth setup)

---

### US-4.7: Notificaciones

**ID:** US-4.7
**Epic:** Portal Cliente - Gestión
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero recibir notificaciones de eventos importantes.

**Acceptance Criteria:**
- [ ] Bell icon en header con badge de count
- [ ] Dropdown con lista de notificaciones recientes
- [ ] Tipos: nuevo mensaje chat, automation status change, billing
- [ ] Mark as read
- [ ] Click → navega al recurso relacionado
- [ ] Realtime updates (nuevas notificaciones)

**Technical Notes:**
- Component: `NotificationBell.tsx`
- Data: Supabase `notifications` table
- Realtime: Supabase Realtime subscription

**Dependencies:**
- US-3.1 (Dashboard layout)

---

## 🟡 ÉPICA 5: ADMIN PANEL (Phase 2)

**Objetivo:** Panel interno para equipo AIDEAS gestionar clientes y operaciones.
**URL:** admin.aideas.com (o app.aideas.com/admin con route protection)
**Priority:** Should Have (Post-MVP)

---

### US-5.1: Admin Dashboard

**ID:** US-5.1
**Epic:** Admin Panel
**Size:** M
**Priority:** 🟡 SHOULD HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de AIDEAS, quiero un dashboard con overview del negocio.

**Acceptance Criteria:**
- [ ] KPIs: Total customers, Active automations, MRR, Pending requests
- [ ] Gráficos: New customers, Revenue, Top customers
- [ ] Lista de requests recientes
- [ ] Lista de chats activos
- [ ] Quick actions

**Dependencies:** Post-MVP

---

### US-5.2: Customers Management

**ID:** US-5.2
**Epic:** Admin Panel
**Size:** M
**Priority:** 🟡 SHOULD HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de AIDEAS, quiero ver y gestionar clientes.

**Dependencies:** Post-MVP

---

### US-5.3: Templates Management

**ID:** US-5.3
**Epic:** Admin Panel
**Size:** L
**Priority:** 🟡 SHOULD HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de AIDEAS, quiero gestionar los templates de automatizaciones.

**Dependencies:** Post-MVP

---

### US-5.4: Requests Management

**ID:** US-5.4
**Epic:** Admin Panel
**Size:** M
**Priority:** 🟡 SHOULD HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de AIDEAS, quiero gestionar requests de clientes.

**Dependencies:** Post-MVP

---

### US-5.5: Analytics & Reporting

**ID:** US-5.5
**Epic:** Admin Panel
**Size:** L
**Priority:** 🟡 SHOULD HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de AIDEAS, quiero ver analytics del negocio.

**Dependencies:** Post-MVP

---

## 🔴 ÉPICA 6: BACKEND FOUNDATION

**Objetivo:** Base técnica del backend - database, auth, APIs, integrations.

---

### US-6.1: API Setup & Core

**ID:** US-6.1
**Epic:** Backend Foundation
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero la estructura base del API configurada.

**Acceptance Criteria:**
- [ ] FastAPI app inicializado
- [ ] Estructura de carpetas según ARCHITECTURE.md
- [ ] Configuración de settings (Pydantic Settings)
- [ ] Supabase client configurado
- [ ] CORS configurado
- [ ] Health check endpoint `/health`
- [ ] OpenAPI docs en `/docs`
- [ ] Requirements files (base, dev)
- [ ] .env.example
- [ ] README con setup instructions

**Technical Notes:**
- Stack: FastAPI + Supabase + Uvicorn
- Config: Pydantic Settings con .env
- Logging: structlog or loguru
- Location: `api/` folder

**Dependencies:** Ninguna

---

### US-6.2: Database Models & Migrations

**ID:** US-6.2
**Epic:** Backend Foundation
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero todos los modelos de database definidos.

**Acceptance Criteria:**
- [ ] Supabase tables creados:
  - organizations
  - users (extends Supabase auth.users)
  - organization_members
  - automation_templates
  - automations
  - automation_executions
  - automation_requests
  - subscriptions
  - chat_messages
  - notifications
  - invitations
- [ ] RLS policies configuradas
- [ ] Supabase migrations in `supabase/migrations/`
- [ ] Seed script para development data

**Technical Notes:**
- Database: Supabase PostgreSQL
- Migrations: Supabase CLI
- RLS: Row Level Security policies

**Dependencies:**
- US-6.1 (Project setup)

---

### US-6.3: Authentication Integration (Supabase)

**ID:** US-6.3
**Epic:** Backend Foundation
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero integración completa con Supabase Auth.

**Acceptance Criteria:**
- [ ] Supabase project creado
- [ ] Auth configurado (email/password + Google OAuth)
- [ ] Email templates customizados
- [ ] Redirect URLs configurados
- [ ] JWT validation en FastAPI endpoints
- [ ] Protected routes middleware

**Technical Notes:**
- Supabase Auth: Email + Social providers
- FastAPI: JWT validation dependency
- Next.js: @supabase/ssr for auth

**Dependencies:**
- US-6.1, US-6.2

---

### US-6.4: Payments Integration (Stripe)

**ID:** US-6.4
**Epic:** Backend Foundation
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero integración completa con Stripe.

**Acceptance Criteria:**
- [ ] Stripe account configurado
- [ ] Products & Prices en Stripe Dashboard
- [ ] FastAPI endpoints:
  - POST /api/v1/billing/checkout-session
  - POST /api/v1/billing/customer-portal
  - GET /api/v1/billing/subscription
  - GET /api/v1/billing/invoices
- [ ] Webhook endpoint: POST /api/webhooks/stripe
- [ ] Handle subscription events
- [ ] Sync subscription status to Supabase

**Technical Notes:**
- Stack: Stripe Python SDK
- Webhooks: Verify signature
- Events: subscription.created, updated, deleted, invoice.paid

**Dependencies:**
- US-6.1

---

### US-6.5: API Endpoints

**ID:** US-6.5
**Epic:** Backend Foundation
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero todos los endpoints necesarios para el MVP.

**Acceptance Criteria:**
- [ ] Auth endpoints (via Supabase, minimal FastAPI)
- [ ] Organizations endpoints
- [ ] Automations endpoints
- [ ] Requests endpoints
- [ ] Billing endpoints (Stripe)
- [ ] Email endpoints (Resend)
- [ ] All with Pydantic validation
- [ ] All with JWT auth middleware
- [ ] OpenAPI documentation

**Technical Notes:**
- Stack: FastAPI routers
- Validation: Pydantic v2
- Auth: JWT dependency injection
- Docs: Auto-generated Swagger

**Dependencies:**
- US-6.1, US-6.2, US-6.3, US-6.4

---

## 🟡 SHOULD HAVE (Post-MVP)

| ID | Item | Size | Notes |
|----|------|------|-------|
| SH-1 | Chat con AI para describir necesidades | L | OpenAI integration |
| SH-2 | Integraciones Slack | M | Notifications |
| SH-3 | Integraciones WhatsApp | L | Business API |
| SH-4 | Advanced Reports (PDF/CSV) | M | Export functionality |
| SH-5 | Multi-idioma completo (ES, PT) | M | Full translations |
| SH-6 | Admin Panel completo | XL | Phase 2 priority |

---

## 🟢 COULD HAVE (Nice to Have)

| ID | Item | Size | Notes |
|----|------|------|-------|
| CH-1 | Public API documentada | L | Customer integrations |
| CH-2 | Marketplace de automatizaciones | XL | Third-party templates |
| CH-3 | Mobile app (React Native) | XL | iOS + Android |
| CH-4 | Advanced real-time dashboard | M | Live metrics |

---

## ⚪ WON'T HAVE (Out of Scope)

- Self-service automation builder (NOT our model)
- Video tutorials integrados
- Community forum
- Affiliate program
- Multiple payment methods (solo Stripe)

---

## Definition of Ready (DoR)

Una User Story está "Ready" para Sprint cuando:

- [ ] Tiene descripción clara (Como X, quiero Y, para Z)
- [ ] Tiene criterios de aceptación específicos
- [ ] Tiene estimación de tamaño (T-Shirt)
- [ ] Dependencias identificadas y resueltas
- [ ] Diseño/mockup disponible (si aplica)
- [ ] Es completable en 1 sprint

---

## Definition of Done (DoD)

Una User Story está "Done" cuando:

- [ ] Todos los criterios de aceptación cumplidos
- [ ] Código revisado
- [ ] Tests escritos y pasando
- [ ] Sin errores de lint/type
- [ ] Deployado en staging
- [ ] Funcionalidad verificada
- [ ] Documentación actualizada

---

## Sprint Planning Guide

### Capacidad sugerida por sprint (1 semana)

| Configuración | Capacidad aproximada |
|---------------|---------------------|
| Solo | 1 L, o 2-3 M, o 4-5 S |
| Con ayuda | 1 L + 1 M, o 3-4 M |

### Orden sugerido de sprints

**Sprint 1-2:** Landing Page (US-1.1, 1.2, 1.3, 1.4)

**Sprint 3-4:** Backend Foundation (US-6.1, 6.2, 6.3) + Auth básica (US-2.1, 2.2)

**Sprint 5-6:** Auth completa (US-2.3, 2.4, 2.5) + Dashboard básico (US-3.1)

**Sprint 7-8:** Portal Core (US-3.2, 3.3, 3.4, 3.5, 3.6)

**Sprint 9-10:** Chat (US-4.1) + Team (US-4.2) + Analytics (US-4.3)

**Sprint 11-12:** Billing (US-6.4, 4.4, 4.5) + Settings (US-4.6) + Notifications (US-4.7)

**Sprint 13-14:** Polish + Testing + API (US-6.5)

**Sprint 15-16:** Bug fixes + Launch preparation

---

## Velocity Tracking

| Sprint | Planned | Completed | Notes |
|--------|---------|-----------|-------|
| 1 | - | - | - |
| 2 | - | - | - |
| 3 | - | - | - |
| 4 | - | - | - |
| 5 | - | - | - |

**Average Velocity:** Calculate after 3 sprints

---

## Backlog Maintenance

**Refinement frequency:** Semanal (antes de cada sprint)

**Next review:** [Fecha del próximo refinement]

---

**Document Version:** 2.0
**Last Updated:** February 2026
**Changes:** Updated to Static Landing + Next.js + FastAPI architecture
