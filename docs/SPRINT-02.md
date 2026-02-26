# Sprint Planning - Sprint 2

**Product:** aideas
**Sprint Number:** 2
**Sprint Duration:** 1 week
**Planning Date:** February 2026
**Owner:** aideas Team

---

## Sprint Overview

### Sprint Goal

> **"Implementar el sistema completo de autenticación con Supabase Auth: registro, login, recuperación de contraseña y verificación de email"**

Con la base técnica y la landing page completas (Sprint 1), este sprint habilita el acceso de usuarios al sistema. Al finalizar tendremos:
- Integración completa con Supabase Auth (backend)
- Página de registro funcional con validación
- Página de login con JWT en cookies httpOnly
- Flujo de recuperación de contraseña
- Verificación de email funcional
- Rutas protegidas con middleware de autenticación

### Sprint Metrics

| Metric | Value |
|--------|-------|
| **Duration** | 1 week (5 working days) |
| **Available Capacity** | 40 hrs (bruto) / ~28 hrs (efectivo) |
| **Committed Stories** | 4 |
| **Story Sizes** | 2 M + 2 S |
| **Velocity Sprint 1** | 4 stories (3M + 1XS) + 3 bonus |

### Sprint 1 Retrospective Summary

**Completado en Sprint 1:**
- US-6.1: Setup FastAPI + Supabase + Redis
- US-6.2: Database Setup + Models
- US-1.1: Landing Home Page
- US-1.4: Contact Page
- US-1.2: Pricing Page (bonus)
- US-1.3: Features Page (bonus)
- US-1.5: Legal Pages (bonus)

**Landing Page = 100% completa.** Toda la Epica 1 terminada. El Sprint 2 se enfoca exclusivamente en Autenticacion (Epica 2 + US-6.3).

---

## Sprint Backlog

### Selected User Stories

---

#### US-6.3: Integracion Supabase Auth (Backend)

**Epic:** Backend Foundation
**Priority in Sprint:** 1 (hacer primero - es dependencia de todo lo demas)
**Size:** M
**Estimated Hours:** 8-10 hrs
**Owner:** Developer

**Story:**
Como desarrollador, quiero integracion completa con Supabase Auth para manejar autenticacion de usuarios de forma segura.

**Acceptance Criteria:**

- [ ] Supabase Auth configurado (email/password + Google OAuth)
- [ ] Wrapper del Supabase Python client para auth
- [ ] FastAPI dependency `get_current_user()` implementado
- [ ] JWT validation en rutas protegidas
- [ ] Session management con httpOnly cookies
- [ ] Middleware de autenticacion para rutas web
- [ ] Logout functionality (clear cookie + invalidate session)
- [ ] Permissions/roles logic basica (admin, operator, viewer)
- [ ] Paginas de error para 401/403

**Technical Tasks:**

- [ ] Crear `src/core/security.py`:
  ```python
  from fastapi import Depends, HTTPException, Request
  from fastapi.security import HTTPBearer
  from src.config.supabase import supabase

  security = HTTPBearer(auto_error=False)

  async def get_current_user(request: Request):
      """Extract JWT from cookie and validate with Supabase"""
      token = request.cookies.get("access_token")
      if not token:
          raise HTTPException(status_code=401, detail="Not authenticated")
      try:
          user = supabase.auth.get_user(token)
          return user
      except Exception:
          raise HTTPException(status_code=401, detail="Invalid token")

  async def require_role(roles: list[str]):
      """Check user has required role in organization"""
      pass
  ```
- [ ] Crear `src/core/dependencies.py`:
  ```python
  from fastapi import Depends, Request
  from src.core.security import get_current_user

  async def get_current_active_user(user=Depends(get_current_user)):
      """Verify user is active and email verified"""
      if not user.email_confirmed_at:
          raise HTTPException(status_code=403, detail="Email not verified")
      return user

  async def get_current_org(request: Request, user=Depends(get_current_active_user)):
      """Get user's current organization"""
      pass
  ```
- [ ] Crear `src/services/auth_service.py`:
  ```python
  class AuthService:
      async def sign_up(self, email, password, first_name, last_name, company):
          """Register user with Supabase Auth + create org"""
          pass

      async def sign_in(self, email, password):
          """Login and return JWT tokens"""
          pass

      async def sign_out(self, token):
          """Logout and invalidate session"""
          pass

      async def reset_password(self, email):
          """Send password reset email"""
          pass

      async def update_password(self, token, new_password):
          """Update password with reset token"""
          pass

      async def verify_email(self, token):
          """Handle email verification callback"""
          pass

      async def resend_verification(self, email):
          """Resend verification email"""
          pass
  ```
- [ ] Crear `src/routes/web/auth.py` (rutas web de autenticacion)
- [ ] Crear `src/routes/api/v1/auth.py` (API endpoints de auth)
- [ ] Crear `src/schemas/auth.py` (Pydantic schemas)
- [ ] Configurar Google OAuth en Supabase Dashboard
- [ ] Crear templates de error: `templates/errors/401.html`, `templates/errors/403.html`
- [ ] Agregar middleware de auth para rutas `/portal/*` y `/admin/*`
- [ ] Tests unitarios para auth_service
- [ ] Tests de integracion para auth endpoints

**Dependencies:** Ninguna (US-6.1 y US-6.2 ya completados)

**Definition of Done:**
- [ ] `get_current_user()` valida JWT correctamente
- [ ] Rutas `/portal/*` redirigen a login si no hay sesion
- [ ] Cookies httpOnly configuradas correctamente
- [ ] Logout limpia sesion completamente
- [ ] Tests pasando

---

#### US-2.1: Registro de Usuario

**Epic:** Autenticacion
**Priority in Sprint:** 2
**Size:** M
**Estimated Hours:** 6-8 hrs
**Owner:** Developer

**Story:**
Como visitante, quiero registrarme en aideas para acceder a la plataforma.

**Acceptance Criteria:**

- [ ] Formulario de registro con campos:
  - [ ] Nombre (required)
  - [ ] Apellido (required)
  - [ ] Email (required, validacion)
  - [ ] Password (required, 8+ chars, numeros, mayusculas)
  - [ ] Empresa/Organizacion (required)
- [ ] Validacion client-side con HTML5 + Alpine.js
- [ ] Validacion server-side con Pydantic
- [ ] Crear cuenta con Supabase Auth `sign_up()`
- [ ] Crear registro en tabla `users` y `organizations`
- [ ] Crear membership en `organization_members` (role: admin)
- [ ] Email de verificacion enviado automaticamente (Supabase)
- [ ] Redirect a pagina "Verifica tu email" despues de registro
- [ ] Mensaje de error claro si email ya existe
- [ ] Opcion de login con Google (OAuth via Supabase)
- [ ] Link a login para usuarios existentes
- [ ] Responsive design

**Technical Tasks:**

- [ ] Crear `templates/auth/signup.html`:
  ```html
  {% extends "base.html" %}
  {% block content %}
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full">
      <h1>Create your account</h1>
      <form method="POST" action="/auth/signup">
        <!-- First name -->
        <!-- Last name -->
        <!-- Email -->
        <!-- Password (with strength indicator) -->
        <!-- Company name -->
        <!-- Submit button -->
      </form>
      <div class="divider">or</div>
      <button>Continue with Google</button>
      <p>Already have an account? <a href="/auth/login">Sign in</a></p>
    </div>
  </div>
  {% endblock %}
  ```
- [ ] Crear `src/schemas/auth.py`:
  ```python
  from pydantic import BaseModel, EmailStr, field_validator

  class SignUpRequest(BaseModel):
      first_name: str
      last_name: str
      email: EmailStr
      password: str
      company: str

      @field_validator('password')
      @classmethod
      def validate_password(cls, v):
          if len(v) < 8:
              raise ValueError('Password must be at least 8 characters')
          if not any(c.isupper() for c in v):
              raise ValueError('Password must contain uppercase letter')
          if not any(c.isdigit() for c in v):
              raise ValueError('Password must contain a number')
          return v
  ```
- [ ] Implementar ruta `GET /auth/signup` (renderizar formulario)
- [ ] Implementar ruta `POST /auth/signup` (procesar registro)
- [ ] Implementar ruta `GET /auth/signup/google` (redirect a Google OAuth)
- [ ] Implementar callback `GET /auth/callback` (manejar OAuth callback)
- [ ] Implementar logica de creacion de organizacion al registrarse
- [ ] Agregar indicador visual de password strength (Alpine.js)
- [ ] Agregar mensajes de error inline en formulario
- [ ] Crear `templates/auth/verify-email.html` (pagina post-registro)
- [ ] Estilizar con Tailwind (consistente con landing)
- [ ] Tests para signup flow

**Dependencies:**
- US-6.3 (Supabase Auth backend)

**Definition of Done:**
- [ ] Registro completo funciona end-to-end
- [ ] Email de verificacion se envia
- [ ] Organizacion y membership creados automaticamente
- [ ] Validaciones funcionan (client + server)
- [ ] Responsive en mobile/tablet/desktop
- [ ] Sin errores en consola

---

#### US-2.2: Login de Usuario

**Epic:** Autenticacion
**Priority in Sprint:** 3
**Size:** S
**Estimated Hours:** 4-5 hrs
**Owner:** Developer

**Story:**
Como usuario registrado, quiero hacer login para acceder al portal.

**Acceptance Criteria:**

- [ ] Formulario con campos:
  - [ ] Email (required)
  - [ ] Password (required)
- [ ] Login con Supabase Auth `sign_in_with_password()`
- [ ] JWT access_token almacenado en httpOnly cookie
- [ ] Refresh token almacenado en httpOnly cookie
- [ ] Redirect a `/portal/dashboard` despues de login exitoso
- [ ] Mensaje de error si credenciales incorrectas
- [ ] Mensaje de error si email no verificado
- [ ] Link a "Forgot password"
- [ ] Link a "Sign up" para nuevos usuarios
- [ ] Opcion de login con Google
- [ ] Remember me checkbox (session duration)
- [ ] Responsive design

**Technical Tasks:**

- [ ] Crear `templates/auth/login.html`:
  ```html
  {% extends "base.html" %}
  {% block content %}
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full">
      <h1>Welcome back</h1>
      <!-- Error alert (if any) -->
      <form method="POST" action="/auth/login">
        <!-- Email -->
        <!-- Password -->
        <!-- Remember me checkbox -->
        <!-- Submit button -->
      </form>
      <div class="divider">or</div>
      <button>Continue with Google</button>
      <div class="flex justify-between">
        <a href="/auth/forgot-password">Forgot password?</a>
        <a href="/auth/signup">Create account</a>
      </div>
    </div>
  </div>
  {% endblock %}
  ```
- [ ] Implementar ruta `GET /auth/login` (renderizar formulario)
- [ ] Implementar ruta `POST /auth/login` (procesar login)
- [ ] Configurar cookie settings:
  ```python
  response.set_cookie(
      key="access_token",
      value=session.access_token,
      httponly=True,
      secure=True,  # Only HTTPS in production
      samesite="lax",
      max_age=3600  # 1 hour (or 30 days if remember me)
  )
  ```
- [ ] Implementar ruta `POST /auth/logout`:
  - Invalidar sesion en Supabase
  - Limpiar cookies
  - Redirect a `/auth/login`
- [ ] Agregar boton de logout en navbar (cuando usuario esta autenticado)
- [ ] Modificar `templates/components/navbar.html` para mostrar estado auth
- [ ] Tests para login/logout flow

**Dependencies:**
- US-6.3 (Supabase Auth backend)

**Definition of Done:**
- [ ] Login funciona con email/password
- [ ] JWT almacenado en cookie httpOnly
- [ ] Redirect correcto post-login
- [ ] Logout limpia sesion completamente
- [ ] Navbar muestra estado de autenticacion
- [ ] Responsive en mobile/tablet/desktop

---

#### US-2.3: Recuperacion de Contrasena

**Epic:** Autenticacion
**Priority in Sprint:** 4
**Size:** S
**Estimated Hours:** 4-5 hrs
**Owner:** Developer

**Story:**
Como usuario, quiero recuperar mi contrasena si la olvido.

**Acceptance Criteria:**

- [ ] Pagina "Forgot password" con input de email
- [ ] Validacion de email
- [ ] Envio de email con link de reset (Supabase automatico)
- [ ] Mensaje de confirmacion "Check your email" (sin revelar si email existe)
- [ ] Pagina de "Reset password" con:
  - [ ] Nuevo password (con validacion de strength)
  - [ ] Confirmar password
- [ ] Validacion de password strength (mismas reglas que signup)
- [ ] Confirmacion de password cambiado exitosamente
- [ ] Redirect a login despues de reset
- [ ] Token de reset expira correctamente (1 hora)

**Technical Tasks:**

- [ ] Crear `templates/auth/forgot-password.html`:
  ```html
  {% extends "base.html" %}
  {% block content %}
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full">
      <h1>Reset your password</h1>
      <p>Enter your email and we'll send you a reset link</p>
      <form method="POST" action="/auth/forgot-password">
        <!-- Email input -->
        <!-- Submit button -->
      </form>
      <a href="/auth/login">Back to login</a>
    </div>
  </div>
  {% endblock %}
  ```
- [ ] Crear `templates/auth/reset-password.html`:
  ```html
  {% extends "base.html" %}
  {% block content %}
  <div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full">
      <h1>Set new password</h1>
      <form method="POST" action="/auth/reset-password">
        <!-- New password (with strength indicator) -->
        <!-- Confirm password -->
        <!-- Hidden token field -->
        <!-- Submit button -->
      </form>
    </div>
  </div>
  {% endblock %}
  ```
- [ ] Crear `templates/auth/password-reset-sent.html` (confirmacion de envio)
- [ ] Crear `templates/auth/password-reset-success.html` (confirmacion de cambio)
- [ ] Implementar ruta `GET /auth/forgot-password` (renderizar form)
- [ ] Implementar ruta `POST /auth/forgot-password`:
  ```python
  async def forgot_password(request: Request, form: ForgotPasswordRequest):
      # Always show success message (security: don't reveal if email exists)
      await auth_service.reset_password(form.email)
      return templates.TemplateResponse(
          "auth/password-reset-sent.html",
          {"request": request}
      )
  ```
- [ ] Implementar ruta `GET /auth/reset-password` (pagina con token de URL)
- [ ] Implementar ruta `POST /auth/reset-password` (procesar nuevo password)
- [ ] Crear schemas Pydantic: `ForgotPasswordRequest`, `ResetPasswordRequest`
- [ ] Configurar redirect URL en Supabase para password reset
- [ ] Tests para password reset flow

**Dependencies:**
- US-6.3 (Supabase Auth backend)

**Definition of Done:**
- [ ] Flujo completo de reset funciona end-to-end
- [ ] Email de reset se envia correctamente
- [ ] Token expira despues de 1 hora
- [ ] Nuevo password cumple validaciones
- [ ] Redirect correcto a login
- [ ] Sin revelar si email existe en el sistema

---

### Stretch Goal (si hay tiempo)

#### US-2.4: Verificacion de Email

**Epic:** Autenticacion
**Priority in Sprint:** 5 (stretch)
**Size:** M
**Estimated Hours:** 4-6 hrs
**Owner:** Developer

**Story:**
Como usuario, quiero verificar mi email para activar mi cuenta completamente.

**Acceptance Criteria:**

- [ ] Email automatico enviado al registrarse (Supabase)
- [ ] Link de verificacion en email funciona
- [ ] Pagina de confirmacion al verificar exitosamente
- [ ] Usuario NO puede acceder al portal sin verificar email
- [ ] Pagina de "verificar email" con opcion de reenviar
- [ ] Rate limiting en reenvio (max 1 cada 60 segundos)

**Technical Tasks:**

- [ ] Configurar redirect URL de verificacion en Supabase
- [ ] Implementar ruta `GET /auth/verify` (callback de verificacion)
- [ ] Crear `templates/auth/email-verified.html` (confirmacion)
- [ ] Modificar `templates/auth/verify-email.html` con boton de reenviar
- [ ] Implementar ruta `POST /auth/resend-verification`
- [ ] Agregar check de email verificado en `get_current_active_user()`
- [ ] Crear pagina de "email no verificado" para usuarios que intentan acceder al portal
- [ ] Tests para verification flow

**Dependencies:**
- US-2.1 (Registro)
- US-6.3 (Supabase Auth)

**Definition of Done:**
- [ ] Verificacion completa funciona end-to-end
- [ ] Portal bloqueado para usuarios sin verificar
- [ ] Reenvio funciona con rate limiting
- [ ] Paginas de confirmacion correctas

---

### Stories Consideradas pero NO Incluidas

#### US-2.5: Invitaciones a Organizacion

**Razon:** Depende de Portal Core (US-3.1) y es mas compleja
**Considerar para:** Sprint 4-5

#### US-3.1: Dashboard Principal

**Razon:** Requiere auth completa y estable primero
**Considerar para:** Sprint 3

#### US-4.8: Profile & Settings

**Razon:** No es prioridad hasta que el portal basico funcione
**Considerar para:** Sprint 4

---

## Sprint Calendar

```
+---------------------------------------------------------------------------+
|                        SPRINT 2 - WEEK PLAN                               |
+---------------------------------------------------------------------------+
|                                                                           |
|   DIA 1 (Lunes)                                         ~8 hrs           |
|   ------------                                                            |
|   [ ] US-6.3: Supabase Auth Integration (Parte 1)                        |
|     - Crear src/core/security.py (get_current_user)                       |
|     - Crear src/core/dependencies.py                                      |
|     - Crear src/services/auth_service.py                                  |
|     - Crear src/schemas/auth.py                                           |
|     - Configurar Google OAuth en Supabase Dashboard                       |
|                                                                           |
|   DIA 2 (Martes)                                        ~8 hrs           |
|   ---------------                                                         |
|   [ ] US-6.3: Completar Auth Integration                                  |
|     - Crear src/routes/web/auth.py                                        |
|     - Crear src/routes/api/v1/auth.py                                     |
|     - Middleware de auth para /portal/* y /admin/*                         |
|     - Cookie management                                                   |
|     - Templates de error (401, 403)                                       |
|     - Tests de auth                                                       |
|                                                                           |
|   DIA 3 (Miercoles)                                     ~8 hrs           |
|   -----------------                                                       |
|   [ ] US-2.1: Registro de Usuario                                         |
|     - Template signup.html (diseno completo)                              |
|     - Formulario con validacion client + server                           |
|     - Integracion Supabase Auth sign_up()                                 |
|     - Creacion automatica de org + membership                             |
|     - Template verify-email.html                                          |
|   * MID-SPRINT CHECK: Auth backend debe estar funcional                   |
|                                                                           |
|   DIA 4 (Jueves)                                        ~8 hrs           |
|   --------------                                                          |
|   [ ] US-2.1: Completar Registro                                          |
|     - Google OAuth signup flow                                            |
|     - Password strength indicator                                         |
|     - Error handling completo                                             |
|     - Tests de signup                                                     |
|   [ ] US-2.2: Login de Usuario                                            |
|     - Template login.html                                                 |
|     - Login flow completo                                                 |
|     - Logout flow                                                         |
|     - Actualizar navbar con estado auth                                   |
|                                                                           |
|   DIA 5 (Viernes)                                       ~8 hrs           |
|   ---------------                                                         |
|   [ ] US-2.2: Completar Login                                             |
|     - Tests de login/logout                                               |
|   [ ] US-2.3: Recuperacion de Contrasena                                  |
|     - Templates forgot/reset password                                     |
|     - Flujo completo de reset                                             |
|     - Tests                                                               |
|   [ ] (Stretch) US-2.4: Verificacion de Email                             |
|   [ ] Sprint Review & Retrospective                                       |
|                                                                           |
+---------------------------------------------------------------------------+
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
| Supabase Auth API changes o issues | Low | High | Seguir docs oficiales, tener fallback manual |
| Google OAuth config compleja | Medium | Medium | Puede dejarse para Sprint 3 si complica |
| Cookie management cross-domain | Medium | Medium | Mismo dominio para MVP, subdominios despues |
| JWT expiration handling | Medium | Low | Implementar refresh token logic |
| Supabase email delivery delays | Low | Low | Verificar SMTP config, agregar boton reenviar |

### Blockers Anticipados

- [ ] **Google OAuth credentials** - Crear proyecto en Google Cloud Console (15 min)
- [ ] **Supabase Auth config** - Verificar email templates y redirect URLs
- [ ] **HTTPS en local** - Cookies secure flag requiere HTTPS (usar flag condicional)

### Contingency Plan

Si el tiempo no alcanza:
1. **Prioridad 1:** Auth backend (US-6.3) - DEBE completarse
2. **Prioridad 2:** Signup + Login (US-2.1, US-2.2) - DEBE completarse
3. **Prioridad 3:** Password reset (US-2.3) - Puede simplificarse
4. **Prioridad 4:** Email verification (US-2.4) - Puede moverse a Sprint 3
5. **Google OAuth** - Puede moverse a Sprint 3 si complica

---

## Technical Considerations

### Arquitectura de Autenticacion

```
                    BROWSER
                      |
          +-----------+-----------+
          |                       |
    Landing Pages           Protected Pages
    (/, /pricing, etc.)     (/portal/*, /admin/*)
          |                       |
          v                       v
     No auth needed         Check Cookie
                                  |
                          +-------+-------+
                          |               |
                     Has Token       No Token
                          |               |
                     Validate JWT    Redirect to
                     (Supabase)      /auth/login
                          |
                    +-----+-----+
                    |           |
                  Valid      Invalid
                    |           |
               Allow Access  Clear Cookie
                              Redirect to
                              /auth/login
```

### Cookie Strategy

```python
# Settings for cookies
COOKIE_CONFIG = {
    "key": "access_token",
    "httponly": True,
    "secure": settings.ENVIRONMENT == "production",
    "samesite": "lax",
    "max_age": 3600,         # 1 hour default
    "max_age_remember": 2592000,  # 30 days if "remember me"
    "domain": None,          # Current domain only
    "path": "/",
}
```

### Auth Templates Structure

```
templates/
├── auth/
│   ├── base_auth.html          # Auth pages base (centered card layout)
│   ├── signup.html             # Registration form
│   ├── login.html              # Login form
│   ├── forgot-password.html    # Request password reset
│   ├── reset-password.html     # Set new password
│   ├── verify-email.html       # "Check your email" page
│   ├── email-verified.html     # "Email verified!" confirmation
│   ├── password-reset-sent.html    # "Reset link sent" confirmation
│   └── password-reset-success.html # "Password changed" confirmation
├── errors/
│   ├── 401.html                # Unauthorized
│   ├── 403.html                # Forbidden
│   ├── 404.html                # Not found (ya existe placeholder)
│   └── 500.html                # Server error (ya existe placeholder)
```

### New Files to Create

```
src/
├── core/
│   ├── security.py         # JWT validation, get_current_user
│   └── dependencies.py     # FastAPI dependencies (auth, org, roles)
├── services/
│   └── auth_service.py     # Auth business logic
├── schemas/
│   └── auth.py             # SignUp, Login, Reset schemas
├── routes/
│   ├── web/
│   │   └── auth.py         # Auth web routes (GET/POST forms)
│   └── api/
│       └── v1/
│           └── auth.py     # Auth API endpoints
```

### Architecture Decisions (Sprint 2)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token Storage | httpOnly Cookie | Mas seguro que localStorage, protege contra XSS |
| Auth Flow | Server-side forms | Consistente con SSR approach, no requiere JS |
| OAuth | Supabase Social Auth | Built-in, no custom OAuth flow needed |
| Password Hashing | Supabase handles it | No need for bcrypt/argon2 manually |
| Email Verification | Supabase automatic | Built-in, configurable templates |
| Session Duration | 1hr default / 30 days remember | Balance between security and UX |

---

## Definition of Done (Sprint 2)

Una story esta **Done** cuando:

- [ ] Todos los Acceptance Criteria cumplidos
- [ ] Codigo funcional y testeado manualmente
- [ ] Tests automatizados escritos y pasando
- [ ] Sin errores en consola o logs
- [ ] Responsive verificado (mobile, tablet, desktop)
- [ ] Flujos de error manejados correctamente
- [ ] Documentacion basica incluida
- [ ] Deployable a staging

### Sprint 2 Specific DoD:

- [ ] Auth: `GET /portal/dashboard` redirige a login si no hay sesion
- [ ] Auth: Signup crea usuario + organizacion + membership
- [ ] Auth: Login establece cookie y redirige a portal
- [ ] Auth: Logout limpia sesion y redirige a login
- [ ] Auth: Password reset envia email y permite cambiar password
- [ ] Auth: Email verification funciona (stretch goal)
- [ ] Navbar: Muestra estado de autenticacion (login/signup vs profile/logout)
- [ ] Security: Cookies httpOnly, sin tokens en localStorage

---

## Progress Tracking

### Story Status Board

| Story | Status | Progress | Notes |
|-------|--------|----------|-------|
| US-6.3 | To Do | 0% | |
| US-2.1 | To Do | 0% | |
| US-2.2 | To Do | 0% | |
| US-2.3 | To Do | 0% | |
| US-2.4 | To Do (stretch) | 0% | Solo si hay tiempo |

**Status Legend:**
- To Do
- In Progress
- In Review
- Done
- Blocked

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

**Scheduled:** Dia 5 (Viernes) - Final del dia

### Demo Items

| Story | What to Demo |
|-------|--------------|
| US-6.3 | Protected route redirect, JWT validation, middleware |
| US-2.1 | Registro completo: form -> Supabase -> org created -> verify email page |
| US-2.2 | Login: form -> cookie -> redirect to portal. Logout: clear session |
| US-2.3 | Forgot password -> email -> reset form -> new password -> login |
| US-2.4 | (Stretch) Verification email -> click link -> confirmed |

### Review Questions

- Se cumplio el Sprint Goal?
- Supabase Auth funciona estable?
- La UX del flujo de auth es clara?
- El manejo de errores es suficiente?
- Los tests cubren los flujos principales?

---

## Sprint Retrospective

**Scheduled:** Despues del Review

### Template

**What went well?**
-

**What didn't go well?**
-

**What to improve?**
-

**Action items for Sprint 3:**
- [ ]

### Velocity Calculation

```
Committed: 4 stories (2M + 2S) + 1 stretch (M)
Completed: ___ stories
Velocity:  ___ (actualizar al cerrar sprint)
```

---

## Sprint 3 Preview

**Candidatos para Sprint 3:**
- US-2.4: Verificacion de Email (M) - si no se completo
- US-3.1: Dashboard Principal (M) - Portal base con sidebar
- US-3.2: Catalogo de Automatizaciones (M) - Browsing de templates
- US-3.5: Mis Automatizaciones (S) - Lista de automations del usuario

**Sprint 3 Goal (tentativo):**
> "Lanzar el portal basico del cliente con dashboard, catalogo de automatizaciones y primera version funcional del portal"

---

## Environment Variables Checklist

Variables adicionales necesarias para Sprint 2:

```bash
# (Existentes del Sprint 1)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-min-32-chars
ENVIRONMENT=development
ALLOWED_HOSTS=localhost,127.0.0.1
RESEND_API_KEY=re_...

# Nuevas para Sprint 2
SUPABASE_JWT_SECRET=your-jwt-secret          # Para validar JWT localmente (opcional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com  # Google OAuth
GOOGLE_CLIENT_SECRET=GOCSPX-...              # Google OAuth
AUTH_REDIRECT_URL=http://localhost:8000/auth/callback  # OAuth callback
PASSWORD_RESET_URL=http://localhost:8000/auth/reset-password  # Reset callback
EMAIL_VERIFY_URL=http://localhost:8000/auth/verify  # Verify callback
```

---

## Useful Commands

### Development

```bash
# Start backend
uvicorn src.main:app --reload

# Start Redis (Docker)
docker-compose up -d

# Compile Tailwind CSS (watch mode)
npx tailwindcss -i static/css/input.css -o static/css/main.css --watch

# Run tests
pytest

# Run tests with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_auth.py -v

# Format code
black src/
ruff check src/ --fix
```

### Testing Auth Manually

```bash
# Test signup
curl -X POST http://localhost:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","first_name":"Test","last_name":"User","company":"Test Co"}'

# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Test protected route (should fail without cookie)
curl http://localhost:8000/portal/dashboard -v

# Check health
curl http://localhost:8000/api/v1/health
```

### Supabase Commands

```bash
# Check Supabase status
supabase status

# View auth users
supabase auth list

# Reset auth (development only)
supabase db reset
```

---

## Commitment

**Como desarrollador, me comprometo a:**

- [x] Trabajar en las stories en orden de prioridad
- [x] Actualizar el progress tracking diariamente
- [x] Comunicar blockers inmediatamente
- [x] No agregar scope sin re-planning
- [x] Mantener DoD como estandar minimo
- [x] Hacer Sprint Review y Retrospective
- [x] Escribir tests para todos los flujos de autenticacion

---

*Sprint 2 Created: February 2026*
*Updated for: FastAPI + Jinja2 + Supabase Auth*
*Status: Ready to Execute*
