# Sprint Planning - Sprint 1

**Product:** aideas
**Sprint Number:** 1
**Sprint Duration:** 1 week
**Planning Date:** February 2026
**Owner:** aideas Team

---

## Sprint Overview

### Sprint Goal 🎯

> **"Establecer la base técnica del proyecto (backend + database + templates) y lanzar la primera versión de la landing page"**

Este sprint sienta las bases sobre las que se construirá todo el producto. Al finalizar tendremos:
- Backend FastAPI funcional con estructura profesional
- Base de datos Supabase configurada con esquema completo
- Sistema de templates Jinja2 funcionando
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

#### ✅ US-6.1: Setup Proyecto FastAPI + Supabase + Redis

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
  aideas/
  ├── src/
  │   ├── main.py
  │   ├── config/
  │   │   ├── settings.py
  │   │   ├── supabase.py
  │   │   └── redis.py
  │   ├── routes/
  │   │   ├── web/
  │   │   └── api/
  │   ├── services/
  │   ├── core/
  │   └── utils/
  ├── templates/
  │   └── base.html
  ├── static/
  │   ├── css/
  │   └── js/
  ├── tests/
  ├── requirements/
  └── docker-compose.yml
  ```
- [ ] FastAPI app configurada y corriendo
- [ ] Supabase client configurado y conectado
- [ ] Redis client configurado y conectado
- [ ] Configuración por ambiente (dev, staging, prod) con Pydantic Settings
- [ ] CORS configurado
- [ ] Health check endpoint funcionando (`GET /health`)
- [ ] Logging estructurado configurado (structlog)
- [ ] Error handling global implementado
- [ ] Jinja2 templates configurados
- [ ] Static files serving configurado
- [ ] Docker Compose para desarrollo local (solo Redis)
- [ ] README con instrucciones de setup
- [ ] .env.example con todas las variables necesarias

**Technical Tasks:**

- [ ] Crear estructura de carpetas según ARCHITECTURE.md
- [ ] Instalar dependencias base:
  ```
  fastapi
  uvicorn[standard]
  pydantic-settings
  supabase
  redis
  python-jose[cryptography]
  jinja2
  aiofiles
  structlog
  ```
- [ ] Crear src/main.py con FastAPI app
- [ ] Crear src/config/settings.py con Pydantic Settings
- [ ] Crear src/config/supabase.py (Supabase client)
- [ ] Crear src/config/redis.py (Redis client)
- [ ] Configurar Jinja2Templates
- [ ] Configurar StaticFiles mounting
- [ ] Implementar middleware de CORS
- [ ] Crear endpoint /health (check Supabase + Redis)
- [ ] Configurar structlog con formato JSON
- [ ] Crear exception handlers globales
- [ ] Crear docker-compose.yml (Redis only)
- [ ] Crear templates/base.html básico
- [ ] Crear static/css/main.css básico
- [ ] Escribir README.md
- [ ] Crear .env.example con todas las variables:
  ```
  # Supabase
  SUPABASE_URL=
  SUPABASE_KEY=
  
  # Redis
  REDIS_URL=redis://localhost:6379
  
  # App
  SECRET_KEY=
  ENVIRONMENT=development
  ALLOWED_HOSTS=localhost,127.0.0.1
  ```

**Dependencies:** Ninguna

**Definition of Done:**
- [ ] `uvicorn src.main:app --reload` levanta el proyecto
- [ ] `GET /health` responde 200 con status de Supabase y Redis
- [ ] Swagger UI disponible en `/docs`
- [ ] Logs estructurados visibles en consola
- [ ] Templates Jinja2 renderizan correctamente

---

#### ✅ US-6.2: Supabase Database Setup + Models

**Epic:** Backend Foundation
**Priority in Sprint:** 2
**Size:** M
**Estimated Hours:** 8-10 hrs
**Owner:** Developer

**Story:**
Como desarrollador, quiero la base de datos Supabase configurada con todas las tablas necesarias.

**Acceptance Criteria:**

- [ ] Proyecto Supabase creado (supabase.com)
- [ ] Supabase CLI instalado localmente
- [ ] Schema SQL completo creado:
  - [ ] organizations
  - [ ] users (extends auth.users)
  - [ ] organization_members
  - [ ] automation_templates
  - [ ] automations
  - [ ] automation_executions
  - [ ] automation_requests
  - [ ] support_tickets
  - [ ] support_messages
  - [ ] subscriptions
  - [ ] invoices
  - [ ] invitations
- [ ] Row Level Security (RLS) policies básicas configuradas
- [ ] Índices creados según ARCHITECTURE.md
- [ ] SQLAlchemy models creados (opcional - o usar Supabase client directo)
- [ ] Script de seed para datos de prueba
- [ ] Connection pooling configurado

**Technical Tasks:**

- [ ] Crear cuenta en supabase.com
- [ ] Crear nuevo proyecto "aideas-dev"
- [ ] Instalar Supabase CLI: `npm install -g supabase`
- [ ] Init Supabase: `supabase init`
- [ ] Crear migration file en `supabase/migrations/`
- [ ] Escribir SQL schema completo:
  ```sql
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Organizations
  CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  -- Users (extends Supabase auth.users)
  CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  
  -- ... (resto de tablas según ARCHITECTURE.md)
  ```
- [ ] Aplicar migration: `supabase db push`
- [ ] Configurar RLS policies básicas:
  ```sql
  -- Example: Users can only see their organization
  CREATE POLICY "org_isolation" ON automations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );
  ```
- [ ] Crear índices:
  ```sql
  CREATE INDEX idx_automations_org ON automations(organization_id);
  CREATE INDEX idx_executions_automation ON automation_executions(automation_id);
  -- ... más índices
  ```
- [ ] Crear src/models/ (si usamos SQLAlchemy):
  - [ ] models/user.py
  - [ ] models/organization.py
  - [ ] models/automation.py
  - [ ] etc.
- [ ] Crear scripts/seed_db.py
- [ ] Probar conexión: queries básicas con Supabase client

**Dependencies:** 
- US-6.1 (proyecto base debe existir)

**Definition of Done:**
- [ ] Supabase Dashboard muestra todas las tablas
- [ ] RLS policies activas
- [ ] Script de seed inserta datos de prueba
- [ ] Queries básicas funcionan desde FastAPI
- [ ] Connection pooling configurado

---

#### ✅ US-1.1: Landing Home Page (Jinja2)

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
- [ ] Animaciones sutiles (CSS + Alpine.js opcional)

**Technical Tasks:**

- [ ] Crear route en src/routes/web/landing.py:
  ```python
  from fastapi import APIRouter, Request
  from fastapi.templating import Jinja2Templates
  
  router = APIRouter()
  templates = Jinja2Templates(directory="templates")
  
  @router.get("/")
  async def home(request: Request):
      return templates.TemplateResponse(
          "landing/home.html",
          {"request": request}
      )
  ```
- [ ] Configurar Tailwind CSS:
  - [ ] Instalar: `npm install -D tailwindcss postcss autoprefixer`
  - [ ] Init: `npx tailwindcss init`
  - [ ] Configurar tailwind.config.js
  - [ ] Crear static/css/input.css con @tailwind directives
  - [ ] Compilar: `npx tailwindcss -i static/css/input.css -o static/css/main.css`
- [ ] Crear estructura de templates:
  - [ ] templates/base.html (layout principal)
  - [ ] templates/landing/base_landing.html (extiende base)
  - [ ] templates/landing/home.html (home page)
  - [ ] templates/components/_navbar.html
  - [ ] templates/components/_footer.html
- [ ] Crear componentes HTML:
  - [ ] templates/landing/_hero.html
  - [ ] templates/landing/_features.html
  - [ ] templates/landing/_how_it_works.html
  - [ ] templates/landing/_cta.html
- [ ] Integrar todo en home.html usando {% include %}
- [ ] Agregar Lucide Icons (CDN):
  ```html
  <script src="https://unpkg.com/lucide@latest"></script>
  ```
- [ ] Agregar Alpine.js para interactividad (opcional):
  ```html
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  ```
- [ ] Verificar responsive en todos los breakpoints
- [ ] Optimizar imágenes (si se usan)

**Dependencies:** 
- US-6.1 (FastAPI + templates configurados)

**Definition of Done:**
- [ ] Página carga correctamente en http://localhost:8000/
- [ ] Todas las secciones visibles y funcionales
- [ ] Responsive verificado en mobile/tablet/desktop
- [ ] Sin errores en consola del navegador
- [ ] Tailwind CSS compilado correctamente

---

#### ✅ US-1.4: Contact Page (Jinja2 + Form)

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
- [ ] Validación server-side con Pydantic
- [ ] Validación client-side con HTML5
- [ ] Botón submit con feedback
- [ ] Mensaje de confirmación después de enviar
- [ ] Email de notificación al equipo (Resend)
- [ ] CSRF protection
- [ ] Responsive design

**Technical Tasks:**

- [ ] Instalar dependencias:
  ```
  pip install python-multipart wtforms email-validator
  ```
- [ ] Crear template templates/landing/contact.html
- [ ] Crear Pydantic schema para validación:
  ```python
  # src/schemas/contact.py
  from pydantic import BaseModel, EmailStr
  
  class ContactForm(BaseModel):
      name: str
      email: EmailStr
      company: str | None = None
      message: str
  ```
- [ ] Crear routes en src/routes/web/landing.py:
  ```python
  @router.get("/contact")
  async def contact_page(request: Request):
      return templates.TemplateResponse(
          "landing/contact.html",
          {"request": request}
      )
  
  @router.post("/contact")
  async def contact_submit(
      request: Request,
      form_data: ContactForm
  ):
      # Validate
      # Send email (Celery task)
      # Return success message
      pass
  ```
- [ ] Crear src/utils/email.py con Resend integration:
  ```python
  import resend
  from src.config.settings import settings
  
  resend.api_key = settings.RESEND_API_KEY
  
  async def send_contact_email(name, email, company, message):
      resend.Emails.send({
          "from": "aideas@yourdomain.com",
          "to": "team@aideas.com",
          "subject": f"Contact Form: {name}",
          "html": f"<p>From: {name} ({email})</p>..."
      })
  ```
- [ ] Agregar CSRF token en formulario
- [ ] Agregar validación HTML5 en inputs
- [ ] Estilizar con Tailwind
- [ ] Crear página de confirmación o modal

**Dependencies:** 
- US-6.1 (FastAPI configurado)
- Cuenta de Resend creada

**Definition of Done:**
- [ ] Formulario valida correctamente (client + server)
- [ ] Submit envía email al equipo
- [ ] Usuario ve confirmación de envío
- [ ] Funciona en mobile
- [ ] CSRF protection activo

---

### Stories Consideradas pero NO Incluidas

#### 📌 US-1.2: Pricing Page

**Razón:** Capacidad insuficiente para Sprint 1
**Considerar para:** Sprint 2

#### 📌 US-1.3: Features Page

**Razón:** Capacidad insuficiente para Sprint 1
**Considerar para:** Sprint 2

#### 📌 US-1.5: Legal Pages (Terms, Privacy)

**Razón:** Mejor hacerlo cuando landing esté más completa
**Considerar para:** Sprint 2

---

## Sprint Calendar

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SPRINT 1 - WEEK PLAN                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   DÍA 1 (Lunes)                                        ~8 hrs           │
│   ────────────                                                          │
│   □ Setup inicial del proyecto                                          │
│     • Crear repositorio Git                                             │
│     • Crear estructura de carpetas                                      │
│     • Instalar dependencias base                                        │
│   □ US-6.1: Setup FastAPI (Parte 1)                                     │
│     • FastAPI app básica                                                │
│     • Pydantic Settings                                                 │
│     • Docker Compose (Redis)                                            │
│                                                                         │
│   DÍA 2 (Martes)                                       ~8 hrs           │
│   ───────────────                                                       │
│   □ US-6.1: Completar FastAPI Setup                                     │
│     • Supabase client                                                   │
│     • Redis client                                                      │
│     • Jinja2 templates                                                  │
│     • Static files                                                      │
│     • Logging                                                           │
│     • Health check                                                      │
│   □ US-6.2: Iniciar Supabase                                            │
│     • Crear proyecto Supabase                                           │
│     • Install Supabase CLI                                              │
│     • Comenzar migration SQL                                            │
│                                                                         │
│   DÍA 3 (Miércoles)                                    ~8 hrs           │
│   ─────────────────                                                     │
│   □ US-6.2: Completar Database                                          │
│     • Completar schema SQL                                              │
│     • Aplicar migration                                                 │
│     • Configurar RLS policies                                           │
│     • Crear índices                                                     │
│     • Seed script                                                       │
│   ⭐ MID-SPRINT CHECK: Backend debe estar funcional                     │
│                                                                         │
│   DÍA 4 (Jueves)                                       ~8 hrs           │
│   ──────────────                                                        │
│   □ US-1.1: Home Page                                                   │
│     • Setup Tailwind CSS                                                │
│     • Crear templates structure                                         │
│     • Hero section                                                      │
│     • Features section                                                  │
│     • How it Works section                                              │
│                                                                         │
│   DÍA 5 (Viernes)                                      ~8 hrs           │
│   ───────────────                                                       │
│   □ US-1.1: Completar Home Page                                         │
│     • CTA section                                                       │
│     • Footer                                                            │
│     • Responsive polish                                                 │
│   □ US-1.4: Contact Page                                                │
│     • Formulario completo                                               │
│     • Integración Resend                                                │
│     • Validación                                                        │
│   □ Deploy preview (Railway staging)                                    │
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
| Primera vez con FastAPI + Jinja2 | 🟡 Medium | 🟡 Medium | Seguir docs oficiales, templates simples |
| Setup de Supabase toma más tiempo | 🟡 Medium | 🟢 Low | Buffer incluido en estimación |
| Tailwind compilation issues | 🟢 Low | 🟢 Low | Usar CDN para MVP si falla |
| Problemas con Resend/email | 🟢 Low | 🟢 Low | Dejar email para el final, MVP sin email OK |

### Blockers Anticipados

- [ ] **Cuenta de Supabase** - Crear (5 min)
- [ ] **Cuenta de Railway** - Crear (5 min)
- [ ] **Cuenta de Resend** - Crear para emails (5 min)
- [ ] **Node.js** - Instalar para Tailwind compilation (10 min)
- [ ] **Dominio aideas.com** - Verificar disponibilidad/compra

### Contingency Plan

Si el tiempo no alcanza:
1. **Prioridad 1:** Backend (US-6.1, US-6.2) - DEBE completarse
2. **Prioridad 2:** Home page básica (US-1.1) - Puede ser más simple, usar Tailwind CDN
3. **Prioridad 3:** Contact page (US-1.4) - Puede moverse a Sprint 2

---

## Technical Considerations

### Setup Necesario (Día 1, primeras horas)

**Herramientas a instalar:**
- [ ] Python 3.12
- [ ] Node.js 20 LTS (para Tailwind)
- [ ] Docker Desktop
- [ ] Supabase CLI: `npm install -g supabase`
- [ ] Git configurado

**Cuentas a crear/configurar:**
- [ ] GitHub repository
- [ ] Supabase account (supabase.com)
- [ ] Railway account (railway.app)
- [ ] Resend account (resend.com) - free tier

### Architecture Decisions (Confirmadas)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend Framework | FastAPI | Async, performance, Python AI ecosystem |
| Templates | Jinja2 | SSR, SEO-friendly, simple |
| Database | Supabase (PostgreSQL) | Managed, Auth included, cost-effective |
| Auth | Supabase Auth | Integrated with database, JWT, OAuth |
| Storage | AWS S3 | Cost-effective, reliable, scalable |
| Cache/Queue | Redis | Industry standard, fast |
| CSS Framework | Tailwind CSS | Speed, consistency, customizable |
| Deployment | Railway | Simple, affordable |

---

## Definition of Done (Sprint 1)

Una story está **Done** cuando:

- [ ] Todos los Acceptance Criteria cumplidos
- [ ] Código funcional y testeado manualmente
- [ ] Sin errores en consola o logs
- [ ] Responsive verificado (si aplica)
- [ ] Documentación básica incluida (README)
- [ ] Deployable a staging

### Sprint 1 Specific DoD:

- [ ] Backend: `uvicorn src.main:app --reload` funciona
- [ ] Backend: `/health` y `/docs` accesibles
- [ ] Backend: Supabase connection funciona
- [ ] Backend: Redis connection funciona
- [ ] Frontend: Landing page renderiza en http://localhost:8000/
- [ ] Database: Tables creadas en Supabase
- [ ] Templates: Jinja2 rendering funciona correctamente

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
| US-6.1 | Swagger UI, health check, Supabase + Redis status |
| US-6.2 | Supabase Dashboard with tables, RLS policies, seed data |
| US-1.1 | Home page completa, responsive demo |
| US-1.4 | Formulario, validación, envío de email |

### Review Questions

- ¿Se cumplió el Sprint Goal?
- ¿Qué quedó pendiente y por qué?
- ¿El velocity establecido es realista para Sprint 2?
- ¿El stack FastAPI + Jinja2 está funcionando bien?

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
| 2 | US-6.1 completo |
| 3 | Backend completo (US-6.1 + US-6.2) |
| 4 | Home page 70% |
| 5 | Todo completo + deploy |

### ⚠️ Red Flags:

- Story sin progreso por 1+ días
- Blocker no resuelto en 4 hrs
- Día 3 y backend no funciona
- Supabase connection issues

---

## Useful Commands

### Development

```bash
# Start backend
uvicorn src.main:app --reload

# Start Redis (Docker)
docker-compose up -d

# Compile Tailwind CSS
npx tailwindcss -i static/css/input.css -o static/css/main.css --watch

# Run Supabase locally (optional)
supabase start

# Apply Supabase migrations
supabase db push

# Seed database
python scripts/seed_db.py
```

### Testing

```bash
# Manual testing
curl http://localhost:8000/health

# Check Swagger docs
open http://localhost:8000/docs

# Check landing page
open http://localhost:8000/
```

---

## Sprint 2 Preview

**Candidatos para Sprint 2:**
- US-1.2: Pricing Page (S)
- US-1.3: Features Page (S)
- US-1.5: Legal Pages (S)
- US-6.3: Supabase Auth Integration (M)
- US-2.1: Sign Up (M)
- US-2.2: Sign In (S)

**Sprint 2 Goal (tentativo):**
> "Completar landing page y habilitar registro/login de usuarios con Supabase Auth"

---

## Environment Variables Checklist

Make sure .env has all these before starting:

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Redis
REDIS_URL=redis://localhost:6379

# App
SECRET_KEY=your-secret-key-min-32-chars
ENVIRONMENT=development
ALLOWED_HOSTS=localhost,127.0.0.1

# Resend (for contact form)
RESEND_API_KEY=re_...

# AWS S3 (not needed for Sprint 1)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# S3_BUCKET_NAME=
```

---

*Sprint 1 Created: February 2026*
*Updated for: FastAPI + Jinja2 + Supabase Stack*
*Status: Ready to Execute*