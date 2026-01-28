# Product Backlog

**Product:** aideas
**Version:** 1.0
**Last Updated:** January 2026
**Owner:** aideas Team
**Sprint Duration:** 1 week

---

## Backlog Summary

| Metric | Value |
|--------|-------|
| **Total Items** | 35 |
| **Total Épicas** | 6 |
| **Must Have (MVP)** | 35 |
| **Estimated MVP Duration** | 12-16 sprints |

### Size Distribution

| Size | Count | Capacity per Sprint | Description |
|------|-------|---------------------|-------------|
| XS | 2 | 4-5 items | Muy simple, pocas horas |
| S | 10 | 3-4 items | Simple, 1-2 días |
| M | 17 | 2-3 items | Moderado, 2-3 días |
| L | 6 | 1-2 items | Complejo, casi todo el sprint |

---

## Epic Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORDEN DE DESARROLLO                                  │
│                  (De afuera hacia adentro)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 1: LANDING PAGE                     5 stories            │   │
│   │  Lo primero que ve el mundo                                     │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 2: AUTENTICACIÓN                    5 stories            │   │
│   │  Entrada al sistema                                             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 3: PORTAL CLIENTE - CORE            5 stories            │   │
│   │  Funcionalidades principales del cliente                        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 4: PORTAL CLIENTE - GESTIÓN         8 stories            │   │
│   │  Funcionalidades de administración del cliente                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 5: ADMIN PANEL                      6 stories            │   │
│   │  Panel de administración de aideas                              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                              ↓                                          │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  ÉPICA 6: BACKEND FOUNDATION               6 stories            │   │
│   │  Base técnica (se desarrolla en paralelo)                       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Epic Summary Table

| Epic | Name | Stories | Sizes | Priority |
|------|------|---------|-------|----------|
| 1 | Landing Page | 5 | 1 XS, 3 S, 1 M | 🔴 Must Have |
| 2 | Autenticación | 5 | 1 XS, 2 S, 2 M | 🔴 Must Have |
| 3 | Portal Cliente - Core | 5 | 1 S, 4 M | 🔴 Must Have |
| 4 | Portal Cliente - Gestión | 8 | 4 S, 3 M, 1 L | 🔴 Must Have |
| 5 | Admin Panel | 6 | 3 M, 3 L | 🔴 Must Have |
| 6 | Backend Foundation | 6 | 4 M, 2 L | 🔴 Must Have |

---

## Prioritized Backlog

---

## 🔴 ÉPICA 1: LANDING PAGE

**Objetivo:** Primera impresión del producto, captar leads, convertir visitantes en registros.
**URL:** aideas.com
**Dependencies:** Ninguna (puede desarrollarse independientemente)

---

### US-1.1: Home Page

**ID:** US-1.1
**Epic:** Landing Page
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero ver una página de inicio atractiva y clara para entender qué es aideas y cómo puede ayudar a mi negocio.

**Acceptance Criteria:**
- [ ] Hero section con headline claro y CTA principal
- [ ] Sección de propuesta de valor (3-4 beneficios clave)
- [ ] Sección de cómo funciona (3 pasos)
- [ ] Sección de automatizaciones destacadas (preview del catálogo)
- [ ] Sección de testimonios/social proof (placeholder para MVP)
- [ ] Sección de pricing preview con CTA
- [ ] Footer con links, redes sociales, legal
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Animaciones sutiles (scroll reveal)
- [ ] CTA buttons llevan a registro

**Technical Notes:**
- Stack: Next.js + Tailwind + shadcn/ui
- Components: Hero, FeatureGrid, HowItWorks, Testimonials, PricingPreview, Footer
- i18n ready (next-intl)
- SEO optimizado

**Dependencies:** Ninguna

---

### US-1.2: Pricing Page

**ID:** US-1.2
**Epic:** Landing Page
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero ver los planes y precios claramente para decidir si aideas se ajusta a mi presupuesto.

**Acceptance Criteria:**
- [ ] 3 planes mostrados (Starter, Pro, Business)
- [ ] Toggle mensual/anual (con descuento anual)
- [ ] Tabla comparativa de features por plan
- [ ] CTA por cada plan → registro
- [ ] FAQ section debajo de pricing
- [ ] Responsive design

**Technical Notes:**
- Stack: Next.js + Tailwind
- Precios desde config/constants (fácil de cambiar)
- Componentes: PricingCard, PricingTable, FAQ

**Dependencies:** Ninguna

---

### US-1.3: Features Page

**ID:** US-1.3
**Epic:** Landing Page
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero explorar todas las funcionalidades de aideas para entender el valor completo del producto.

**Acceptance Criteria:**
- [ ] Lista de todas las categorías de automatizaciones
- [ ] Descripción de cada categoría con iconos
- [ ] Ejemplos de casos de uso por categoría
- [ ] CTA a registro en cada sección
- [ ] Responsive design

**Technical Notes:**
- Stack: Next.js + Tailwind
- Componentes: FeatureCategory, FeatureCard
- Contenido desde MDX o JSON config

**Dependencies:** Ninguna

---

### US-1.4: Contact Page

**ID:** US-1.4
**Epic:** Landing Page
**Size:** XS
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero poder contactar al equipo de aideas si tengo preguntas antes de registrarme.

**Acceptance Criteria:**
- [ ] Formulario de contacto (nombre, email, empresa, mensaje)
- [ ] Validación de campos
- [ ] Confirmación de envío
- [ ] Email de notificación al equipo
- [ ] Información de contacto alternativa
- [ ] Responsive design

**Technical Notes:**
- Stack: Next.js + React Hook Form + Zod
- Email: Resend API
- Componentes: ContactForm

**Dependencies:** 
- Backend: endpoint para recibir contacto (puede ser serverless)

---

### US-1.5: SEO + i18n Setup

**ID:** US-1.5
**Epic:** Landing Page
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como equipo de aideas, queremos que la landing esté optimizada para SEO y preparada para múltiples idiomas.

**Acceptance Criteria:**
- [ ] Meta tags dinámicos por página (title, description, og:image)
- [ ] Sitemap.xml generado automáticamente
- [ ] robots.txt configurado
- [ ] Estructura de URLs para i18n (/en, /es, /pt)
- [ ] Traducciones para EN (completo) y ES (estructura lista)
- [ ] Schema.org markup para SEO
- [ ] Open Graph images

**Technical Notes:**
- Stack: Next.js metadata API + next-intl
- Archivos de traducción en /messages
- generateStaticParams para rutas i18n

**Dependencies:** Ninguna

---

## 🔴 ÉPICA 2: AUTENTICACIÓN

**Objetivo:** Permitir registro, login y gestión de acceso al sistema.
**Provider:** Clerk
**Dependencies:** Landing page (flujo de registro)

---

### US-2.1: Sign Up

**ID:** US-2.1
**Epic:** Autenticación
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como visitante, quiero registrarme en aideas para comenzar a usar el servicio.

**Acceptance Criteria:**
- [ ] Formulario de registro (email + password o social login)
- [ ] Opciones de social login (Google, GitHub)
- [ ] Validación de email único
- [ ] Email de verificación enviado
- [ ] Redirect a onboarding después de verificar
- [ ] Diseño consistente con landing
- [ ] Responsive

**Technical Notes:**
- Stack: Clerk + Next.js
- Clerk components: SignUp
- Custom styling con Clerk appearance API

**Dependencies:**
- US-1.1 (CTA de registro desde landing)

---

### US-2.2: Sign In

**ID:** US-2.2
**Epic:** Autenticación
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario registrado, quiero iniciar sesión para acceder a mi dashboard.

**Acceptance Criteria:**
- [ ] Formulario de login (email + password)
- [ ] Opciones de social login
- [ ] Remember me option
- [ ] Link a "Forgot password"
- [ ] Redirect a dashboard después de login
- [ ] Manejo de errores (credenciales incorrectas)
- [ ] Responsive

**Technical Notes:**
- Stack: Clerk + Next.js
- Clerk components: SignIn
- Middleware para proteger rutas autenticadas

**Dependencies:** 
- US-2.1 (necesita usuarios registrados)

---

### US-2.3: Forgot Password

**ID:** US-2.3
**Epic:** Autenticación
**Size:** XS
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero recuperar mi contraseña si la olvidé.

**Acceptance Criteria:**
- [ ] Formulario para ingresar email
- [ ] Email de reset enviado
- [ ] Página para crear nueva contraseña
- [ ] Confirmación de cambio exitoso
- [ ] Redirect a login

**Technical Notes:**
- Stack: Clerk (built-in)
- Clerk maneja todo el flujo automáticamente

**Dependencies:**
- US-2.1 (necesita usuarios)

---

### US-2.4: Onboarding - Crear Organización

**ID:** US-2.4
**Epic:** Autenticación
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como nuevo usuario, quiero crear mi organización para empezar a usar aideas con mi equipo.

**Acceptance Criteria:**
- [ ] Formulario multi-step:
  - Step 1: Nombre de la organización
  - Step 2: Información del negocio (industria, tamaño)
  - Step 3: Selección de plan (o trial)
- [ ] Validación de slug único para organización
- [ ] Creación de organización en DB
- [ ] Usuario asignado como Admin de la org
- [ ] Redirect a dashboard después de completar
- [ ] Progress indicator

**Technical Notes:**
- Stack: Next.js + React Hook Form + Zod
- API: POST /organizations
- Clerk: asociar user con org via metadata
- UI: Multi-step form component

**Dependencies:**
- US-2.1 (usuario debe estar registrado)
- US-6.1, US-6.2 (backend y DB listos)

---

### US-2.5: Invitar Miembros al Equipo

**ID:** US-2.5
**Epic:** Autenticación
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de una organización, quiero invitar a mi equipo para que puedan acceder al portal.

**Acceptance Criteria:**
- [ ] Formulario de invitación (email, rol)
- [ ] Roles disponibles: Admin, Operator, Viewer
- [ ] Email de invitación enviado
- [ ] Página de aceptación de invitación
- [ ] Crear cuenta si no existe, unir a org si existe
- [ ] Lista de invitaciones pendientes
- [ ] Opción de reenviar o cancelar invitación

**Technical Notes:**
- Stack: Next.js + Clerk Organizations
- API: POST /organizations/:id/invitations
- Email: Resend con template de invitación

**Dependencies:**
- US-2.4 (organización debe existir)
- US-6.5 (endpoints de invitaciones)

---

## 🔴 ÉPICA 3: PORTAL CLIENTE - CORE

**Objetivo:** Funcionalidades principales que el cliente usa día a día.
**URL:** app.aideas.com
**Dependencies:** Autenticación completa

---

### US-3.1: Dashboard Principal

**ID:** US-3.1
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero ver un resumen de mis automatizaciones y métricas al entrar al portal.

**Acceptance Criteria:**
- [ ] Saludo personalizado con nombre del usuario
- [ ] Cards de resumen:
  - Automatizaciones activas (número)
  - Ejecuciones este mes
  - Tiempo ahorrado estimado
  - Solicitudes pendientes
- [ ] Lista de automatizaciones recientes con status
- [ ] Alertas o notificaciones importantes
- [ ] Quick actions (solicitar nueva, ver catálogo)
- [ ] Responsive layout

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET /dashboard/summary
- Components: StatsCard, RecentList, QuickActions
- Real-time updates (opcional, phase 2)

**Dependencies:**
- US-2.4 (onboarding completado)
- US-6.5 (endpoint de dashboard)

---

### US-3.2: Catálogo de Automatizaciones

**ID:** US-3.2
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero explorar todas las automatizaciones disponibles para encontrar una que resuelva mi problema.

**Acceptance Criteria:**
- [ ] Grid/Lista de automatizaciones disponibles
- [ ] Filtros por categoría
- [ ] Búsqueda por nombre/descripción
- [ ] Card de automatización muestra:
  - Nombre
  - Categoría
  - Descripción corta
  - Icono/imagen
- [ ] Click lleva a detalle
- [ ] Empty state si no hay resultados
- [ ] Pagination o infinite scroll
- [ ] Responsive

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET /automations?category=&search=&page=
- Components: AutomationCard, FilterBar, SearchInput
- Server-side filtering para performance

**Dependencies:**
- US-6.5 (endpoint de automatizaciones)
- US-5.4 (templates cargados en admin)

---

### US-3.3: Detalle de Automatización

**ID:** US-3.3
**Epic:** Portal Cliente - Core
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero ver los detalles de una automatización para decidir si la solicito.

**Acceptance Criteria:**
- [ ] Nombre y descripción completa
- [ ] Categoría y tags
- [ ] Casos de uso / ejemplos
- [ ] Beneficios esperados
- [ ] Requisitos o integraciones necesarias
- [ ] Botón "Solicitar esta automatización"
- [ ] Breadcrumb para navegación
- [ ] Responsive

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET /automations/:id
- Route: /automations/[id]
- Components: AutomationDetail, BenefitsList

**Dependencies:**
- US-3.2 (navegación desde catálogo)

---

### US-3.4: Solicitar Nueva Automatización

**ID:** US-3.4
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero solicitar una automatización describiendo mi necesidad para que el equipo de aideas la implemente.

**Acceptance Criteria:**
- [ ] Formulario de solicitud:
  - Automatización seleccionada (si viene de catálogo)
  - Descripción del problema/necesidad
  - Contexto del negocio
  - Urgencia (baja, media, alta)
  - Archivos adjuntos (opcional)
- [ ] Validación de campos requeridos
- [ ] Confirmación de envío
- [ ] Redirect a lista de solicitudes
- [ ] Email de confirmación al cliente
- [ ] Notificación al equipo aideas

**Technical Notes:**
- Stack: Next.js + React Hook Form + Zod
- API: POST /automation-requests
- File upload: Cloudflare R2
- Components: RequestForm, FileUpload

**Dependencies:**
- US-3.3 (puede venir desde detalle)
- US-6.5 (endpoint de requests)

---

### US-3.5: Mis Automatizaciones Activas

**ID:** US-3.5
**Epic:** Portal Cliente - Core
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero ver todas mis automatizaciones activas y su estado actual.

**Acceptance Criteria:**
- [ ] Lista de automatizaciones contratadas
- [ ] Por cada una mostrar:
  - Nombre
  - Status (active, paused, error)
  - Última ejecución
  - Métricas básicas (ejecuciones, éxitos)
- [ ] Filtro por status
- [ ] Click lleva a detalle de MI automatización
- [ ] Empty state si no tiene ninguna
- [ ] Acciones: pausar, ver métricas, configurar

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET /customer-automations
- Route: /my-automations
- Components: AutomationRow, StatusBadge

**Dependencies:**
- US-6.5 (endpoint)
- Requiere tener automatizaciones desplegadas (después de implementación)

---

## 🔴 ÉPICA 4: PORTAL CLIENTE - GESTIÓN

**Objetivo:** Funcionalidades de administración y gestión para el cliente.
**URL:** app.aideas.com
**Dependencies:** Portal Core

---

### US-4.1: Métricas y Dashboard Analytics

**ID:** US-4.1
**Epic:** Portal Cliente - Gestión
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero ver métricas detalladas de mis automatizaciones para medir el ROI.

**Acceptance Criteria:**
- [ ] Selector de rango de fechas
- [ ] Métricas globales:
  - Total ejecuciones
  - Tasa de éxito
  - Tiempo ahorrado estimado
  - Ahorro en $ estimado
- [ ] Gráfica de ejecuciones por día/semana
- [ ] Gráfica de éxito vs errores
- [ ] Métricas por automatización individual
- [ ] Export a CSV (opcional MVP)
- [ ] Responsive

**Technical Notes:**
- Stack: Next.js + shadcn/ui + Recharts (o similar)
- API: GET /metrics?from=&to=&automation_id=
- Components: MetricsChart, DateRangePicker, StatsGrid
- Considerar caching para queries pesadas

**Dependencies:**
- US-3.5 (automatizaciones activas)
- US-6.5 (endpoints de métricas)

---

### US-4.2: Gestión de Equipo - CRUD

**ID:** US-4.2
**Epic:** Portal Cliente - Gestión
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin de organización, quiero gestionar los miembros de mi equipo.

**Acceptance Criteria:**
- [ ] Tabla de miembros del equipo
- [ ] Mostrar: nombre, email, rol, fecha de ingreso, status
- [ ] Acciones: editar rol, remover miembro
- [ ] Botón para invitar nuevo miembro
- [ ] Confirmación antes de remover
- [ ] Solo admins pueden ver esta sección

**Technical Notes:**
- Stack: Next.js + shadcn/ui (DataTable)
- API: GET/PATCH/DELETE /organizations/:id/members
- Components: MembersTable, InviteModal, ConfirmDialog

**Dependencies:**
- US-2.5 (invitaciones)
- US-4.3 (roles)

---

### US-4.3: Roles y Permisos

**ID:** US-4.3
**Epic:** Portal Cliente - Gestión
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin, quiero asignar diferentes roles a mi equipo para controlar qué pueden ver y hacer.

**Acceptance Criteria:**
- [ ] 3 roles: Admin, Operator, Viewer
- [ ] UI para cambiar rol de un miembro
- [ ] Permisos aplicados en frontend (ocultar/mostrar)
- [ ] Permisos aplicados en backend (autorización)
- [ ] Tabla de permisos visible para referencia
- [ ] No poder quitarse el rol de Admin a uno mismo si es el único

**Technical Notes:**
- Stack: Next.js + middleware de permisos
- Permisos definidos en constantes compartidas
- API valida permisos en cada endpoint
- Frontend usa hook usePermissions()

**Permission Matrix:**
```
| Permission        | Admin | Operator | Viewer |
|-------------------|-------|----------|--------|
| View dashboard    |   ✅  |    ✅    |   ✅   |
| View automations  |   ✅  |    ✅    |   ✅   |
| Request automation|   ✅  |    ❌    |   ❌   |
| Configure auto    |   ✅  |    ✅    |   ❌   |
| View billing      |   ✅  |    ❌    |   ❌   |
| Manage team       |   ✅  |    ❌    |   ❌   |
| Contact support   |   ✅  |    ✅    |   ✅   |
```

**Dependencies:**
- US-2.5 (miembros con roles)

---

### US-4.4: Soporte - Crear Ticket

**ID:** US-4.4
**Epic:** Portal Cliente - Gestión
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero crear un ticket de soporte cuando tengo un problema o pregunta.

**Acceptance Criteria:**
- [ ] Formulario de ticket:
  - Asunto
  - Categoría (general, técnico, billing, otro)
  - Prioridad (baja, normal, alta)
  - Descripción
  - Archivos adjuntos (opcional)
- [ ] Validación de campos
- [ ] Confirmación con número de ticket
- [ ] Email de confirmación
- [ ] Redirect a lista de tickets

**Technical Notes:**
- Stack: Next.js + React Hook Form
- API: POST /support/tickets
- Components: TicketForm, FileUpload

**Dependencies:**
- US-6.5 (endpoint)

---

### US-4.5: Soporte - Ver Tickets y Mensajes

**ID:** US-4.5
**Epic:** Portal Cliente - Gestión
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como cliente, quiero ver mis tickets y comunicarme con soporte para resolver mis problemas.

**Acceptance Criteria:**
- [ ] Lista de tickets con status
- [ ] Filtro por status (abierto, en progreso, resuelto, cerrado)
- [ ] Click en ticket abre detalle
- [ ] Detalle muestra:
  - Info del ticket
  - Historial de mensajes (estilo chat)
  - Campo para agregar mensaje
  - Archivos adjuntos
- [ ] Indicador de mensajes nuevos
- [ ] Opción de cerrar ticket

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET /support/tickets, GET /support/tickets/:id, POST /support/tickets/:id/messages
- Components: TicketList, TicketDetail, MessageThread

**Dependencies:**
- US-4.4 (crear tickets)

---

### US-4.6: Facturación - Historial

**ID:** US-4.6
**Epic:** Portal Cliente - Gestión
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin, quiero ver mi historial de pagos y descargar facturas.

**Acceptance Criteria:**
- [ ] Tabla de facturas/invoices
- [ ] Mostrar: fecha, monto, status, periodo
- [ ] Botón para descargar PDF
- [ ] Mostrar plan actual y próximo cobro
- [ ] Link a portal de Stripe para gestión
- [ ] Solo visible para Admin

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET /billing/invoices (synced from Stripe)
- Stripe: Invoice PDF URLs
- Components: InvoiceTable

**Dependencies:**
- US-6.4 (integración Stripe)

---

### US-4.7: Facturación - Portal Stripe

**ID:** US-4.7
**Epic:** Portal Cliente - Gestión
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como admin, quiero gestionar mi suscripción y métodos de pago.

**Acceptance Criteria:**
- [ ] Botón "Gestionar suscripción"
- [ ] Redirect a Stripe Customer Portal
- [ ] En portal pueden:
  - Cambiar método de pago
  - Cambiar plan
  - Ver historial
  - Cancelar suscripción
- [ ] Return URL de vuelta a app

**Technical Notes:**
- Stack: Stripe Customer Portal (no-code)
- API: POST /billing/portal-session
- Stripe maneja toda la UI

**Dependencies:**
- US-6.4 (integración Stripe)

---

### US-4.8: Configuración de Perfil

**ID:** US-4.8
**Epic:** Portal Cliente - Gestión
**Size:** S
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como usuario, quiero actualizar mi información personal y preferencias.

**Acceptance Criteria:**
- [ ] Formulario de perfil:
  - Nombre
  - Avatar (upload)
  - Idioma preferido
  - Zona horaria
  - Notificaciones (email on/off)
- [ ] Cambiar contraseña (via Clerk)
- [ ] Guardar cambios con confirmación
- [ ] Preview de avatar antes de guardar

**Technical Notes:**
- Stack: Next.js + Clerk UserProfile
- API: PATCH /users/me
- File upload: Cloudflare R2

**Dependencies:**
- US-2.1 (usuario existe)

---

## 🔴 ÉPICA 5: ADMIN PANEL

**Objetivo:** Panel de administración para el equipo de aideas.
**URL:** admin.aideas.com
**Dependencies:** Backend completo, datos de clientes

---

### US-5.1: Dashboard Admin

**ID:** US-5.1
**Epic:** Admin Panel
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como equipo aideas, queremos ver métricas globales de la plataforma.

**Acceptance Criteria:**
- [ ] Métricas principales:
  - Total clientes activos
  - MRR (Monthly Recurring Revenue)
  - Automatizaciones desplegadas
  - Solicitudes pendientes
  - Tickets abiertos
- [ ] Gráfica de crecimiento de clientes
- [ ] Gráfica de ingresos por mes
- [ ] Lista de actividad reciente
- [ ] Alertas importantes

**Technical Notes:**
- Stack: Next.js + shadcn/ui + Recharts
- API: GET /admin/dashboard
- Requiere rol de admin de aideas (super admin)

**Dependencies:**
- US-6.5 (endpoints admin)
- Datos de clientes existentes

---

### US-5.2: Lista de Clientes

**ID:** US-5.2
**Epic:** Admin Panel
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como equipo aideas, quiero ver todos los clientes/organizaciones registradas.

**Acceptance Criteria:**
- [ ] Tabla de organizaciones
- [ ] Columnas: nombre, plan, MRR, miembros, automatizaciones, fecha registro
- [ ] Búsqueda por nombre/email
- [ ] Filtros por plan, status
- [ ] Ordenar por columnas
- [ ] Click lleva a detalle
- [ ] Pagination

**Technical Notes:**
- Stack: Next.js + shadcn/ui DataTable
- API: GET /admin/customers?search=&plan=&page=

**Dependencies:**
- Clientes registrados

---

### US-5.3: Detalle de Cliente

**ID:** US-5.3
**Epic:** Admin Panel
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como equipo aideas, quiero ver toda la información de un cliente específico.

**Acceptance Criteria:**
- [ ] Info de la organización
- [ ] Lista de miembros
- [ ] Plan y billing info
- [ ] Automatizaciones activas
- [ ] Historial de solicitudes
- [ ] Tickets de soporte
- [ ] Timeline de actividad
- [ ] Acciones: contactar, ajustar plan, notas internas

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET /admin/customers/:id
- Tabs para organizar información

**Dependencies:**
- US-5.2 (navegación)

---

### US-5.4: Gestión de Templates

**ID:** US-5.4
**Epic:** Admin Panel
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como equipo aideas, quiero gestionar el catálogo de automatizaciones disponibles.

**Acceptance Criteria:**
- [ ] Lista de templates existentes
- [ ] CRUD completo:
  - Crear nuevo template
  - Editar template
  - Activar/desactivar
  - Eliminar (soft delete)
- [ ] Campos:
  - Nombre, slug
  - Descripción corta y larga
  - Categoría
  - Icono/imagen
  - Config schema (JSON)
  - Status (draft, active, deprecated)
- [ ] Preview de cómo se ve en catálogo

**Technical Notes:**
- Stack: Next.js + shadcn/ui + JSON editor
- API: CRUD /admin/templates
- File upload para imágenes

**Dependencies:**
- US-6.2 (schema de templates)

---

### US-5.5: Solicitudes de Automatización

**ID:** US-5.5
**Epic:** Admin Panel
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como equipo aideas, quiero gestionar las solicitudes de automatización de los clientes.

**Acceptance Criteria:**
- [ ] Lista de solicitudes
- [ ] Filtros por status (pending, in_review, approved, deployed, rejected)
- [ ] Detalle de solicitud:
  - Info del cliente
  - Template solicitado
  - Descripción de necesidad
  - Archivos adjuntos
- [ ] Acciones:
  - Cambiar status
  - Agregar notas internas
  - Asignar a equipo
- [ ] Notificar al cliente cuando cambia status

**Technical Notes:**
- Stack: Next.js + shadcn/ui
- API: GET/PATCH /admin/requests

**Dependencies:**
- US-3.4 (solicitudes de clientes)

---

### US-5.6: Analytics de Plataforma

**ID:** US-5.6
**Epic:** Admin Panel
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como equipo aideas, quiero ver analytics detallados para tomar decisiones de negocio.

**Acceptance Criteria:**
- [ ] Reportes de:
  - Crecimiento de usuarios (signups, churn)
  - Revenue (MRR, ARR, growth rate)
  - Uso de automatizaciones (más populares, ejecuciones)
  - Soporte (tickets, tiempo respuesta)
- [ ] Filtros por periodo
- [ ] Comparativa vs periodo anterior
- [ ] Export a CSV

**Technical Notes:**
- Stack: Next.js + Recharts
- API: GET /admin/analytics
- Queries optimizadas con caching

**Dependencies:**
- Datos históricos de uso

---

## 🔴 ÉPICA 6: BACKEND FOUNDATION

**Objetivo:** Base técnica sobre la que se construye todo el sistema.
**Stack:** Python 3.12 + FastAPI + PostgreSQL + Redis
**Dependencies:** Se desarrolla en paralelo con frontend

---

### US-6.1: Setup Proyecto FastAPI

**ID:** US-6.1
**Epic:** Backend Foundation
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero una estructura de proyecto backend bien organizada para desarrollar de manera eficiente.

**Acceptance Criteria:**
- [ ] Estructura de carpetas según ARCHITECTURE.md
- [ ] FastAPI app configurada
- [ ] Configuración por ambiente (dev, staging, prod)
- [ ] CORS configurado
- [ ] Health check endpoint
- [ ] Logging estructurado
- [ ] Error handling global
- [ ] Docker + docker-compose para desarrollo
- [ ] README con instrucciones de setup

**Technical Notes:**
- Stack: FastAPI + Uvicorn + Pydantic Settings
- Estructura modular por features
- .env.example con todas las variables

**Dependencies:** Ninguna

---

### US-6.2: PostgreSQL + Migraciones

**ID:** US-6.2
**Epic:** Backend Foundation
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero la base de datos configurada con todas las tablas necesarias.

**Acceptance Criteria:**
- [ ] Conexión a PostgreSQL configurada
- [ ] SQLAlchemy models para todas las entidades
- [ ] Alembic configurado para migraciones
- [ ] Migración inicial con schema completo
- [ ] Seeds para datos de prueba
- [ ] Índices optimizados
- [ ] Connection pooling configurado

**Technical Notes:**
- Stack: SQLAlchemy 2.x + Alembic
- Schema según ARCHITECTURE.md
- Script de seed para desarrollo

**Dependencies:**
- US-6.1 (proyecto base)

---

### US-6.3: Integración Clerk

**ID:** US-6.3
**Epic:** Backend Foundation
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero validar autenticación de Clerk en el backend para proteger los endpoints.

**Acceptance Criteria:**
- [ ] Middleware de autenticación
- [ ] Validación de JWT de Clerk
- [ ] Extracción de user_id y org_id del token
- [ ] Dependency para obtener current_user
- [ ] Webhook handler para eventos de Clerk:
  - user.created
  - user.updated
  - organization.created
- [ ] Sync de usuarios a DB local
- [ ] Tests de autenticación

**Technical Notes:**
- Stack: python-jose + httpx (para validar con Clerk)
- Webhook signature verification

**Dependencies:**
- US-6.1, US-6.2 (proyecto y DB)
- Clerk account configurada

---

### US-6.4: Integración Stripe

**ID:** US-6.4
**Epic:** Backend Foundation
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero integrar Stripe para manejar suscripciones y pagos.

**Acceptance Criteria:**
- [ ] Crear customer en Stripe al crear org
- [ ] Crear checkout session para suscripción
- [ ] Customer portal session
- [ ] Webhook handler para eventos:
  - checkout.session.completed
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.paid
  - invoice.payment_failed
- [ ] Sync de invoices a DB local
- [ ] Productos y precios configurados en Stripe
- [ ] Tests con Stripe CLI

**Technical Notes:**
- Stack: stripe-python
- Webhook signature verification
- Idempotency keys para operaciones

**Dependencies:**
- US-6.1, US-6.2 (proyecto y DB)
- Stripe account configurada

---

### US-6.5: Endpoints por Módulo

**ID:** US-6.5
**Epic:** Backend Foundation
**Size:** L
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero todos los endpoints necesarios para las funcionalidades del MVP.

**Acceptance Criteria:**
- [ ] Auth module:
  - GET /users/me
  - PATCH /users/me
- [ ] Organizations module:
  - GET /organizations/:id
  - PATCH /organizations/:id
  - GET /organizations/:id/members
  - POST /organizations/:id/invitations
  - DELETE /organizations/:id/members/:uid
- [ ] Automations module:
  - GET /automations (catalog)
  - GET /automations/:id
  - GET /customer-automations
  - GET /customer-automations/:id
  - POST /automation-requests
- [ ] Billing module:
  - GET /billing/subscription
  - POST /billing/checkout-session
  - POST /billing/portal-session
  - GET /billing/invoices
- [ ] Support module:
  - GET /support/tickets
  - POST /support/tickets
  - GET /support/tickets/:id
  - POST /support/tickets/:id/messages
- [ ] Admin module:
  - GET /admin/dashboard
  - GET /admin/customers
  - GET /admin/customers/:id
  - CRUD /admin/templates
  - GET/PATCH /admin/requests
  - GET /admin/analytics
- [ ] Todos con validación, auth, y tests

**Technical Notes:**
- Stack: FastAPI routers
- Pydantic schemas para request/response
- Swagger docs generado automáticamente

**Dependencies:**
- US-6.1, US-6.2, US-6.3, US-6.4

---

### US-6.6: Webhooks

**ID:** US-6.6
**Epic:** Backend Foundation
**Size:** M
**Priority:** 🔴 MUST HAVE
**Status:** 📋 Backlog

**Story:**
Como desarrollador, quiero handlers de webhooks para mantener datos sincronizados con servicios externos.

**Acceptance Criteria:**
- [ ] POST /webhooks/clerk
  - Signature verification
  - Handle user events
  - Handle org events
- [ ] POST /webhooks/stripe
  - Signature verification
  - Handle subscription events
  - Handle invoice events
- [ ] Logging de todos los webhooks
- [ ] Retry logic para failures
- [ ] Idempotency (no procesar duplicados)
- [ ] Tests con mocks

**Technical Notes:**
- Stack: FastAPI
- Background tasks para procesamiento
- Alertas si webhook falla repetidamente

**Dependencies:**
- US-6.3, US-6.4 (Clerk y Stripe configurados)

---

## 🟡 SHOULD HAVE (Post-MVP)

Items para después del MVP inicial:

| ID | Item | Size | Notes |
|----|------|------|-------|
| SH-1 | Chat con AI para describir necesidades | L | Requiere integración OpenAI |
| SH-2 | Integraciones Slack | M | Notificaciones |
| SH-3 | Integraciones WhatsApp | L | Business API |
| SH-4 | Integraciones CRMs | L | Múltiples providers |
| SH-5 | Reportes exportables (PDF/CSV) | M | Generación de documentos |
| SH-6 | Multi-idioma completo (ES, PT) | M | Traducciones completas |

---

## 🟢 COULD HAVE (Nice to Have)

| ID | Item | Size | Notes |
|----|------|------|-------|
| CH-1 | API pública documentada | L | Para integraciones de clientes |
| CH-2 | Marketplace de automatizaciones | XL | Third-party templates |
| CH-3 | App móvil iOS | XL | React Native |
| CH-4 | App móvil Android | XL | React Native |
| CH-5 | Dashboard en tiempo real | M | WebSockets |
| CH-6 | White-label solution | XL | Multi-tenant branding |

---

## ⚪ WON'T HAVE (Out of Scope for MVP)

- Self-service automation builder (muy complejo)
- Video tutorials integrados (crear contenido después)
- Community forum (usar Discord/Slack)
- Affiliate program (post-revenue)
- Multiple payment methods (solo Stripe cards)

---

## Definition of Ready (DoR)

Una User Story está "Ready" para Sprint cuando:

- [ ] Tiene descripción clara (Como X, quiero Y, para Z)
- [ ] Tiene criterios de aceptación específicos y testeables
- [ ] Tiene estimación de tamaño (T-Shirt)
- [ ] Dependencias identificadas y resueltas
- [ ] Diseño/mockup disponible (si aplica)
- [ ] Es completable en 1 sprint

---

## Definition of Done (DoD)

Una User Story está "Done" cuando:

- [ ] Todos los criterios de aceptación cumplidos
- [ ] Código revisado (self-review para trabajo individual)
- [ ] Tests escritos y pasando
- [ ] Sin errores de lint/type
- [ ] Deployado en staging
- [ ] Funcionalidad verificada manualmente
- [ ] Documentación actualizada (si aplica)

---

## Sprint Planning Guide

### Capacidad sugerida por sprint (1 semana)

| Configuración | Capacidad aproximada |
|---------------|---------------------|
| Solo | 1 L, o 2-3 M, o 4-5 S |
| Con ayuda | 1 L + 1 M, o 3-4 M |

### Orden sugerido de sprints

**Sprint 1-2:** Backend Foundation (US-6.1, 6.2) + Landing básica (US-1.1, 1.4, 1.5)

**Sprint 3-4:** Auth (US-6.3, 2.1, 2.2, 2.3, 2.4) + Landing completa (US-1.2, 1.3)

**Sprint 5-6:** Portal Core básico (US-3.1, 3.2, 3.3) + Stripe (US-6.4)

**Sprint 7-8:** Portal Core completo (US-3.4, 3.5) + Billing (US-4.6, 4.7)

**Sprint 9-10:** Gestión (US-4.2, 4.3, 4.4, 4.5) + Invitaciones (US-2.5)

**Sprint 11-12:** Métricas (US-4.1) + Perfil (US-4.8) + Webhooks (US-6.6)

**Sprint 13-14:** Admin básico (US-5.1, 5.2, 5.3, 5.4)

**Sprint 15-16:** Admin completo (US-5.5, 5.6) + Polish + Testing

---

## Velocity Tracking

| Sprint | Planned | Completed | Notes |
|--------|---------|-----------|-------|
| 1 | - | - | - |
| 2 | - | - | - |
| 3 | - | - | - |
| 4 | - | - | - |
| 5 | - | - | - |

**Average Velocity:** Calcular después de 3 sprints

---

## Backlog Maintenance

**Refinement frequency:** Semanal (antes de cada sprint)

**Next review:** [Fecha del próximo refinement]

---

*Last Updated: January 2026*
