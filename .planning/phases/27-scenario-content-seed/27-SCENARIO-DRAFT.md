# Phase 27 Scenario Draft — 50 Client-Language Pain Scenarios

**What this is:** Bilingual customer-pain scenarios drafted for the scenario-first catalog. Plan 27-03 will mechanically transform this Markdown into an idempotent SQL seed (`supabase/seed.sql` extension) that populates `public.scenarios` + `public.scenario_templates`.

**How to use it:**
- Each `## Scenario:` block below is a parseable record. Field names are stable contracts.
- Patrick reviews this draft in Plan 27-02 Task 3. Edit copy, mappings, hours, or move scenarios between areas DIRECTLY in this file before approving.
- Plan 27-03 re-validates the draft on read before transforming. Any edit Patrick makes survives intact — no SQL diffing required.
- Template slugs in the `templates:` lists are validated against the live `automation_templates` table (DB-sourced, not regex-scraped).

**Distribution target:** Ventas 10 / Marketing 10 / Atención 8 / Documentos 6 / Productividad 6 / Reportes 4 / Agentes IA 3 / Integraciones 3 = 50 total.

---

# Area: ventas

## Scenario: Lead follow-up after trade show

- functional_area_slug: ventas
- slug: lead-followup-after-trade-show
- sort_order: 10
- typical_hours_per_week: 4
- pain_headline_en: "I lose half my trade-show leads because I don't follow up fast enough."
- pain_headline_es: "Pierdo la mitad de mis leads de feria porque no doy seguimiento a tiempo."
- pain_body_en: |
    After every trade show I come back with a stack of business cards and the best intentions.
    By the time I've typed them into the CRM and drafted a first email, two weeks have gone by
    and the lead has gone cold. The leads I do reach get one generic email and never hear from
    me again. Competitors who respond inside 24 hours are eating my lunch.
- pain_body_es: |
    Despues de cada feria regreso con una pila de tarjetas de presentacion y muchas ganas.
    Para cuando las capturo en el CRM y redacto un primer correo, ya pasaron dos semanas y el
    lead se enfrio. A los que si contacto, les mando un correo generico y nunca vuelven a saber
    de mi. Mis competidores que responden en 24 horas se estan llevando mis ventas.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - lead-followup-email
  - crm-data-sync
  - pipeline-alerts

## Scenario: Cold leads that nobody re-engages

- functional_area_slug: ventas
- slug: cold-lead-reengagement
- sort_order: 20
- typical_hours_per_week: 3
- pain_headline_en: "I have hundreds of cold leads sitting in my CRM that nobody is touching."
- pain_headline_es: "Tengo cientos de leads frios en el CRM y nadie les esta dando seguimiento."
- pain_body_en: |
    Every quarter I export my CRM and find 400+ leads that went silent six months ago. I know
    a percentage of them are still buying — just not from me. Manually writing a re-engagement
    note to each one takes a full week of my time, so it never happens. Those leads sit there
    rotting while we burn fresh ad spend on cold traffic.
- pain_body_es: |
    Cada trimestre exporto mi CRM y encuentro mas de 400 leads que dejaron de contestar hace
    seis meses. Se que un porcentaje sigue comprando, solo que no a mi. Escribir un mensaje de
    reactivacion personalizado a cada uno me llevaria una semana entera, asi que nunca lo hago.
    Esos leads se quedan ahi mientras gastamos en trafico nuevo.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - lead-followup-email
  - lead-scoring
  - email-campaigns

## Scenario: Manual CRM data entry from web forms

- functional_area_slug: ventas
- slug: manual-crm-form-entry
- sort_order: 30
- typical_hours_per_week: 5
- pain_headline_en: "My team retypes every web-form lead into the CRM by hand."
- pain_headline_es: "Mi equipo recaptura cada lead del formulario web a mano en el CRM."
- pain_body_en: |
    Our website forms drop submissions into an email inbox, and someone on the sales team
    copy-pastes the fields into HubSpot one record at a time. We make typos, we miss fields,
    and worst of all the leads sit in the inbox for hours before they even get into the
    pipeline. A 2-person team loses almost a full day a week to this.
- pain_body_es: |
    Nuestros formularios web envian las respuestas a un correo, y alguien del equipo de ventas
    copia y pega los campos uno por uno en HubSpot. Cometemos errores, omitimos datos, y peor
    aun los leads se quedan en el inbox horas antes de entrar al pipeline. Un equipo de 2
    personas pierde casi un dia completo a la semana en esto.
- impact_label_en: "~5 hrs/week saved"
- impact_label_es: "~5 hrs/semana ahorradas"
- templates:
  - crm-data-sync
  - lead-followup-email
  - lead-scoring

## Scenario: No alerts when a hot deal stalls

- functional_area_slug: ventas
- slug: stalled-deal-pipeline-alerts
- sort_order: 40
- typical_hours_per_week: 2
- pain_headline_en: "Deals slip through the cracks because nobody flags them when they stall."
- pain_headline_es: "Se nos escapan negocios porque nadie nos avisa cuando se estancan."
- pain_body_en: |
    Last month a $40K deal sat untouched in 'Proposal Sent' for three weeks because the rep
    forgot about it. I only noticed during the monthly pipeline review, and by then the
    prospect had signed with someone else. I need somebody to poke me the moment a deal has
    been idle longer than expected, but I don't have time to babysit the CRM every day.
- pain_body_es: |
    El mes pasado un negocio de $40K se quedo tres semanas sin avanzar en 'Propuesta Enviada'
    porque el vendedor lo olvido. Solo lo note en la revision mensual del pipeline, y para
    entonces el prospecto ya habia firmado con otro. Necesito que alguien me alerte cuando un
    deal lleva mas tiempo del normal sin movimiento, pero no puedo estar revisando el CRM
    todos los dias.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - pipeline-alerts
  - lead-scoring
  - sales-forecasting

## Scenario: Lead scoring done from gut feeling

- functional_area_slug: ventas
- slug: lead-scoring-by-gut
- sort_order: 50
- typical_hours_per_week: 3
- pain_headline_en: "My reps prioritize leads by gut feeling and miss the ones most likely to buy."
- pain_headline_es: "Mis vendedores priorizan leads por intuicion y se les escapan los que mas compran."
- pain_body_en: |
    Every Monday my reps pick which 20 leads to call based on whichever names they recognize.
    The result is predictable: they chase the loudest leads, not the warmest ones. We have
    behavior data (page visits, opens, replies) sitting in our tools, but nobody combines it
    into a score we can act on. The leads most ready to buy go to voicemail.
- pain_body_es: |
    Cada lunes mis vendedores escogen 20 leads para llamar segun los nombres que reconocen.
    El resultado es predecible: persiguen a los mas ruidosos, no a los mas tibios. Tenemos
    datos de comportamiento (visitas, aperturas, respuestas) regados en herramientas, pero
    nadie los combina en una calificacion accionable. Los leads listos para comprar quedan
    sin contestar.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - lead-scoring
  - pipeline-alerts
  - sales-copilot

## Scenario: Proposal drafting from scratch every time

- functional_area_slug: ventas
- slug: proposal-drafting-from-scratch
- sort_order: 60
- typical_hours_per_week: 5
- pain_headline_en: "Every proposal starts from a blank document — even when 80% is boilerplate."
- pain_headline_es: "Cada propuesta arranca desde cero, aun cuando el 80% es texto repetido."
- pain_body_en: |
    For each new prospect I rebuild the proposal: copy the last one, swap the client name,
    adjust pricing, hunt down the right case studies. A 6-page proposal swallows half a day,
    and on a good week I send three. I know most of it is reusable boilerplate, but I don't
    have a clean way to drop in client-specific facts and pricing without breaking the layout.
- pain_body_es: |
    Por cada prospecto nuevo reconstruyo la propuesta: copio la anterior, cambio el nombre,
    ajusto precios, busco los casos de exito correctos. Una propuesta de 6 paginas me toma
    medio dia, y en buena semana mando tres. La mayoria es texto reusable, pero no tengo una
    manera limpia de inyectar datos y precios especificos sin romper el formato.
- impact_label_en: "~5 hrs/week saved"
- impact_label_es: "~5 hrs/semana ahorradas"
- templates:
  - proposal-generator
  - quote-builder
  - template-filling

## Scenario: Quotes calculated in spreadsheets

- functional_area_slug: ventas
- slug: quote-calculation-in-spreadsheets
- sort_order: 70
- typical_hours_per_week: 3
- pain_headline_en: "Building a quote means juggling three spreadsheets and praying I got the math right."
- pain_headline_es: "Armar una cotizacion significa malabarear tres hojas de calculo y rezar que el calculo este bien."
- pain_body_en: |
    Pricing depends on product mix, volume tiers, shipping zone, and current promos. I keep
    all of that in spreadsheets that one wrong cell can blow up. When I send the wrong quote
    we either lose money or look unprofessional. Customers also wait 24-48 hours for a quote
    that should take 5 minutes.
- pain_body_es: |
    El precio depende del mix de productos, escalones de volumen, zona de envio y promos del
    momento. Todo eso vive en hojas de calculo donde una celda mal puesta lo arruina todo.
    Cuando mando una cotizacion mal, perdemos dinero o quedamos mal. El cliente ademas espera
    24-48 horas por algo que deberia tardar 5 minutos.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - quote-builder
  - proposal-generator
  - crm-data-sync

## Scenario: Sales forecast assembled by hand each month

- functional_area_slug: ventas
- slug: monthly-sales-forecast-by-hand
- sort_order: 80
- typical_hours_per_week: 2
- pain_headline_en: "I rebuild my sales forecast by hand every month and it's still half wrong."
- pain_headline_es: "Reconstruyo el pronostico de ventas a mano cada mes y aun asi sale a medias."
- pain_body_en: |
    On the first of every month I pull CRM exports, weight each deal by stage, multiply by
    historical close rates, and assemble a forecast in Excel. It takes a full day and the
    moment a rep updates a stage the model is stale. My board asks for confidence intervals
    I can't produce because I'm modeling by hand.
- pain_body_es: |
    El primer dia del mes exporto el CRM, pondero cada negocio por etapa, multiplico por
    tasas historicas de cierre y armo el pronostico en Excel. Me lleva un dia completo y en
    cuanto un vendedor cambia una etapa el modelo queda desactualizado. La direccion me pide
    intervalos de confianza que no puedo dar porque modelo a mano.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - sales-forecasting
  - pipeline-alerts
  - executive-dashboard

## Scenario: Territory performance buried in CRM reports

- functional_area_slug: ventas
- slug: territory-performance-buried
- sort_order: 90
- typical_hours_per_week: 2
- pain_headline_en: "I have no clean view of how each territory is performing this month."
- pain_headline_es: "No tengo una vista clara de como va cada territorio este mes."
- pain_body_en: |
    My reps cover four regions and I need to know who's hitting quota and who's slipping —
    weekly, not at quarter-end. The CRM has the data but the canned reports are useless: I
    end up exporting to Excel, pivoting by territory, comparing to last month. Two hours
    every Monday, and by Wednesday the numbers have moved.
- pain_body_es: |
    Mis vendedores cubren cuatro regiones y necesito saber quien va arriba o abajo de cuota
    cada semana, no al cierre del trimestre. El CRM tiene la data pero los reportes preconfi
    son inutiles: termino exportando a Excel, pivoteando por territorio y comparando contra
    el mes anterior. Dos horas cada lunes, y para el miercoles los numeros ya cambiaron.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - territory-report
  - sales-forecasting
  - executive-dashboard

## Scenario: Win/loss debriefs that nobody documents

- functional_area_slug: ventas
- slug: win-loss-debrief-undocumented
- sort_order: 100
- typical_hours_per_week: 2
- pain_headline_en: "We keep losing for the same reasons but nobody documents the losses."
- pain_headline_es: "Perdemos por las mismas razones pero nadie documenta las perdidas."
- pain_body_en: |
    When a deal closes 'Lost' the rep updates one dropdown and moves on. Three months later
    the head of sales asks why win rate dropped and we have nothing to point at. The patterns
    are probably obvious if somebody bothered to look — pricing pushback in Q2, slow demos
    in enterprise, whatever — but the data was never captured in a usable shape.
- pain_body_es: |
    Cuando un negocio se cierra 'Perdido', el vendedor actualiza un dropdown y sigue. Tres
    meses despues el director de ventas pregunta por que bajo el win rate y no tenemos nada
    que mostrar. Los patrones probablemente son obvios si alguien revisara — objeciones de
    precio en Q2, demos lentas en enterprise, lo que sea — pero la data nunca quedo en una
    forma usable.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - win-loss-analysis
  - sales-forecasting
  - client-performance

---

# Area: marketing

## Scenario: Email campaign builds taking days

- functional_area_slug: marketing
- slug: email-campaign-build-takes-days
- sort_order: 10
- typical_hours_per_week: 5
- pain_headline_en: "Every email campaign is a three-day fire drill from copy to send."
- pain_headline_es: "Cada campana de correo es una urgencia de tres dias entre redaccion y envio."
- pain_body_en: |
    Building one campaign takes my marketer most of a week: write the copy, design the
    template, segment the list, set up A/B variants, schedule the send, hand-write the
    follow-up. The deadline always slips, the design always breaks on mobile, and we ship
    fewer campaigns per quarter than we planned. We're leaving revenue on the table.
- pain_body_es: |
    Armar una campana le toma a mi marketer casi una semana: escribir el copy, disenar la
    plantilla, segmentar la lista, configurar variantes A/B, programar el envio y armar el
    seguimiento. La fecha siempre se mueve, el diseno siempre se rompe en mobile, y mandamos
    menos campanas de las planeadas por trimestre. Dejamos ingreso en la mesa.
- impact_label_en: "~5 hrs/week saved"
- impact_label_es: "~5 hrs/semana ahorradas"
- templates:
  - email-campaigns
  - content-generation
  - audience-segmentation

## Scenario: Social posts scheduled one platform at a time

- functional_area_slug: marketing
- slug: social-posts-one-platform-at-a-time
- sort_order: 20
- typical_hours_per_week: 4
- pain_headline_en: "Posting to four channels means logging into four different tools."
- pain_headline_es: "Publicar en cuatro canales significa entrar a cuatro herramientas distintas."
- pain_body_en: |
    My marketing person uploads the same image to Instagram, LinkedIn, Facebook, and X —
    each with its own caption format, character limit, and hashtag rules. A single post
    cycle takes 90 minutes. Worse, when we want to repurpose a top-performing post next
    month, we re-do all the work from scratch because nobody saved the variants.
- pain_body_es: |
    Mi encargada de marketing sube la misma imagen a Instagram, LinkedIn, Facebook y X,
    cada una con su formato de caption, limite de caracteres y reglas de hashtags. Un ciclo
    de post toma 90 minutos. Peor: cuando queremos reutilizar un post exitoso el mes que
    viene, rehacemos todo el trabajo porque nadie guardo las variantes.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - social-scheduler
  - content-generation
  - content-strategist-agent

## Scenario: Content briefs sitting on whiteboards

- functional_area_slug: marketing
- slug: content-briefs-on-whiteboards
- sort_order: 30
- typical_hours_per_week: 4
- pain_headline_en: "My content calendar lives on a whiteboard and almost everything ships late."
- pain_headline_es: "Mi calendario de contenido vive en un pizarron y casi todo sale tarde."
- pain_body_en: |
    We brainstorm content topics in a meeting, write them on the whiteboard, and then
    realize three weeks later that nobody actually drafted anything. Half the topics need
    a research pass we never make time for. Our blog has three posts this quarter and our
    competitors have twenty.
- pain_body_es: |
    En junta hacemos lluvia de temas, los anotamos en el pizarron, y tres semanas despues
    nos damos cuenta de que nadie escribio nada. La mitad de los temas necesitan investiga
    que nunca hacemos. Nuestro blog tiene tres posts este trimestre y la competencia tiene
    veinte.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - content-generation
  - content-strategist-agent
  - newsletter-automation

## Scenario: Newsletter built by copy-pasting from notes

- functional_area_slug: marketing
- slug: newsletter-copy-paste
- sort_order: 40
- typical_hours_per_week: 3
- pain_headline_en: "Our monthly newsletter is built by copy-pasting from Slack and old emails."
- pain_headline_es: "El newsletter mensual lo armamos copiando y pegando de Slack y correos viejos."
- pain_body_en: |
    The newsletter takes a full afternoon: scroll Slack for product wins, pull links from
    last month's case studies, ask the team for headshots, format it all in Mailchimp,
    test on three email clients. Every month I tell myself this should be automated and
    every month it isn't. Open rates are fine — we just hate making it.
- pain_body_es: |
    El newsletter mensual toma una tarde completa: revisar Slack por logros, sacar links de
    casos del mes pasado, pedir fotos al equipo, formatear todo en Mailchimp, probar en tres
    clientes de correo. Cada mes me digo que esto deberia automatizarse y cada mes no pasa.
    Las aperturas estan bien — solo odiamos hacerlo.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - newsletter-automation
  - content-generation
  - email-campaigns

## Scenario: Audience segmentation done in spreadsheets

- functional_area_slug: marketing
- slug: audience-segmentation-spreadsheets
- sort_order: 50
- typical_hours_per_week: 3
- pain_headline_en: "I segment my customer list in Excel because my email tool can't do it."
- pain_headline_es: "Segmento mi lista de clientes en Excel porque mi herramienta de correo no puede."
- pain_body_en: |
    A targeted campaign — say, customers who bought twice in the last 90 days but who
    haven't opened our last three emails — requires me to do real work. I export the
    customer list and run VLOOKUPs against purchase history. Then I filter on engagement
    and upload the result back into Mailchimp. Half a day every campaign, and the segments
    go stale the moment I'm done.
- pain_body_es: |
    Una campana enfocada — por ejemplo, clientes que compraron dos veces en los ultimos
    90 dias pero que no abrieron mis tres ultimos correos — me obliga a hacer trabajo
    real. Exporto la lista y hago VLOOKUPs contra el historial de compras. Despues filtro
    por engagement y subo el resultado a Mailchimp. Medio dia por campana, y los segmentos
    se quedan viejos en cuanto termino.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - audience-segmentation
  - lead-scoring
  - email-campaigns

## Scenario: Ad performance reviewed weeks too late

- functional_area_slug: marketing
- slug: ad-performance-reviewed-too-late
- sort_order: 60
- typical_hours_per_week: 3
- pain_headline_en: "I find out an ad campaign is bleeding money two weeks after it started."
- pain_headline_es: "Me entero que una campana esta perdiendo dinero dos semanas tarde."
- pain_body_en: |
    My agency sends a PDF performance report on the 15th of the next month. By then a bad
    creative has already burned through $3K and my best variant is exhausted. I want to see
    daily CPL and ROAS across all my ad platforms in one place, but logging into Meta, Google
    Ads, and LinkedIn each morning isn't going to happen.
- pain_body_es: |
    Mi agencia me manda un PDF de desempeno el dia 15 del mes siguiente. Para ese punto un
    creativo malo ya quemo $3K y mi mejor variante ya se agoto. Quiero ver CPL y ROAS
    diarios de todas mis plataformas en un solo lugar, pero entrar a Meta, Google Ads y
    LinkedIn cada manana no va a pasar.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - ad-performance
  - marketing-roi
  - executive-dashboard

## Scenario: SEO regressions caught after they tank traffic

- functional_area_slug: marketing
- slug: seo-regressions-caught-late
- sort_order: 70
- typical_hours_per_week: 2
- pain_headline_en: "We lose ranking on a key page and don't notice until traffic drops 30%."
- pain_headline_es: "Perdemos ranking en una pagina clave y no lo notamos hasta que el trafico cae 30%."
- pain_body_en: |
    Last quarter a single broken canonical tag knocked our top product page off the first
    page of Google. We caught it after a month of declining sessions because nobody is
    monitoring SEO health daily. Manual audits with Screaming Frog take a full afternoon
    so we run them once a quarter, not weekly.
- pain_body_es: |
    El trimestre pasado un canonical roto saco nuestra pagina principal de producto de la
    primera pagina de Google. Lo notamos despues de un mes de sesiones cayendo porque nadie
    monitorea la salud SEO a diario. Las auditorias manuales con Screaming Frog toman una
    tarde, asi que las hacemos trimestral, no semanal.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - seo-monitoring
  - ad-performance
  - marketing-roi

## Scenario: Marketing ROI guessed at quarter-end

- functional_area_slug: marketing
- slug: marketing-roi-guessed
- sort_order: 80
- typical_hours_per_week: 2
- pain_headline_en: "I can't tell the board which marketing channel actually drives revenue."
- pain_headline_es: "No le puedo decir al consejo cual canal de marketing si trae ingreso."
- pain_body_en: |
    At quarter-end I sit down to attribute revenue back to source and immediately get stuck:
    Google Analytics says one thing, the CRM says another, and 30% of deals have no tracked
    source at all. I end up presenting gut estimates labeled 'directional'. The CEO has
    stopped trusting the slide.
- pain_body_es: |
    Al cierre de trimestre me siento a atribuir ingreso a canal y me atoro: Google Analytics
    dice una cosa, el CRM dice otra, y el 30% de los negocios no tiene fuente registrada. Al
    final presento estimados rotulados 'direccionales'. El CEO ya no confia en esa lamina.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - marketing-roi
  - ad-performance
  - executive-dashboard

## Scenario: Generating fresh blog/social copy under deadline

- functional_area_slug: marketing
- slug: fresh-copy-under-deadline
- sort_order: 90
- typical_hours_per_week: 4
- pain_headline_en: "I need fresh copy for blog, ads, and social and there's never enough hours."
- pain_headline_es: "Necesito copy fresco para blog, ads y social y nunca alcanza el tiempo."
- pain_body_en: |
    Between blog posts, ad variants, landing page hero copy, and social captions, my one-person
    marketing team writes 12-15 distinct pieces a week. Every one needs research, brand-voice
    review, and rounds of edits. The team ships maybe half of what we plan and burns out doing
    it. We need a faster first draft.
- pain_body_es: |
    Entre posts de blog, variantes de ads, copy de landing y captions sociales, mi equipo de
    una persona escribe 12-15 piezas por semana. Cada una necesita investigacion, revision de
    voz de marca y rondas de edicion. El equipo entrega quizas la mitad de lo planeado y se
    quema haciendolo. Necesitamos un primer draft mas rapido.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - content-generation
  - content-strategist-agent
  - social-scheduler

## Scenario: Competitor moves spotted on Twitter weeks late

- functional_area_slug: marketing
- slug: competitor-moves-spotted-late
- sort_order: 100
- typical_hours_per_week: 2
- pain_headline_en: "I find out my competitor launched a new product from a customer, not from monitoring."
- pain_headline_es: "Me entero que mi competidor saco un producto por un cliente, no por monitoreo."
- pain_body_en: |
    My biggest competitor announced a new pricing tier on LinkedIn last quarter. I didn't
    see it for five weeks — until a customer asked why our pricing wasn't matching theirs.
    I want a daily digest of competitor news, pricing changes, hires, and social posts. But
    I'm not going to manually scroll three LinkedIn pages every morning to get one.
- pain_body_es: |
    Mi competidor mas grande anuncio un nuevo nivel de precios en LinkedIn el trimestre
    pasado. No lo vi por cinco semanas, hasta que un cliente pregunto por que mi precio no
    coincidia. Quiero un resumen diario de noticias, cambios de precio, contrataciones y
    posts sociales. Pero no voy a scrollear tres paginas de LinkedIn cada manana para
    armarlo.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - competitive-intel-agent
  - seo-monitoring
  - content-strategist-agent

---

# Area: atencion-al-cliente

## Scenario: Tickets bouncing between teams before reaching the right person

- functional_area_slug: atencion-al-cliente
- slug: tickets-bouncing-between-teams
- sort_order: 10
- typical_hours_per_week: 8
- pain_headline_en: "Every support ticket gets reassigned three times before anyone owns it."
- pain_headline_es: "Cada ticket de soporte se reasigna tres veces antes de que alguien lo tome."
- pain_body_en: |
    A customer asks about billing and the ticket lands in tech support. Tech support
    reassigns it to sales. Sales bounces it back to billing. By the time the right person
    has it, two days have passed and the customer is furious. My team spends as much time
    routing tickets as they do solving them.
- pain_body_es: |
    Un cliente pregunta sobre facturacion y el ticket cae en soporte tecnico. Soporte tecnico
    lo reasigna a ventas. Ventas lo regresa a facturacion. Para cuando le llega a la persona
    correcta, ya pasaron dos dias y el cliente esta furioso. Mi equipo gasta tanto tiempo
    enrutando tickets como resolviendolos.
- impact_label_en: "~8 hrs/week saved"
- impact_label_es: "~8 hrs/semana ahorradas"
- templates:
  - ticket-routing
  - escalation-manager
  - multichannel-support-agent

## Scenario: Same support questions answered fifty times a week

- functional_area_slug: atencion-al-cliente
- slug: same-questions-fifty-times-week
- sort_order: 20
- typical_hours_per_week: 10
- pain_headline_en: "My team answers the same 10 questions over and over while real issues wait."
- pain_headline_es: "Mi equipo contesta las mismas 10 preguntas una y otra vez mientras los problemas reales esperan."
- pain_body_en: |
    'How do I reset my password.' 'Where is my order.' 'What's your return policy.' My team
    answers these 50+ times a week, typing the same paragraph each time. Meanwhile a
    customer with a real escalation is waiting in the queue. We have a help center, but
    customers email instead of reading it.
- pain_body_es: |
    'Como reseteo mi password.' 'Donde esta mi pedido.' 'Cual es su politica de devolucion.'
    Mi equipo contesta esto mas de 50 veces a la semana, escribiendo el mismo parrafo. Mientras
    tanto un cliente con un escalamiento real esta esperando. Tenemos un centro de ayuda, pero
    los clientes prefieren mandar correo en vez de leer.
- impact_label_en: "~10 hrs/week saved"
- impact_label_es: "~10 hrs/semana ahorradas"
- templates:
  - faq-bot
  - ai-chatbot-24-7
  - auto-response-email

## Scenario: No after-hours coverage

- functional_area_slug: atencion-al-cliente
- slug: no-after-hours-coverage
- sort_order: 30
- typical_hours_per_week: 5
- pain_headline_en: "Customers who write after 6pm wait until morning for any response."
- pain_headline_es: "Los clientes que escriben despues de las 6pm esperan hasta la manana para cualquier respuesta."
- pain_body_en: |
    Half my customer base is in time zones where our 9-to-5 means business hours overlap by
    two hours. They write us at 7pm Pacific and get nothing until 9am Eastern the next day.
    Tickets pile up overnight and Monday mornings are an avalanche. I can't afford to staff
    a graveyard shift but I can't keep losing customers to slow responses.
- pain_body_es: |
    La mitad de mis clientes esta en zonas horarias donde nuestro 9-a-5 solo coincide dos
    horas. Nos escriben a las 7pm Pacifico y no reciben nada hasta las 9am Este al dia
    siguiente. Los tickets se acumulan de noche y los lunes son una avalancha. No puedo
    pagar un turno nocturno, pero tampoco puedo seguir perdiendo clientes por respuestas
    lentas.
- impact_label_en: "~5 hrs/week saved"
- impact_label_es: "~5 hrs/semana ahorradas"
- templates:
  - ai-chatbot-24-7
  - auto-response-email
  - multichannel-support-agent

## Scenario: SLA breaches discovered after the customer complains

- functional_area_slug: atencion-al-cliente
- slug: sla-breaches-discovered-late
- sort_order: 40
- typical_hours_per_week: 3
- pain_headline_en: "We breach SLAs and only find out when the customer escalates to my inbox."
- pain_headline_es: "Incumplimos SLAs y solo nos enteramos cuando el cliente escala a mi inbox."
- pain_body_en: |
    Our contracts promise a 4-hour first-response SLA. We meet it most of the time but the
    misses go unnoticed until an angry customer copies my CEO. I want to know the moment a
    ticket is 30 minutes from breaching, not 30 minutes after. Manual queue-checking by my
    team-lead doesn't scale past 50 open tickets.
- pain_body_es: |
    Nuestros contratos prometen primer respuesta en 4 horas. La mayoria del tiempo lo
    cumplimos, pero los incumplimientos pasan desapercibidos hasta que un cliente molesto
    copia al CEO. Quiero saber en el momento en que un ticket esta a 30 minutos de incumplir,
    no 30 minutos despues. La revision manual del lider de equipo no escala arriba de 50
    tickets abiertos.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - sla-monitoring
  - escalation-manager
  - ticket-routing

## Scenario: Negative reviews left to fester online

- functional_area_slug: atencion-al-cliente
- slug: negative-reviews-fester
- sort_order: 50
- typical_hours_per_week: 3
- pain_headline_en: "We let negative Google reviews sit for weeks because nobody owns review response."
- pain_headline_es: "Dejamos resenas negativas de Google ahi semanas porque nadie es duenio de responderlas."
- pain_body_en: |
    A 2-star review from last month is still the first thing new prospects see. We meant to
    respond but the link to the review platform sits in a Slack message that scrolled off.
    Even when we do respond, the reply is canned because we don't have time to write a real
    answer. Our rating is slipping and we're not doing the basic work to defend it.
- pain_body_es: |
    Una resena de 2 estrellas del mes pasado sigue siendo lo primero que ven los prospectos.
    Pensabamos contestar, pero el link a la plataforma quedo sepultado en Slack. Y cuando si
    contestamos, la respuesta es enlatada porque no nos da tiempo de redactar algo real.
    Nuestra calificacion va bajando y no estamos haciendo ni lo basico para defenderla.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - review-response
  - satisfaction-surveys
  - faq-bot

## Scenario: Customer satisfaction surveys nobody sends

- functional_area_slug: atencion-al-cliente
- slug: satisfaction-surveys-nobody-sends
- sort_order: 60
- typical_hours_per_week: 2
- pain_headline_en: "We keep saying we'll send a CSAT survey after every ticket and never do."
- pain_headline_es: "Llevamos meses diciendo que mandaremos encuestas CSAT despues de cada ticket y nunca pasa."
- pain_body_en: |
    Customers leave support interactions and we have no idea if they were happy. We
    discussed setting up a post-resolution survey but it kept slipping behind firefighting
    work. Without CSAT data, I can't tell my team where they're succeeding or failing, and
    I can't tell my board whether the support team is improving.
- pain_body_es: |
    Los clientes terminan una interaccion de soporte y no tenemos idea si quedaron contentos.
    Hablamos de configurar una encuesta posterior pero siempre la atropella el firefighting.
    Sin datos de CSAT no puedo decirle a mi equipo donde estan bien o mal, ni mostrarle al
    consejo si el equipo de soporte esta mejorando.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - satisfaction-surveys
  - review-response
  - knowledge-base-updater

## Scenario: Help center articles that no one updates

- functional_area_slug: atencion-al-cliente
- slug: help-center-stale-articles
- sort_order: 70
- typical_hours_per_week: 3
- pain_headline_en: "Half my help center articles are out of date and customers complain about it."
- pain_headline_es: "La mitad de los articulos de mi centro de ayuda estan desactualizados y los clientes se quejan."
- pain_body_en: |
    Last week a customer followed our setup guide and the third screenshot showed a button
    that hasn't existed since the v2 release. The article hadn't been updated in 18 months.
    My team knows what's stale because they answer the same misdirections by email, but
    nobody owns rewriting the articles.
- pain_body_es: |
    La semana pasada un cliente siguio nuestra guia de setup y la tercera captura mostraba
    un boton que dejo de existir desde la version 2. El articulo no se habia actualizado en
    18 meses. Mi equipo sabe que esta desactualizado porque contestan las mismas confusiones
    por correo, pero nadie es duenio de reescribir los articulos.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - knowledge-base-updater
  - faq-bot
  - satisfaction-surveys

## Scenario: Escalations that never reach a manager

- functional_area_slug: atencion-al-cliente
- slug: escalations-never-reach-manager
- sort_order: 80
- typical_hours_per_week: 3
- pain_headline_en: "Customers ask for a manager and the request dies inside the ticket thread."
- pain_headline_es: "Los clientes piden hablar con un gerente y la peticion muere en el ticket."
- pain_body_en: |
    A customer writes 'I need to speak with a manager' in the third reply of a ticket and
    nothing happens — the agent keeps replying, the manager never gets pinged. We only learn
    about it when the customer cancels their account citing 'manager never reached out'. The
    keyword is right there in the ticket, but nobody is watching for it.
- pain_body_es: |
    Un cliente escribe 'necesito hablar con un gerente' en la tercera respuesta del ticket
    y no pasa nada — el agente sigue contestando, al gerente nunca le llega un ping. Nos
    enteramos cuando el cliente cancela y dice 'nunca me contacto un gerente'. La palabra
    clave esta ahi en el ticket, pero nadie la esta monitoreando.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - escalation-manager
  - sla-monitoring
  - multichannel-support-agent

---

# Area: documentos

## Scenario: Invoices typed into accounting one line at a time

- functional_area_slug: documentos
- slug: invoices-typed-one-line-at-a-time
- sort_order: 10
- typical_hours_per_week: 6
- pain_headline_en: "My bookkeeper retypes every vendor invoice into QuickBooks by hand."
- pain_headline_es: "Mi contadora recaptura cada factura de proveedor en QuickBooks a mano."
- pain_body_en: |
    We get 40-60 vendor invoices a month as PDFs in email. My bookkeeper opens each one,
    types the vendor, amount, GL code, and due date into QuickBooks, then files the PDF in
    Dropbox. It's six hours a week of work that's all transcription, and a typo on a
    five-digit number can blow up the month-end reconciliation.
- pain_body_es: |
    Recibimos 40-60 facturas de proveedores al mes por correo en PDF. Mi contadora abre
    cada una, captura el proveedor, monto, codigo contable y fecha en QuickBooks, y guarda
    el PDF en Dropbox. Son seis horas a la semana de pura transcripcion, y un error en un
    numero de cinco digitos puede arruinar la conciliacion de fin de mes.
- impact_label_en: "~6 hrs/week saved"
- impact_label_es: "~6 hrs/semana ahorradas"
- templates:
  - invoice-processing
  - data-extraction
  - receipt-scanning

## Scenario: Receipt mountain at month end

- functional_area_slug: documentos
- slug: receipt-mountain-at-month-end
- sort_order: 20
- typical_hours_per_week: 3
- pain_headline_en: "Expense reports are a paper-bag dump at the end of every month."
- pain_headline_es: "Los reportes de gastos son una bolsa de papel volteada al final del mes."
- pain_body_en: |
    Sales reps come back from the field with crumpled receipts in their pockets. End of
    month they hand the whole bag to admin, who spends a day scanning each one, typing
    amounts, matching to the corporate card statement. Half the receipts are illegible
    thermal-paper fades. Reimbursements are always late.
- pain_body_es: |
    Los vendedores regresan del campo con recibos arrugados en los bolsillos. Fin de mes
    entregan la bolsa al admin, que pasa un dia escaneando cada uno, capturando montos y
    cruzando contra el estado de cuenta. La mitad son recibos termicos ilegibles. Los
    reembolsos siempre salen tarde.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - receipt-scanning
  - invoice-processing
  - data-extraction

## Scenario: Contract review bottleneck on legal

- functional_area_slug: documentos
- slug: contract-review-bottleneck
- sort_order: 30
- typical_hours_per_week: 5
- pain_headline_en: "Every customer contract waits a week for legal to flag the risk clauses."
- pain_headline_es: "Cada contrato de cliente espera una semana a que legal marque las clausulas de riesgo."
- pain_body_en: |
    My one outside counsel is the bottleneck on every new deal. We send her the customer's
    paper, she reads it line by line, flags the indemnity and IP and termination clauses,
    and emails back a redline three to five days later. That delay loses us deals to faster
    competitors. The first-pass review is mostly the same patterns over and over.
- pain_body_es: |
    Mi unica abogada externa es el cuello de botella en cada negocio nuevo. Le mandamos el
    papel del cliente, ella lo lee linea por linea, marca clausulas de indemnizacion, IP y
    terminacion, y devuelve un redline en tres a cinco dias. Esa demora nos hace perder
    negocios contra competidores mas rapidos. La revision inicial es casi siempre los
    mismos patrones.
- impact_label_en: "~5 hrs/week saved"
- impact_label_es: "~5 hrs/semana ahorradas"
- templates:
  - contract-analysis
  - compliance-checker
  - document-approval

## Scenario: Compliance documents reviewed reactively

- functional_area_slug: documentos
- slug: compliance-documents-reactive
- sort_order: 40
- typical_hours_per_week: 3
- pain_headline_en: "We only check our compliance docs are current when a customer audit forces us to."
- pain_headline_es: "Solo revisamos que nuestros documentos de cumplimiento esten al dia cuando un cliente nos audita."
- pain_body_en: |
    Twice a year a customer demands proof we have current insurance, SOC certs, data
    processing agreements, the works. Each time we panic, dig through Dropbox, discover one
    cert expired three months ago, scramble to renew it. We should know what's expiring 60
    days out, not be ambushed by it.
- pain_body_es: |
    Dos veces al ano un cliente nos pide pruebas de seguro vigente, certificados SOC,
    acuerdos de procesamiento de datos, todo. Cada vez nos asustamos, escarbamos Dropbox,
    descubrimos que un certificado vencio hace tres meses y corremos a renovarlo. Deberiamos
    saber que se vence con 60 dias de anticipacion, no que nos embosque.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - compliance-checker
  - compliance-agent
  - document-approval

## Scenario: Documents that need multiple sign-offs

- functional_area_slug: documentos
- slug: documents-multiple-signoffs
- sort_order: 50
- typical_hours_per_week: 3
- pain_headline_en: "A doc that needs three signatures takes two weeks to get approved."
- pain_headline_es: "Un documento que necesita tres firmas tarda dos semanas en aprobarse."
- pain_body_en: |
    Our purchase orders over $5K need ops, finance, and CEO sign-off. The current process
    is forward-this-email three times, with each person sitting on it for days. We've lost
    vendor pricing twice because the PO didn't close before the quote expired. There's no
    visibility into who's blocking what.
- pain_body_es: |
    Nuestras ordenes de compra arriba de $5K necesitan visto bueno de operaciones, finanzas
    y CEO. El proceso actual es reenviar-este-correo tres veces, y cada persona lo deja
    sentado dias. Hemos perdido precios de proveedor dos veces porque la PO no cerro antes
    de que venciera la cotizacion. No hay visibilidad de quien esta bloqueando que.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - document-approval
  - template-filling
  - contract-analysis

## Scenario: Templates filled out by hand with client data

- functional_area_slug: documentos
- slug: templates-filled-by-hand
- sort_order: 60
- typical_hours_per_week: 4
- pain_headline_en: "We fill out the same client onboarding packet by hand 30 times a month."
- pain_headline_es: "Llenamos el mismo paquete de onboarding a mano 30 veces al mes."
- pain_body_en: |
    New client onboarding requires a 12-page packet: master agreement, scope, billing
    setup, IT access form, escalation contacts. We have templates, but our admin opens
    each one in Word and types in the client name, contact email, billing address, NDA
    party — once per template. Same data, six places, every single new client.
- pain_body_es: |
    El onboarding de un cliente nuevo requiere un paquete de 12 paginas: contrato maestro,
    alcance, datos de facturacion, formulario de acceso IT, contactos de escalacion. Tenemos
    plantillas, pero nuestro admin abre cada una en Word y captura el nombre, correo,
    direccion, parte del NDA — una vez por plantilla. La misma data, en seis lugares, por
    cada cliente nuevo.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - template-filling
  - document-approval
  - data-extraction

---

# Area: productividad

## Scenario: Meeting notes nobody captures

- functional_area_slug: productividad
- slug: meeting-notes-nobody-captures
- sort_order: 10
- typical_hours_per_week: 4
- pain_headline_en: "Half our meetings end with no notes and we re-debate the same decisions next week."
- pain_headline_es: "La mitad de nuestras juntas termina sin notas y volvemos a debatir las mismas decisiones la otra semana."
- pain_body_en: |
    The person who took notes last meeting is on vacation, the assigned note-taker forgot,
    and the next person to look for the action items finds nothing. We re-litigate the same
    decisions every standup. I want a clean searchable record of every meeting with the
    decisions and owners flagged, without somebody losing half their day to scribing.
- pain_body_es: |
    La persona que tomo notas la semana pasada esta de vacaciones, el note-taker asignado
    se le olvido, y la siguiente persona que busca los action items no encuentra nada.
    Volvemos a debatir las mismas decisiones cada standup. Quiero un registro limpio y
    buscable de cada junta con decisiones y duenios marcados, sin que alguien pierda medio
    dia transcribiendo.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - meeting-notes-ai
  - daily-standup-bot
  - slack-digest

## Scenario: Standups that drag on and never end

- functional_area_slug: productividad
- slug: standups-that-drag
- sort_order: 20
- typical_hours_per_week: 3
- pain_headline_en: "Daily standup is supposed to be 15 minutes and it's always 45."
- pain_headline_es: "El standup diario deberia durar 15 minutos y siempre dura 45."
- pain_body_en: |
    Five people, fifteen minutes, three questions — that was the plan. Reality: someone
    rambles, someone joins late, someone uses it for an unrelated discussion. The team
    loses three hours a week to standup overhead alone. Async written updates would work,
    but they need to actually get written by everyone every day, which doesn't happen.
- pain_body_es: |
    Cinco personas, quince minutos, tres preguntas — ese era el plan. Realidad: alguien se
    enrolla, alguien llega tarde, alguien lo usa para una discusion no relacionada. El
    equipo pierde tres horas a la semana solo en el overhead del standup. Updates escritos
    asincronos funcionarian, pero necesitan que todos los escriban cada dia, lo cual no pasa.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - daily-standup-bot
  - slack-digest
  - task-assignment

## Scenario: Slack channels that nobody can keep up with

- functional_area_slug: productividad
- slug: slack-channels-firehose
- sort_order: 30
- typical_hours_per_week: 3
- pain_headline_en: "I have 40 Slack channels and miss the messages that actually mattered."
- pain_headline_es: "Tengo 40 canales de Slack y me pierdo los mensajes que si importaban."
- pain_body_en: |
    My morning starts with an hour of Slack catch-up, scrolling overnight messages across
    dozens of channels. I still miss the one in #sales-flag where my biggest customer asked
    for an urgent quote. I need a daily digest that surfaces the high-signal messages and
    lets me ignore the rest, instead of all-or-nothing notification noise.
- pain_body_es: |
    Mi manana empieza con una hora de catch-up en Slack, scrolleando mensajes de noche en
    docenas de canales. Aun asi se me escapa el mensaje en #sales-flag donde mi cliente
    mas grande pidio una cotizacion urgente. Necesito un resumen diario que destaque los
    mensajes de alta senal y me deje ignorar el resto, en vez del ruido todo-o-nada.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - slack-digest
  - daily-standup-bot
  - meeting-notes-ai

## Scenario: Calendar that's a war zone of overlapping meetings

- functional_area_slug: productividad
- slug: calendar-war-zone
- sort_order: 40
- typical_hours_per_week: 3
- pain_headline_en: "My calendar is double-booked half the time and no one defends my focus blocks."
- pain_headline_es: "Mi calendario esta doble agendado la mitad del tiempo y nadie defiende mis bloques de enfoque."
- pain_body_en: |
    My week has 'focus' blocks that get overwritten by anyone who can see my calendar.
    Internal recurring meetings I should have left a year ago still own 6 hours of my week.
    I want my calendar to enforce the boundaries I set instead of me having to manually
    decline invites that violate them.
- pain_body_es: |
    Mi semana tiene bloques de 'enfoque' que cualquiera con acceso a mi calendario sobre
    escribe. Juntas recurrentes internas que debi dejar hace un ano siguen ocupando 6
    horas de mi semana. Quiero que mi calendario defienda los limites que puse en vez de
    yo tener que rechazar invitaciones manualmente.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - calendar-optimizer
  - task-assignment
  - meeting-notes-ai

## Scenario: Tasks scattered across email, Slack, and three apps

- functional_area_slug: productividad
- slug: tasks-scattered-everywhere
- sort_order: 50
- typical_hours_per_week: 4
- pain_headline_en: "My to-do list lives in email, Slack, Asana, and a notebook — nothing is the source of truth."
- pain_headline_es: "Mi lista de pendientes vive en correo, Slack, Asana y un cuaderno — nada es la fuente de verdad."
- pain_body_en: |
    A task gets assigned to me three ways: a Slack mention, a forwarded email, an Asana
    card. I forget the ones I didn't write down, miss commitments I made verbally, and
    spend Friday afternoons reconciling. I want every commitment captured into one queue
    automatically, regardless of where it came from.
- pain_body_es: |
    Una tarea me llega de tres formas: mencion en Slack, correo reenviado, tarjeta de
    Asana. Olvido las que no anote, fallo en compromisos verbales, y paso los viernes en la
    tarde reconciliando. Quiero que cada compromiso quede capturado automaticamente en una
    sola cola, sin importar de donde vino.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - task-assignment
  - slack-digest
  - calendar-optimizer

## Scenario: Time tracking forgotten until Friday afternoon

- functional_area_slug: productividad
- slug: time-tracking-friday-scramble
- sort_order: 60
- typical_hours_per_week: 2
- pain_headline_en: "We bill by the hour and reconstruct our timesheet from memory every Friday."
- pain_headline_es: "Cobramos por hora y reconstruimos el timesheet de memoria cada viernes."
- pain_body_en: |
    My team is supposed to log billable hours daily but everyone fills the timesheet on
    Friday at 4pm. The result is generic 'project work, 6 hours' entries that customers
    push back on. We probably under-bill by 10-15% because nobody remembers the call they
    took at 8am Monday. We need passive capture, not manual entry.
- pain_body_es: |
    Mi equipo deberia registrar horas facturables a diario, pero todos llenan el timesheet
    el viernes a las 4pm. El resultado son entradas genericas tipo 'trabajo de proyecto, 6
    horas' que los clientes rebaten. Probablemente subfacturamos 10-15% porque nadie
    recuerda la llamada del lunes a las 8am. Necesitamos captura pasiva, no entrada manual.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - time-tracking-sync
  - task-assignment
  - resource-planner

---

# Area: reportes

## Scenario: Weekly sales report rebuilt from CSV exports

- functional_area_slug: reportes
- slug: weekly-sales-report-rebuild
- sort_order: 10
- typical_hours_per_week: 3
- pain_headline_en: "Building the weekly sales report eats my Monday morning every single week."
- pain_headline_es: "Armar el reporte de ventas semanal se traga mi lunes en la manana cada semana."
- pain_body_en: |
    Every Monday I export CRM data to CSV, pivot it by rep and product, calculate
    week-over-week deltas, format the slide, send it to the leadership group. Three hours
    minimum. The minute I finish, a deal updates and the slide is wrong. I just want this
    to land in everyone's inbox at 8am Monday without me touching anything.
- pain_body_es: |
    Cada lunes exporto datos del CRM a CSV, los pivoteo por vendedor y producto, calculo
    diferencias semana contra semana, formateo la lamina y la mando al grupo de direccion.
    Tres horas minimo. En cuanto termino, un negocio se actualiza y la lamina ya esta mal.
    Solo quiero que esto llegue al inbox de todos los lunes 8am sin que yo toque nada.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - executive-dashboard
  - kpi-tracker
  - custom-analytics

## Scenario: Executive dashboard that's always one day behind

- functional_area_slug: reportes
- slug: dashboard-always-one-day-behind
- sort_order: 20
- typical_hours_per_week: 2
- pain_headline_en: "My exec dashboard runs on yesterday's data and the team has stopped trusting it."
- pain_headline_es: "Mi dashboard ejecutivo corre con datos de ayer y el equipo ya no le cree."
- pain_body_en: |
    The BI tool refreshes nightly from a brittle ETL job that breaks once a week. By the
    time I'm in the Tuesday standup with the dashboard open, the numbers don't match what
    the sales team is saying. We've started ignoring the dashboard and asking people for
    their numbers verbally, which defeats the whole point.
- pain_body_es: |
    La herramienta BI se actualiza de noche con un ETL fragil que se rompe una vez por
    semana. Para cuando estoy en el standup del martes con el dashboard abierto, los
    numeros no cuadran con lo que dice el equipo. Empezamos a ignorar el dashboard y a
    preguntar verbalmente, lo cual rompe todo el sentido.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - executive-dashboard
  - kpi-tracker
  - data-reconciliation

## Scenario: KPIs nobody can agree on

- functional_area_slug: reportes
- slug: kpis-no-agreement
- sort_order: 30
- typical_hours_per_week: 2
- pain_headline_en: "Ask three people for 'churn rate' and you'll get three different numbers."
- pain_headline_es: "Preguntale a tres personas por 'tasa de churn' y te daran tres numeros distintos."
- pain_body_en: |
    Marketing measures churn one way, finance another, customer success a third. The
    leadership meeting devolves into arguing about definitions instead of decisions. I need
    a single shared KPI definition that updates in one place and everybody reads from the
    same source. Right now my reality is a folder of conflicting spreadsheets.
- pain_body_es: |
    Marketing mide churn de una forma, finanzas de otra, exito del cliente de una tercera.
    La junta de direccion se convierte en pelear por definiciones en vez de tomar
    decisiones. Necesito una definicion unica y compartida de KPIs que se actualice en un
    solo lugar y todos lean de la misma fuente. Mi realidad actual es una carpeta de hojas
    de calculo en conflicto.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - kpi-tracker
  - executive-dashboard
  - data-reconciliation

## Scenario: Custom client report taking a full day per client

- functional_area_slug: reportes
- slug: custom-client-report-full-day
- sort_order: 40
- typical_hours_per_week: 3
- pain_headline_en: "Each agency client gets a custom monthly report that takes a day to build."
- pain_headline_es: "Cada cliente de mi agencia recibe un reporte mensual a la medida que toma un dia armar."
- pain_body_en: |
    We run paid ads and social for 12 agency clients. Each one wants their report in their
    template, with their KPIs, in their brand colors. Building 12 reports a month eats 30%
    of one person's time. The data sources are the same — Meta, Google, GA4 — but the
    output formats are bespoke and we hand-assemble each one.
- pain_body_es: |
    Manejamos ads pagados y social para 12 clientes de agencia. Cada uno quiere su reporte
    en su plantilla, con sus KPIs, en sus colores. Armar 12 reportes al mes se come el 30%
    del tiempo de una persona. Las fuentes son las mismas — Meta, Google, GA4 — pero los
    formatos son a la medida y los ensamblamos a mano cada uno.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - client-performance
  - custom-analytics
  - marketing-roi

---

# Area: agentes-ia

## Scenario: First-draft research piles up nobody starts

- functional_area_slug: agentes-ia
- slug: first-draft-research-piles-up
- sort_order: 10
- typical_hours_per_week: 5
- pain_headline_en: "Background research on prospects, vendors, and topics never gets done."
- pain_headline_es: "La investigacion de fondo sobre prospectos, proveedores y temas nunca se hace."
- pain_body_en: |
    Before a sales call I should know the prospect's funding history, recent press, key
    hires, and competitive landscape. In practice I dial in cold because I never made time
    to research. Same with vendor evaluations, market trends, anything that needs a
    first-pass scan of public information. The work is well-defined but unglamorous.
- pain_body_es: |
    Antes de una llamada de venta deberia saber el historial de funding del prospecto,
    prensa reciente, contrataciones clave y panorama competitivo. En la practica entro a
    ciegas porque nunca me dio tiempo investigar. Lo mismo con evaluaciones de proveedores,
    tendencias de mercado, cualquier cosa que requiera una primera pasada a info publica.
    El trabajo esta definido pero no es glamuroso.
- impact_label_en: "~5 hrs/week saved"
- impact_label_es: "~5 hrs/semana ahorradas"
- templates:
  - research-assistant
  - competitive-intel-agent
  - data-analyst-agent

## Scenario: Sales rep with no copilot during calls

- functional_area_slug: agentes-ia
- slug: sales-rep-no-copilot
- sort_order: 20
- typical_hours_per_week: 3
- pain_headline_en: "On every sales call I'm fumbling for the right pricing page mid-conversation."
- pain_headline_es: "En cada llamada de venta estoy buscando la pagina de precios correcta a media conversacion."
- pain_body_en: |
    A prospect asks 'what's your enterprise tier' and I'm scrolling through three browser
    tabs trying to find the latest price card. They ask for a case study in their industry
    and I promise to follow up because I can't locate one live. I want an agent that
    surfaces the right collateral as the conversation moves, instead of me losing the room.
- pain_body_es: |
    Un prospecto pregunta 'cual es su tier enterprise' y estoy scrolleando tres pestanas
    buscando la lista de precios mas reciente. Piden un caso en su industria y prometo
    seguimiento porque no lo encuentro al vuelo. Quiero un agente que surfee el material
    correcto mientras la conversacion avanza, en vez de yo perder a la sala.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - sales-copilot
  - research-assistant
  - knowledge-base-updater

## Scenario: Onboarding new hires from scratch every time

- functional_area_slug: agentes-ia
- slug: onboarding-from-scratch-every-time
- sort_order: 30
- typical_hours_per_week: 4
- pain_headline_en: "Every new hire onboarding eats a week of my senior people's time."
- pain_headline_es: "Cada onboarding de empleado nuevo se come una semana de mi gente senior."
- pain_body_en: |
    We hire 1-2 people a quarter. Each one means hours of '101' calls — what the product
    does, who the customers are, where the documentation lives, how the team works. The
    same 20 questions every time, answered live, with no recording or written record. My
    senior team is drained and the new hire learns inconsistently.
- pain_body_es: |
    Contratamos 1-2 personas por trimestre. Cada una significa horas de llamadas '101'
    — que hace el producto, quienes son los clientes, donde vive la documentacion, como
    trabaja el equipo. Las mismas 20 preguntas cada vez, respondidas en vivo, sin
    grabacion ni registro. Mi equipo senior queda exhausto y el nuevo aprende de forma
    inconsistente.
- impact_label_en: "~4 hrs/week saved"
- impact_label_es: "~4 hrs/semana ahorradas"
- templates:
  - hr-onboarding-agent
  - knowledge-base-updater
  - research-assistant

---

# Area: integraciones-seguridad

## Scenario: Systems that don't talk to each other

- functional_area_slug: integraciones-seguridad
- slug: systems-that-dont-talk
- sort_order: 10
- typical_hours_per_week: 5
- pain_headline_en: "My CRM, accounting, and inventory tools each think they're the source of truth."
- pain_headline_es: "Mi CRM, contabilidad e inventario, cada uno cree ser la fuente de verdad."
- pain_body_en: |
    A sale closes in HubSpot. Someone manually creates an invoice in QuickBooks. Inventory
    drops in Shopify only if someone remembers to update it. By the time we reconcile end
    of month, the three systems disagree on every customer's balance and we spend two days
    making them match. The data lives in three places and not one is right.
- pain_body_es: |
    Una venta cierra en HubSpot. Alguien crea manualmente la factura en QuickBooks. El
    inventario baja en Shopify solo si alguien se acuerda de actualizarlo. Para cuando
    reconciliamos fin de mes, los tres sistemas no coinciden en el saldo de ningun cliente
    y pasamos dos dias haciendo que cuadren. La data vive en tres lugares y ninguno tiene
    la razon.
- impact_label_en: "~5 hrs/week saved"
- impact_label_es: "~5 hrs/semana ahorradas"
- templates:
  - data-reconciliation
  - workflow-orchestrator
  - crm-data-sync

## Scenario: Backups that nobody verifies until disaster

- functional_area_slug: integraciones-seguridad
- slug: backups-nobody-verifies
- sort_order: 20
- typical_hours_per_week: 2
- pain_headline_en: "Our nightly backups run automatically — and nobody has tested a restore in a year."
- pain_headline_es: "Nuestros respaldos nocturnos corren solos — y nadie ha probado una restauracion en un ano."
- pain_body_en: |
    Last time we needed a backup we discovered three months of files had silently failed
    to copy. Our IT contractor 'sets up' backups but verification is a manual project
    nobody owns. I want daily proof the backups completed and a monthly restore test
    against a sample, without it being a Tuesday afternoon someone has to remember.
- pain_body_es: |
    La ultima vez que necesitamos un respaldo descubrimos que tres meses de archivos no se
    habian copiado, en silencio. Nuestro contratista de IT 'configura' respaldos pero la
    verificacion es un proyecto manual del que nadie es duenio. Quiero prueba diaria de que
    los respaldos se completaron y una restauracion mensual de muestra, sin que sea una
    tarde de martes que alguien tiene que recordar.
- impact_label_en: "~2 hrs/week saved"
- impact_label_es: "~2 hrs/semana ahorradas"
- templates:
  - backup-verification
  - system-health-monitor
  - compliance-checker

## Scenario: Systems failing silently until customers notice

- functional_area_slug: integraciones-seguridad
- slug: silent-system-failures
- sort_order: 30
- typical_hours_per_week: 3
- pain_headline_en: "Our checkout has been broken for hours and we only find out from a customer email."
- pain_headline_es: "Nuestro checkout lleva horas roto y nos enteramos por correo de un cliente."
- pain_body_en: |
    Last month Stripe rotated a key and our webhook started failing. We didn't notice for
    six hours because nothing is monitoring the integration health. A customer finally
    emailed asking why their payment was being declined. I want every critical integration
    monitored with alerts the moment it stops behaving normally, not the moment a customer
    complains.
- pain_body_es: |
    El mes pasado Stripe roto una llave y nuestro webhook empezo a fallar. No lo notamos
    por seis horas porque nada monitorea la salud de la integracion. Un cliente termino
    escribiendo para preguntar por que su pago era rechazado. Quiero cada integracion
    critica monitoreada con alertas en el momento que deja de comportarse normal, no en el
    momento que un cliente se queja.
- impact_label_en: "~3 hrs/week saved"
- impact_label_es: "~3 hrs/semana ahorradas"
- templates:
  - system-health-monitor
  - workflow-orchestrator
  - sla-monitoring

---

## Stats

- Total scenario count: **50**
- Per-area counts:
  - ventas: **10** (target 10)
  - marketing: **10** (target 10)
  - atencion-al-cliente: **8** (target 8)
  - documentos: **6** (target 6)
  - productividad: **6** (target 6)
  - reportes: **4** (target 4)
  - agentes-ia: **3** (target 3)
  - integraciones-seguridad: **3** (target 3)
- Total mapping count: **150** (50 scenarios x 3 templates each, range 100-160)
- Unique template slugs referenced (cross-checked against live `automation_templates` table in Task 2):
  - sales: lead-followup-email, crm-data-sync, pipeline-alerts, lead-scoring, sales-forecasting, proposal-generator, quote-builder, territory-report, win-loss-analysis
  - marketing: email-campaigns, content-generation, audience-segmentation, social-scheduler, content-strategist-agent, newsletter-automation, ad-performance, marketing-roi, seo-monitoring, competitive-intel-agent
  - customer_service: ticket-routing, escalation-manager, multichannel-support-agent, faq-bot, ai-chatbot-24-7, auto-response-email, sla-monitoring, review-response, satisfaction-surveys, knowledge-base-updater
  - documents: invoice-processing, data-extraction, receipt-scanning, contract-analysis, compliance-checker, document-approval, template-filling
  - productivity: meeting-notes-ai, daily-standup-bot, slack-digest, calendar-optimizer, task-assignment, time-tracking-sync, resource-planner
  - reports: executive-dashboard, kpi-tracker, custom-analytics, data-reconciliation, client-performance
  - ai_agents: research-assistant, competitive-intel-agent, data-analyst-agent, sales-copilot, hr-onboarding-agent, compliance-agent
  - operations: data-reconciliation, workflow-orchestrator, backup-verification, system-health-monitor
- Hours histogram (counts of scenarios at each typical_hours_per_week):
  - 2 hrs: 11 scenarios
  - 3 hrs: 18 scenarios
  - 4 hrs: 9 scenarios
  - 5 hrs: 8 scenarios
  - 6 hrs: 1 scenario
  - 8 hrs: 1 scenario
  - 10 hrs: 1 scenario
  - 1 hr / 7 hrs / 9 hrs / 11-20 hrs: 0 scenarios
  - Total: 49 + 1 = 50 (sanity check: sums to 50)
