# Phase 9: My Automations - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can view and manage their full automation inventory with detailed performance data. Includes a filterable list page, individual detail pages with KPIs/charts/timeline, and lifecycle action buttons (pause/resume/cancel — UI only, no Stripe wiring).

</domain>

<decisions>
## Implementation Decisions

### List & card layout
- Grid de tarjetas, 3 columnas en desktop, 2 en tablet, 1 en mobile
- Cada tarjeta muestra: nombre, categoria, iconos pequenos de apps conectadas, badge de status, metrica mensual, precio mensual — todo visible sin clic
- Tabs horizontales para filtros: Todas (5), Activas (3), En Setup (1), Pausadas (1) — cada tab muestra conteo
- Tarjeta entera es clickeable, lleva al detalle. Sin acciones rapidas en la tarjeta
- Ordenacion: por status (activas primero, luego en setup, luego pausadas), dentro de cada grupo alfabetico
- Header de pagina: titulo "Mis Automatizaciones" + conteo total (ej: "5 automatizaciones")
- Apps conectadas como iconos pequenos (logos de Mailchimp, HubSpot, etc.)

### Detail page structure
- Ruta dedicada: /dashboard/automations/[id]
- Header: nombre + categoria + iconos de apps + badge de status + botones de accion a la derecha
- Boton de volver: flecha ← + texto "Mis Automatizaciones"
- 3 KPI cards en fila: metrica mensual (ej: 1,240 emails), horas ahorradas, cargo mensual
- Debajo: dos columnas — timeline de ejecuciones a la izquierda, bar chart semanal a la derecha
- Timeline: lista con linea vertical, puntos por ejecucion (timestamp, status exito/error, duracion). Ultimas 20 ejecuciones
- Bar chart: 4 barras (una por semana), tooltip al hover con total. Colores del tema
- Mobile: KPIs apilados, chart y timeline apilados verticalmente (una columna)

### Status & lifecycle UX
- Colores de badges: Active = verde (#22c55e), En Setup = azul (#3b82f6), Pausada = gris (#9ca3af)
- Botones de accion en el header del detalle, a la derecha del status badge
- Pausar y reanudar se ejecutan directo (sin confirmacion)
- Cancelar abre dialogo de confirmacion (accion destructiva)
- Al pausar: cambio instantaneo del badge a "Pausada", botones cambian a Resume + Cancel, toast de confirmacion
- Botones visibles segun estado: Active muestra [Pausar] + [Cancelar], Paused muestra [Reanudar] + [Cancelar], In Setup no muestra botones de lifecycle

### Empty & edge states
- Sin automatizaciones: ilustracion amigable + "Aun no tienes automatizaciones" + boton "Explorar catalogo" (lleva a la seccion de catalogo)
- Automatizacion en setup: badge azul "En Setup", metrica muestra "Configurando..." en lugar de datos, precio si visible
- Detalle de automatizacion en setup: 3 KPIs muestran "---", timeline y chart vacios con mensaje "Esta automatizacion esta siendo configurada. Te notificaremos cuando este lista."
- Filtro sin resultados: mensaje contextual especifico al filtro (ej: "No tienes automatizaciones pausadas")
- Skeleton loaders en forma de tarjeta mientras cargan datos (bloques grises con animacion pulse)

### Animations & transitions
- Nivel sutil y funcional: fade-in al cargar tarjetas, transicion suave al cambiar filtros, hover con sombra ligera
- Skeleton loaders con animacion pulse durante carga

### Internationalization (i18n)
- Ingles primario, espanol y frances como secundarios
- Todos los textos de UI con claves i18n desde el inicio
- Formato de numeros y fechas localizado segun el idioma seleccionado (1,240 en EN vs 1.240 en ES, Apr 13 vs 13 abr)
- Datos de la BD (nombres de automatizaciones) se muestran tal cual

### Accessibility
- Nivel basico bien hecho: semantica HTML correcta, aria-labels en botones, contraste WCAG AA, foco visible con teclado

### URL & routing
- Lista: /dashboard/automations
- Detalle: /dashboard/automations/[id]
- Filtro activo como query param: /dashboard/automations?status=active
- Deep links funcionales — compartir URL de filtro o detalle funciona

### Claude's Discretion
- Espaciado y tipografia exactos
- Diseno del skeleton loader
- Ilustracion del empty state
- Micro-interacciones de hover en tarjetas
- Manejo de errores de red

</decisions>

<specifics>
## Specific Ideas

- Tarjetas estilo dashboard moderno con sombras sutiles y bordes redondeados
- Timeline vertical con puntos tipo git log
- Bar chart simple con 4 barras semanales y tooltip
- Toast notification al ejecutar acciones (pausar/reanudar)
- "Configurando..." como texto placeholder para automatizaciones en setup

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-my-automations*
*Context gathered: 2026-04-13*
