# Product Requirements Document (PRD)

**Product:** aideas
**Version:** 1.0
**Date:** Enero 2026
**Owner:** [Por definir]
**Status:** Planning

---

## 1. Product Vision

### Problem Statement

Las pequeñas y medianas empresas pierden dinero en tareas repetitivas, tienen mermas operativas y procesos que se han convertido en "vicios empresariales". Saben que la Inteligencia Artificial puede ayudarles, pero no saben cómo aplicarla a su negocio específico.

**Para quién:** Dueños y gerentes de PyMEs (tomadores de decisión)
**El problema es:** Pérdida de dinero y eficiencia en tareas que podrían automatizarse
**Actualmente ellos:** Usan empleados para tareas repetitivas, tienen mermas, o simplemente no resuelven el problema
**Nuestro producto:** Automatizaciones de AI accesibles, personalizadas y listas para usar sin conocimiento técnico

### Value Proposition

> "Automatizaciones de IA que cuestan una fracción de lo que pagas en tareas manuales repetitivas. Soluciones 24/7 que trabajan mientras tú descansas."

### Market Opportunity

- Momento "noble" del mercado - poco saturado
- AI es conocida pero no aplicada en PyMEs
- Pocos players enfocados en este segmento
- Oportunidad de posicionarse antes del boom

### Success Definition

| Timeframe | Clientes | Etapa |
|-----------|----------|-------|
| Meses 1-6 | 0 → 10 | Validación y product-market fit |
| Meses 6-12 | 10 → 100 | Tracción y proceso de ventas |
| Año 2 | 100 → 500 | Escala y expansión geográfica |
| Año 3+ | 500 → 1000 | Consolidación |

*Filosofía: Metas mesuradas, celebrar si se superan.*

---

## 2. User Personas

### Primary User: Tomador de Decisión

- **Role:** Dueño/Fundador o Gerente de Operaciones de PyME
- **Context:** Maneja una empresa pequeña-mediana, conoce bien su negocio
- **Goal:** Optimizar procesos y reducir pérdidas sin contratar más personal
- **Pain:** Tiene empleados en tareas repetitivas, mermas, procesos ineficientes
- **Tech Level:** Bajo a Medio - Ha usado AI (ChatGPT) pero no sabe aplicarla a su negocio
- **Behavior:** Busca soluciones prácticas, valora su tiempo, necesita ver ROI claro

### Secondary User: Operador

- **Role:** Empleado designado por el dueño
- **Context:** Monitorea operaciones día a día
- **Goal:** Asegurar que las automatizaciones funcionen correctamente
- **Tech Level:** Bajo a Medio
- **Access:** Dashboard de monitoreo, alertas, configuración básica (sin facturación)

### Secondary User: Viewer

- **Role:** Personal administrativo o gerencial
- **Context:** Necesita ver reportes y métricas
- **Goal:** Tomar decisiones informadas con datos
- **Tech Level:** Bajo
- **Access:** Solo lectura de reportes y métricas

---

## 3. Target Market

### Phase 1 - Primary Market

| Region | Language | Priority |
|--------|----------|----------|
| United States | English | Primary |
| Canada | English | Primary |

### Phase 2 - Expansion

| Region | Language | Priority |
|--------|----------|----------|
| Latin America | Spanish | Secondary |
| Brazil | Portuguese | Secondary |
| Europe | ES/PT/FR | Tertiary |

**Technical Implication:** Multi-language support (i18n) must be built from day one.

---

## 4. Business Model

### Type: Automation as a Service (AaaS)

```
┌─────────────────────────────────────────────────────────────┐
│              WHAT CUSTOMER GETS                             │
├─────────────────────────────────────────────────────────────┤
│  ✅ Access to RESULTS (working automation 24/7)             │
│  ✅ Dashboard for metrics and configuration                 │
│  ✅ Support and maintenance included                        │
│  ✅ Automatic updates                                       │
├─────────────────────────────────────────────────────────────┤
│              WHAT AIDEAS RETAINS                            │
├─────────────────────────────────────────────────────────────┤
│  🔒 Source code and proprietary logic                       │
│  🔒 Templates and adaptations                               │
│  🔒 Infrastructure and hosting                              │
└─────────────────────────────────────────────────────────────┘
```

**Philosophy:** Customer pays for VALUE/RESULTS, not for code.

### Revenue Model

| Component | Description |
|-----------|-------------|
| Setup Fee (one-time) | Implementation, customization, training |
| Monthly Fee (recurring) | Hosting, support, updates, monitoring |

### Pricing Structure (Placeholders)

> ⚠️ **NOTE:** Requires market research to define final pricing

```
┌──────────────────┬─────────────────┬─────────────────┬─────────────────┐
│                  │    STARTER      │      PRO        │    BUSINESS     │
├──────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Setup (one-time) │    $XXX         │     $XXX        │    $XXX         │
├──────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Monthly          │    $XX/mo       │    $XX/mo       │    $XX/mo       │
├──────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Automations      │    1-2          │     3-5         │    Unlimited    │
├──────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Support          │    Email        │    Chat         │    Priority     │
├──────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Executions/mo    │    X,XXX        │    XX,XXX       │    XXX,XXX      │
└──────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Pricing Philosophy

- **Principle:** Customer savings must be GREATER than service cost
- **Comparison:** Cost of employee doing repetitive tasks vs cost of aideas
- **Goal:** Be accessible, not compete on price with employee salaries
- **API Costs:** Included in service price, justified by 24/7 value delivered

---

## 5. Core User Stories

### Must Have (MVP)

#### US-001: View Automation Catalog
**As a** business owner
**I want to** browse available automations with examples
**So that** I can understand what solutions exist for my problems

**Acceptance Criteria:**
- AC1: Can view list of automation categories
- AC2: Each automation shows description, use cases, and expected benefits
- AC3: Can filter by industry or problem type
- AC4: Available in English (Spanish/Portuguese for Phase 2)

#### US-002: Request/Contract an Automation
**As a** business owner
**I want to** request an automation that fits my specific needs
**So that** I can solve my business problem

**Acceptance Criteria:**
- AC1: Can describe my situation/problem
- AC2: Receive confirmation that request was received
- AC3: Can track status of my request
- AC4: Clear communication of next steps and timeline

#### US-003: View Automation Metrics
**As a** business owner
**I want to** see how my automations are performing
**So that** I can measure ROI and value received

**Acceptance Criteria:**
- AC1: Dashboard shows active automations
- AC2: Metrics include: executions, success rate, estimated time saved
- AC3: Visual representation (charts/graphs)
- AC4: Can filter by date range

#### US-004: Manage Team Users
**As a** business owner
**I want to** add team members with different access levels
**So that** I can delegate monitoring without losing control

**Acceptance Criteria:**
- AC1: Can invite users by email
- AC2: Can assign roles: Admin, Operator, Viewer
- AC3: Can remove or change user roles
- AC4: Each role has appropriate access restrictions

#### US-005: Contact Support
**As a** customer
**I want to** easily contact support when I have issues
**So that** problems are resolved quickly

**Acceptance Criteria:**
- AC1: Support contact accessible from any screen
- AC2: Can submit support ticket with description
- AC3: Can attach screenshots or files
- AC4: Receive confirmation and ticket number

#### US-006: View Billing History
**As a** business owner
**I want to** see my payment history and upcoming charges
**So that** I can manage my budget

**Acceptance Criteria:**
- AC1: List of past invoices with amounts and dates
- AC2: Can download invoices as PDF
- AC3: View current plan and next billing date
- AC4: Clear breakdown of charges

---

### Should Have (Post-MVP / Phase 2)

| ID | User Story | Priority |
|----|------------|----------|
| US-007 | AI Chat to describe needs | High |
| US-008 | Direct integrations (Slack, WhatsApp, CRMs) | High |
| US-009 | Advanced exportable reports | Medium |
| US-010 | Public API | Medium |
| US-011 | Automation marketplace | Medium |
| US-012 | Mobile app | Low |

---

## 6. Functional Scope

### In Scope (MVP)

**Customer Portal (app.aideas.com)**
- [ ] User authentication and authorization
- [ ] Automation catalog with search/filter
- [ ] Request automation workflow
- [ ] Metrics dashboard
- [ ] Team management (roles)
- [ ] Support ticketing
- [ ] Billing and invoices
- [ ] Multi-language foundation (i18n)

**Admin Portal (admin.aideas.com)**
- [ ] Customer management
- [ ] Automation template library
- [ ] Request/ticket management
- [ ] Metrics and analytics
- [ ] Billing management

**Landing Page (aideas.com)**
- [ ] Product information
- [ ] Pricing display
- [ ] Registration/signup flow
- [ ] Contact form

### Out of Scope (MVP)

- ❌ Public API
- ❌ Mobile applications
- ❌ AI chat for needs discovery
- ❌ Marketplace for third-party automations
- ❌ Direct integrations (Slack, WhatsApp, CRMs)
- ❌ Advanced/exportable reports
- ❌ Self-service automation builder
- ❌ White-label solutions

---

## 7. System Architecture (High Level)

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1 (MVP)                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🌐 Landing Page        👤 Customer Portal                 │
│   aideas.com             app.aideas.com                     │
│   ┌─────────────┐        ┌─────────────┐                    │
│   │ Marketing   │        │ Dashboard   │                    │
│   │ Pricing     │        │ Metrics     │                    │
│   │ Signup      │        │ Support     │                    │
│   └─────────────┘        └─────────────┘                    │
│                                                             │
│   👨‍💼 Admin Portal                                           │
│   admin.aideas.com                                          │
│   ┌─────────────┐                                           │
│   │ Customers   │                                           │
│   │ Templates   │                                           │
│   │ Operations  │                                           │
│   └─────────────┘                                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    PHASE 2 (Scale)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   🔌 Public API          📱 Mobile App                      │
│   api.aideas.com         iOS / Android                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Technical Requirements (High Level)

| Requirement | Description |
|-------------|-------------|
| Multi-language | i18n from day one (EN, ES, PT) |
| Multi-tenant | Support multiple customers securely |
| Role-based access | Admin, Operator, Viewer roles |
| Responsive | Works on desktop, tablet, mobile browsers |
| Secure | Industry-standard authentication, data encryption |
| Scalable | Architecture ready to grow with customer base |

*Detailed technical specifications will be in ARCHITECTURE.md*

---

## 8. User Roles & Permissions

### Customer Portal Roles

| Permission | Admin | Operator | Viewer |
|------------|-------|----------|--------|
| View dashboard | ✅ | ✅ | ✅ |
| View metrics | ✅ | ✅ | ✅ |
| Request automations | ✅ | ❌ | ❌ |
| Configure automations | ✅ | ✅ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| View billing | ✅ | ❌ | ❌ |
| Contact support | ✅ | ✅ | ✅ |

---

## 9. Intellectual Property Protection

### Strategy

| Internal Reality | External Communication |
|-----------------|------------------------|
| "We don't give the code" | "We handle everything so you focus on your business" |
| "It's on our servers" | "Enterprise infrastructure with 99.9% uptime" |
| "They can't take it" | "Managed service with support included" |
| "They depend on us" | "Dedicated technical team without hiring staff" |

### Legal Framework

- License of use, not ownership transfer
- Customer owns their DATA, aideas owns the LOGIC
- Exit clause: Data export available, code stays with aideas

---

## 10. Risks & Mitigations

### Assumptions

- [ ] PyMEs are willing to pay for AI automation services
- [ ] The base of 150+ templates covers most common needs
- [ ] Market timing is favorable (pre-boom)
- [ ] Multi-language approach will enable geographic expansion

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Finding first 10 customers | High | Medium | Focus on network, case studies, referrals |
| Pricing too high or too low | Medium | Medium | Market research, A/B testing, customer feedback |
| Template library not meeting needs | Medium | Low | Customer feedback loop, continuous expansion |
| Technical scaling issues | Medium | Low | Cloud-native architecture, monitoring |
| Competition entering market | Medium | Medium | First-mover advantage, customer relationships |

### Opportunities

| Opportunity | Impact | Action |
|-------------|--------|--------|
| Market is "noble" (unsaturated) | High | Move fast, establish brand |
| AI awareness growing | High | Education-focused marketing |
| Remote work trend | Medium | Target distributed teams |

---

## 11. Release Plan

### Phase 1: MVP

**Objective:** Launch functional product, acquire first 10 customers

**Deliverables:**
- Landing page (aideas.com)
- Customer portal (app.aideas.com)
- Admin portal (admin.aideas.com)
- Core automation templates (top 10-20)
- English language support

**Success Criteria:**
- 10 paying customers
- Positive feedback and referrals
- Core workflows validated

### Phase 2: Scale

**Objective:** Grow to 100 customers, expand features

**Deliverables:**
- AI chat for needs discovery
- Direct integrations (Slack, WhatsApp)
- Spanish language support
- Advanced reporting
- Public API (beta)

**Success Criteria:**
- 100 paying customers
- Expansion to LATAM market
- Increased MRR

### Phase 3: Expansion

**Objective:** Establish market presence, 500+ customers

**Deliverables:**
- Portuguese language support
- Marketplace for automations
- Mobile applications
- Full API documentation

---

## 12. Success Metrics

### Business Metrics

| Metric | Description | Target (Year 1) |
|--------|-------------|-----------------|
| Customers | Active paying customers | 100 |
| MRR | Monthly Recurring Revenue | $XXX |
| Churn | Monthly customer loss rate | < 5% |
| NPS | Net Promoter Score | > 50 |

### Product Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Automation uptime | System availability | 99.5% |
| Time to deploy | From request to live | < X days |
| Support response | First response time | < 24 hours |

### Customer Success Metrics

| Metric | Description |
|--------|-------------|
| Time saved | Hours saved per customer per month |
| Cost savings | $ saved vs manual process |
| Automation usage | Executions per customer |

---

## 13. Open Questions

1. What are the top 5 "hero" automations for launch?
2. Final pricing after market research?
3. Priority integrations for Phase 2?
4. Support model: 100% remote or local presence?
5. Payment methods by region?

---

## 14. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | - | Initial PRD |

---

## Quick Reference

**This PRD feeds:**
- Product Backlog (all User Stories)
- Sprint Planning (prioritize from backlog)
- Architecture Document (technical specs)

**Review frequency:** Every 3 months or major change

---

*Generated: January 2026*
*Status: Planning*
