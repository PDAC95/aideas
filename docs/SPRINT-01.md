# Sprint Planning - Sprint 1

**Product:** aideas
**Sprint Number:** 1
**Sprint Duration:** 1 week
**Planning Date:** January 2026
**Owner:** aideas Team

---

## Sprint Overview

### Sprint Goal 🎯

> **"Establecer la base técnica del proyecto (backend + database) y lanzar la primera versión de la landing page"**

Este sprint sienta las bases sobre las que se construirá todo el producto. Al finalizar tendremos:
- Backend funcional con estructura profesional
- Base de datos con esquema completo
- Landing page publicada en producción

### Sprint Metrics

| Metric | Value |
|--------|-------|
| **Duration** | 1 week (5 working days) |
| **Available Capacity** | 40 hrs (bruto) / ~28 hrs (efectivo) |
| **Committed Stories** | 4 |
| **Story Sizes** | 3 M + 1 XS |
| **Expected Velocity** | Por establecer (Sprint 1) |

---

## Sprint Backlog

### Selected User Stories

---

#### ✅ US-6.1: Setup Proyecto FastAPI

**Epic:** Backend Foundation
**Priority in Sprint:** 1 (hacer primero)
**Size:** M
**Estimated Hours:** 8-10 hrs
**Owner:** Developer

**Story:**
Como desarrollador, quiero una estructura de proyecto backend bien organizada para desarrollar de manera eficiente.

**Acceptance Criteria:**

- [ ] Estructura de carpetas creada según ARCHITECTURE.md
  ```
  apps/api/
  ├── src/
  │   ├── main.py
  │   ├── config/
  │   ├── modules/
  │   ├── core/
  │   └── database/
  ├── tests/
  ├── requirements/
  └── Dockerfile
  ```
- [ ] FastAPI app configurada y corriendo
- [ ] Configuración por ambiente (dev, staging, prod) con Pydantic Settings
- [ ] CORS configurado para dominios de frontend
- [ ] Health check endpoint funcionando (`GET /health`)
- [ ] Logging estructurado configurado
- [ ] Error handling global implementado
- [ ] Docker + docker-compose para desarrollo local
- [ ] README con instrucciones de setup
- [ ] .env.example con todas las variables necesarias

**Technical Tasks:**

- [ ] Crear estructura de carpetas
- [ ] Configurar FastAPI con Uvicorn
- [ ] Crear config/settings.py con Pydantic Settings
- [ ] Implementar middleware de CORS
- [ ] Crear endpoint /health
- [ ] Configurar logging con formato JSON
- [ ] Crear exception handlers globales
- [ ] Crear Dockerfile
- [ ] Crear docker-compose.yml (api + postgres + redis)
- [ ] Escribir README.md
- [ ] Crear .env.example

**Dependencies:** Ninguna

**Definition of Done:**
- [ ] `docker-compose up` levanta el proyecto
- [ ] `GET /health` responde 200
- [ ] Swagger UI disponible en `/docs`
- [ ] Logs estructurados visibles en consola

---

#### ✅ US-6.2: PostgreSQL + Migraciones

**Epic:** Backend Foundation
**Priority in Sprint:** 2
**Size:** M
**Estimated Hours:** 8-10 hrs
**Owner:** Developer

**Story:**
Como desarrollador, quiero la base de datos configurada con todas las tablas necesarias.

**Acceptance Criteria:**

- [ ] Conexión a PostgreSQL configurada y funcionando
- [ ] SQLAlchemy 2.x configurado con async support
- [ ] Alembic configurado para migraciones
- [ ] Migración inicial con schema completo:
  - [ ] organizations
  - [ ] users
  - [ ] organization_members
  - [ ] automation_templates
  - [ ] customer_automations
  - [ ] automation_executions
  - [ ] automation_requests
  - [ ] support_tickets
  - [ ] ticket_messages
  - [ ] invoices
- [ ] Índices creados según ARCHITECTURE.md
- [ ] Script de seed para datos de prueba
- [ ] Connection pooling configurado

**Technical Tasks:**

- [ ] Instalar SQLAlchemy + asyncpg + alembic
- [ ] Crear database/base.py con Base class
- [ ] Crear database/session.py con async session
- [ ] Crear config/database.py con URL y pool settings
- [ ] Crear models para cada entidad (en modules/*/models.py)
- [ ] Inicializar Alembic (`alembic init`)
- [ ] Configurar alembic/env.py para async
- [ ] Generar migración inicial (`alembic revision --autogenerate`)
- [ ] Ejecutar migración (`alembic upgrade head`)
- [ ] Crear scripts/seed_db.py
- [ ] Probar conexión y queries básicas

**Dependencies:** 
- US-6.1 (proyecto base debe existir)

**Definition of Done:**
- [ ] `alembic upgrade head` crea todas las tablas
- [ ] `alembic downgrade base` elimina las tablas
- [ ] Script de seed inserta datos de prueba
- [ ] Queries básicas funcionan (SELECT, INSERT)

---

#### ✅ US-1.1: Home Page Landing

**Epic:** Landing Page
**Priority in Sprint:** 3
**Size:** M
**Estimated Hours:** 6-8 hrs
**Owner:** Developer

**Story:**
Como visitante, quiero ver una página de inicio atractiva y clara para entender qué es aideas y cómo puede ayudar a mi negocio.

**Acceptance Criteria:**

- [ ] Hero section con:
  - [ ] Headline claro y compelling
  - [ ] Subheadline explicando el valor
  - [ ] CTA principal "Get Started" / "Start Free"
  - [ ] Imagen o ilustración relevante
- [ ] Features section (3-4 beneficios clave):
  - [ ] Icono + título + descripción por cada uno
  - [ ] Grid responsive
- [ ] How it Works section (3 pasos):
  - [ ] Paso 1: Describe tu necesidad
  - [ ] Paso 2: Nosotros lo automatizamos
  - [ ] Paso 3: Tu negocio crece
- [ ] CTA section final con botón de registro
- [ ] Footer con:
  - [ ] Links básicos (Home, Pricing, Contact)
  - [ ] Copyright
  - [ ] Redes sociales (placeholders)
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] Animaciones sutiles (scroll reveal)

**Technical Tasks:**

- [ ] Crear app Next.js en apps/landing (si no existe)
- [ ] Configurar Tailwind CSS
- [ ] Instalar shadcn/ui
- [ ] Crear componentes:
  - [ ] components/Hero.tsx
  - [ ] components/Features.tsx
  - [ ] components/HowItWorks.tsx
  - [ ] components/CTA.tsx
  - [ ] components/Footer.tsx
- [ ] Crear página principal app/page.tsx
- [ ] Agregar animaciones con Framer Motion (opcional)
- [ ] Verificar responsive en todos los breakpoints
- [ ] Optimizar imágenes

**Dependencies:** Ninguna (frontend independiente)

**Definition of Done:**
- [ ] Página carga correctamente en localhost:3000
- [ ] Todas las secciones visibles y funcionales
- [ ] Responsive verificado en mobile/tablet/desktop
- [ ] Lighthouse score > 90 (performance)
- [ ] Desplegado en Vercel (preview)

---

#### ✅ US-1.4: Contact Page

**Epic:** Landing Page
**Priority in Sprint:** 4
**Size:** XS
**Estimated Hours:** 2-3 hrs
**Owner:** Developer

**Story:**
Como visitante, quiero poder contactar al equipo de aideas si tengo preguntas antes de registrarme.

**Acceptance Criteria:**

- [ ] Formulario de contacto con campos:
  - [ ] Nombre (required)
  - [ ] Email (required, validación)
  - [ ] Empresa (optional)
  - [ ] Mensaje (required, textarea)
- [ ] Validación client-side con feedback visual
- [ ] Botón submit con loading state
- [ ] Mensaje de confirmación después de enviar
- [ ] Email de notificación al equipo (Resend)
- [ ] Información de contacto alternativa
- [ ] Responsive design

**Technical Tasks:**

- [ ] Crear página app/contact/page.tsx
- [ ] Instalar React Hook Form + Zod
- [ ] Crear componente ContactForm.tsx
- [ ] Implementar validación con Zod schema
- [ ] Crear API route app/api/contact/route.ts
- [ ] Integrar Resend para envío de email
- [ ] Crear template de email
- [ ] Agregar toast de confirmación
- [ ] Estilizar con Tailwind

**Dependencies:** Ninguna

**Definition of Done:**
- [ ] Formulario valida correctamente
- [ ] Submit envía email al equipo
- [ ] Usuario ve confirmación de envío
- [ ] Funciona en mobile

---

### Stories Consideradas pero NO Incluidas

#### 📌 US-1.2: Pricing Page

**Razón:** Capacidad insuficiente para Sprint 1
**Considerar para:** Sprint 2

#### 📌 US-1.3: Features Page

**Razón:** Capacidad insuficiente para Sprint 1
**Considerar para:** Sprint 2

#### 📌 US-1.5: SEO + i18n Setup

**Razón:** Mejor hacerlo cuando landing esté más completa
**Considerar para:** Sprint 2

---

## Sprint Calendar

### Week 1 (5 días)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SPRINT 1 CALENDAR                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   DÍA 1 (Lunes)                                        ~8 hrs           │
│   ─────────────                                                         │
│   □ US-6.1: Setup FastAPI                                               │
│     • Estructura de carpetas                                            │
│     • Configuración básica                                              │
│     • Docker setup                                                      │
│                                                                         │
│   DÍA 2 (Martes)                                       ~8 hrs           │
│   ──────────────                                                        │
│   □ US-6.1: Completar setup                                             │
│     • Error handling                                                    │
│     • Logging                                                           │
│     • Health check                                                      │
│   □ US-6.2: Iniciar PostgreSQL                                          │
│     • SQLAlchemy config                                                 │
│     • Alembic init                                                      │
│                                                                         │
│   DÍA 3 (Miércoles)                                    ~8 hrs           │
│   ─────────────────                                                     │
│   □ US-6.2: Completar Database                                          │
│     • Todos los models                                                  │
│     • Migración inicial                                                 │
│     • Seed script                                                       │
│   ⭐ MID-SPRINT CHECK: Backend debe estar funcional                     │
│                                                                         │
│   DÍA 4 (Jueves)                                       ~8 hrs           │
│   ──────────────                                                        │
│   □ US-1.1: Home Page                                                   │
│     • Setup Next.js + Tailwind                                          │
│     • Hero section                                                      │
│     • Features section                                                  │
│     • How it Works                                                      │
│                                                                         │
│   DÍA 5 (Viernes)                                      ~8 hrs           │
│   ───────────────                                                       │
│   □ US-1.1: Completar Home Page                                         │
│     • CTA section                                                       │
│     • Footer                                                            │
│     • Responsive                                                        │
│   □ US-1.4: Contact Page                                                │
│     • Formulario completo                                               │
│     • Integración email                                                 │
│   □ Deploy a Vercel (preview)                                           │
│   □ Sprint Review & Retrospective                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Daily Schedule

| Time | Activity |
|------|----------|
| 9:00 AM | Daily Scrum (5 min self-check) |
| 9:05 AM - 1:00 PM | Deep Work Block 1 |
| 1:00 PM - 2:00 PM | Break |
| 2:00 PM - 6:00 PM | Deep Work Block 2 |
| 6:00 PM | Update progress tracking |

---

## Risks & Mitigations

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Primera vez con FastAPI | 🟡 Medium | 🟡 Medium | Seguir docs oficiales, usar templates |
| Setup de Docker/DB toma más tiempo | 🟡 Medium | 🟢 Low | Buffer incluido en estimación |
| Diseño de landing toma más tiempo | 🟡 Medium | 🟢 Low | Usar shadcn/ui components, no diseño custom |
| Problemas con Resend/email | 🟢 Low | 🟢 Low | Dejar email para el final, MVP sin email OK |

### Blockers Anticipados

- [ ] **Cuenta de Vercel** - Crear si no existe (10 min)
- [ ] **Cuenta de Railway** - Crear si no existe (10 min)
- [ ] **Cuenta de Resend** - Crear para emails (10 min)
- [ ] **Dominio aideas.com** - Verificar disponibilidad/compra

### Contingency Plan

Si el tiempo no alcanza:
1. **Prioridad 1:** Backend (US-6.1, US-6.2) - DEBE completarse
2. **Prioridad 2:** Home page básica (US-1.1) - Puede ser más simple
3. **Prioridad 3:** Contact page (US-1.4) - Puede moverse a Sprint 2

---

## Technical Considerations

### Setup Necesario (Día 1, primeras horas)

**Herramientas a instalar:**
- [ ] Python 3.12
- [ ] Node.js 20 LTS
- [ ] Docker Desktop
- [ ] pnpm (`npm install -g pnpm`)
- [ ] Git configurado

**Cuentas a crear/configurar:**
- [ ] GitHub repository (si no existe)
- [ ] Vercel account
- [ ] Railway account
- [ ] Resend account (free tier)

**Monorepo Setup:**
- [ ] Inicializar Turborepo
- [ ] Crear estructura de carpetas base
- [ ] Configurar pnpm workspaces

### Architecture Decisions (Ya resueltas)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend Framework | FastAPI | Async, performance, Python AI ecosystem |
| ORM | SQLAlchemy 2.x | Industry standard, async support |
| Frontend Framework | Next.js 14 | SSR, App Router, Vercel integration |
| Styling | Tailwind + shadcn/ui | Speed, consistency, customizable |
| Monorepo Tool | Turborepo | Vercel ecosystem, simple config |

---

## Definition of Done (Sprint 1)

Una story está **Done** cuando:

- [ ] Todos los Acceptance Criteria cumplidos
- [ ] Código funcional y testeado manualmente
- [ ] Sin errores en consola (frontend) o logs (backend)
- [ ] Responsive verificado (si aplica)
- [ ] Documentación básica incluida (README)
- [ ] Deployable a staging/preview

### Sprint 1 Specific DoD:

- [ ] Backend: `docker-compose up` funciona
- [ ] Backend: `/health` y `/docs` accesibles
- [ ] Frontend: Preview URL de Vercel funcionando
- [ ] Database: Migraciones aplicadas sin errores

---

## Progress Tracking

### Story Status Board

| Story | Status | Progress | Notes |
|-------|--------|----------|-------|
| US-6.1 | 📋 To Do | 0% | |
| US-6.2 | 📋 To Do | 0% | |
| US-1.1 | 📋 To Do | 0% | |
| US-1.4 | 📋 To Do | 0% | |

**Status Legend:**
- 📋 To Do
- 🔄 In Progress
- 🔍 In Review
- ✅ Done
- ⛔ Blocked

### Daily Progress Log

#### Day 1
- [ ] Started: 
- [ ] Completed:
- [ ] Blockers:

#### Day 2
- [ ] Started:
- [ ] Completed:
- [ ] Blockers:

#### Day 3 (Mid-Sprint)
- [ ] Started:
- [ ] Completed:
- [ ] Blockers:
- [ ] On track? Y/N

#### Day 4
- [ ] Started:
- [ ] Completed:
- [ ] Blockers:

#### Day 5
- [ ] Started:
- [ ] Completed:
- [ ] Blockers:

---

## Sprint Review Preparation

**Scheduled:** Día 5 (Viernes) - Final del día

### Demo Items

| Story | What to Demo |
|-------|--------------|
| US-6.1 | Swagger UI, health check, docker-compose up |
| US-6.2 | Tables created, seed data, basic query |
| US-1.1 | Home page completa, responsive demo |
| US-1.4 | Formulario, validación, envío de email |

### Review Questions

- ¿Se cumplió el Sprint Goal?
- ¿Qué quedó pendiente y por qué?
- ¿El velocity establecido es realista para Sprint 2?

---

## Sprint Retrospective

**Scheduled:** Después del Review

### Template

**What went well? 🎉**
- 

**What didn't go well? 😕**
- 

**What to improve? 🚀**
- 

**Action items for Sprint 2:**
- [ ] 

### Velocity Calculation

```
Committed: 4 stories (3M + 1XS)
Completed: ___ stories
Velocity:  ___ (usar para Sprint 2 planning)
```

---

## Commitment

**Como desarrollador, me comprometo a:**

- [x] Trabajar en las stories en orden de prioridad
- [x] Actualizar el progress tracking diariamente
- [x] Comunicar blockers inmediatamente
- [x] No agregar scope sin re-planning
- [x] Mantener DoD como estándar mínimo
- [x] Hacer Sprint Review y Retrospective

---

## Quick Reference

### 🚨 Si surge trabajo urgente:

1. Evaluar si afecta el Sprint Goal
2. Si es crítico: Re-planificar (quitar algo del sprint)
3. Si no es crítico: Agregar al Product Backlog para Sprint 2

### 📊 Health Check:

| Day | Expected Progress |
|-----|-------------------|
| 2 | US-6.1 casi completo |
| 3 | Backend completo (US-6.1 + US-6.2) |
| 4 | Home page 70% |
| 5 | Todo completo + deploy |

### ⚠️ Red Flags:

- Story sin progreso por 1+ días
- Blocker no resuelto en 4 hrs
- Día 3 y backend no funciona

---

## Sprint 2 Preview

**Candidatos para Sprint 2:**
- US-1.2: Pricing Page (S)
- US-1.3: Features Page (S)
- US-1.5: SEO + i18n Setup (S)
- US-6.3: Integración Clerk (M)
- US-2.1: Sign Up (S)
- US-2.2: Sign In (S)

**Sprint 2 Goal (tentativo):**
> "Completar landing page y habilitar registro/login de usuarios"

---

*Sprint 1 Created: January 2026*
*Status: Ready to Execute*
