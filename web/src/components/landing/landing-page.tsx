"use client";
import "./landing-page.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll reveal via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const revealEls = document.querySelectorAll(".landing-page .ai-reveal");
    revealEls.forEach((el) => observer.observe(el));

    return () => {
      revealEls.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    // Nav scroll effect + back to top visibility
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
      setBackToTopVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder: log form data (no backend yet)
    const formData = new FormData(e.currentTarget);
    console.log("Contact form submitted:", Object.fromEntries(formData));
    setFormStatus("success");
    setTimeout(() => setFormStatus("idle"), 5000);
  };

  return (
    <div className="landing-page" ref={revealRef}>

      {/* ===== NAVIGATION ===== */}
      <nav className={`ai-nav${navScrolled ? " ai-nav--scrolled" : ""}`}>
        <div className="ai-nav-inner">
          <a href="#home" className="ai-nav-logo" onClick={(e) => handleSmoothScroll(e, "#home")}>
            AIDEAS
          </a>

          <ul className="ai-nav-links">
            <li><a href="#about" onClick={(e) => handleSmoothScroll(e, "#about")}>About</a></li>
            <li><a href="#skills" onClick={(e) => handleSmoothScroll(e, "#skills")}>Process</a></li>
            <li><a href="#services" onClick={(e) => handleSmoothScroll(e, "#services")}>Services</a></li>
            <li><a href="#works" onClick={(e) => handleSmoothScroll(e, "#works")}>Catalog</a></li>
            <li><a href="#news" onClick={(e) => handleSmoothScroll(e, "#news")}>Use Cases</a></li>
            <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>Contact</a></li>
          </ul>

          <div className="ai-nav-cta">
            <Link href="/login" className="ai-nav-login">Login</Link>
            <Link href="/signup" className="ai-btn">Get Started</Link>
          </div>

          <button
            className="ai-nav-hamburger"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`ai-nav-mobile${mobileMenuOpen ? " is-open" : ""}`}>
        <button
          className="ai-nav-mobile-close"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        >
          &times;
        </button>
        <a href="#home" onClick={(e) => handleSmoothScroll(e, "#home")}>Home</a>
        <a href="#about" onClick={(e) => handleSmoothScroll(e, "#about")}>About</a>
        <a href="#skills" onClick={(e) => handleSmoothScroll(e, "#skills")}>Process</a>
        <a href="#services" onClick={(e) => handleSmoothScroll(e, "#services")}>Services</a>
        <a href="#works" onClick={(e) => handleSmoothScroll(e, "#works")}>Catalog</a>
        <a href="#news" onClick={(e) => handleSmoothScroll(e, "#news")}>Use Cases</a>
        <a href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>Contact</a>
        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
        <Link href="/signup" className="ai-btn" onClick={() => setMobileMenuOpen(false)}>
          Get Started
        </Link>
      </div>

      {/* ===== HERO / HOME ===== */}
      <section id="home" className="ai-hero">
        <video
          className="ai-hero-video"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        >
          <source src="/landing/img/home/main_video.mp4" type="video/mp4" />
        </video>
        <div className="ai-hero-overlay" />
        <div className="ai-hero-content">
          {/* data-i18n="home.subtitle_lead" */}
          <div className="ai-hero-subtitle">AI Automation as a Service</div>
          {/* data-i18n="home.title" */}
          <h1 className="ai-hero-title">AIDEAS</h1>
          {/* data-i18n="home.subtitle" */}
          <p className="ai-hero-desc">
            Tell us your problem. We build the automation that solves it — and run it for you.
          </p>
          <div className="ai-hero-cta">
            <Link href="/signup" className="ai-btn">Get Started</Link>
            <a
              href="#about"
              className="ai-btn-outline"
              onClick={(e) => handleSmoothScroll(e, "#about")}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="ai-section">
        <div className="ai-container">
          <div className="ai-about-surface">
            <div className="ai-about-grid">
              <div className="ai-about-content">
                {/* data-i18n="about.name" */}
                <h2 className="ai-section-title ai-reveal">About AIDEAS</h2>
                {/* data-i18n="about.role" */}
                <div className="ai-about-role ai-reveal ai-reveal-delay-1">Your AI Partner</div>
                {/* data-i18n-html="about.bio" */}
                <div className="ai-about-bio ai-text ai-reveal ai-reveal-delay-2">
                  Tell us what slows your business down — we&apos;ll build the automation to fix it. From{" "}
                  <a className="link-effect" href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>
                    ready-to-deploy solutions
                  </a>{" "}
                  to fully custom systems built from scratch, our team handles the entire process. You describe the problem, we deliver the result.
                </div>
                <div className="ai-detail-pills ai-reveal ai-reveal-delay-2">
                  <div className="ai-detail-pill">
                    {/* data-i18n="about.label_born" */}
                    <span className="ai-detail-pill-label">Focus</span>
                    {/* data-i18n="about.born" */}
                    <span className="ai-detail-pill-value">Your Results</span>
                  </div>
                  <div className="ai-detail-pill">
                    {/* data-i18n="about.label_age" */}
                    <span className="ai-detail-pill-label">Approach</span>
                    {/* data-i18n="about.age" */}
                    <span className="ai-detail-pill-value">AI-First</span>
                  </div>
                  <div className="ai-detail-pill">
                    {/* data-i18n="about.label_education" */}
                    <span className="ai-detail-pill-label">Solutions</span>
                    {/* data-i18n="about.education" */}
                    <span className="ai-detail-pill-value">Custom &amp; Ready-Made</span>
                  </div>
                  <div className="ai-detail-pill">
                    {/* data-i18n="about.label_experience" */}
                    <span className="ai-detail-pill-label">Support</span>
                    {/* data-i18n="about.experience" */}
                    <span className="ai-detail-pill-value">24/7 Support</span>
                  </div>
                  <div className="ai-detail-pill">
                    {/* data-i18n="about.label_position" */}
                    <span className="ai-detail-pill-label">Model</span>
                    {/* data-i18n="about.position" */}
                    <span className="ai-detail-pill-value">Fully Managed</span>
                  </div>
                  <div className="ai-detail-pill">
                    {/* data-i18n="about.label_location" */}
                    <span className="ai-detail-pill-label">Reach</span>
                    {/* data-i18n="about.location" */}
                    <span className="ai-detail-pill-value">Remote — Worldwide</span>
                  </div>
                </div>
                <div className="ai-about-stats ai-reveal ai-reveal-delay-3">
                  {/* data-i18n="about.years_count" */}
                  <span className="ai-about-stats-number">17</span>
                  {/* data-i18n="about.years_label" */}
                  <span className="ai-about-stats-label">Industries</span>
                </div>
                {/* data-i18n="about.download_cv" */}
                <a
                  href="#contact"
                  className="ai-btn ai-reveal ai-reveal-delay-3"
                  onClick={(e) => handleSmoothScroll(e, "#contact")}
                >
                  Get Started
                </a>
              </div>

              {/* About Visual */}
              <div className="ai-about-visual ai-reveal ai-reveal-delay-2">
                <div className="ai-about-visual-inner">
                  <div className="ai-about-visual-glow" />
                  <div className="ai-about-visual-stat ai-about-visual-stat-1">
                    <span className="ai-about-visual-stat-num">194+</span>
                    <span className="ai-about-visual-stat-txt">Automations</span>
                  </div>
                  <div className="ai-about-visual-stat ai-about-visual-stat-2">
                    <span className="ai-about-visual-stat-num">50+</span>
                    <span className="ai-about-visual-stat-txt">Integrations</span>
                  </div>
                  <div className="ai-about-visual-stat ai-about-visual-stat-3">
                    <span className="ai-about-visual-stat-num">24/7</span>
                    <span className="ai-about-visual-stat-txt">Support</span>
                  </div>
                  <div className="ai-about-visual-orbit" />
                  <div className="ai-about-visual-orbit ai-about-visual-orbit-2" />
                  <div className="ai-about-visual-center">
                    <span>AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESS / SKILLS ===== */}
      <section id="skills" className="ai-section ai-section--surface">
        <div className="ai-container">
          <div className="ai-section-header ai-section-header--center ai-reveal">
            {/* data-i18n="skills.languages_subtitle" + data-i18n="skills.languages_title" */}
            <div className="ai-section-subtitle">How we Work</div>
            <h2 className="ai-section-title">Our Process</h2>
          </div>
          <div className="ai-process-wrap">
            <div className="ai-process-timeline">
              <div className="ai-process-step ai-reveal ai-reveal-delay-1">
                <div className="ai-process-number">01</div>
                {/* data-i18n="skills.lang_1" */}
                <div className="ai-process-step-title">1. Tell us your problem</div>
                <div className="ai-process-step-desc">Share what slows your business down. We listen and map out the pain points.</div>
              </div>
              <div className="ai-process-step ai-reveal ai-reveal-delay-2">
                <div className="ai-process-number">02</div>
                {/* data-i18n="skills.lang_2" */}
                <div className="ai-process-step-title">2. We design the solution</div>
                <div className="ai-process-step-desc">Our team architects the right automation, picking the best tools and approach.</div>
              </div>
              <div className="ai-process-step ai-reveal ai-reveal-delay-3">
                <div className="ai-process-number">03</div>
                {/* data-i18n="skills.lang_3" */}
                <div className="ai-process-step-title">3. We build &amp; deploy it</div>
                <div className="ai-process-step-desc">We build, test, and deploy your solution into your existing stack.</div>
              </div>
              <div className="ai-process-step ai-reveal ai-reveal-delay-4">
                <div className="ai-process-number">04</div>
                {/* data-i18n="skills.lang_4" */}
                <div className="ai-process-step-title">4. We maintain &amp; optimize</div>
                <div className="ai-process-step-desc">Ongoing monitoring, tweaks, and improvements as your business evolves.</div>
              </div>
            </div>
          </div>

          <div className="ai-section-header ai-section-header--center ai-reveal" style={{ marginBottom: "36px" }}>
            {/* data-i18n="skills.skills_subtitle" + data-i18n="skills.skills_title" */}
            <div className="ai-section-subtitle">What we Use</div>
          </div>
          <div className="ai-tools-row ai-reveal">
            {/* data-i18n="skills.skill_1-4" */}
            <span className="ai-tool-pill">AI &amp; Machine Learning</span>
            <span className="ai-tool-pill">Custom Integrations</span>
            <span className="ai-tool-pill">Workflow Automation</span>
            <span className="ai-tool-pill">Data &amp; Analytics</span>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="ai-section">
        <div className="ai-container">
          <div className="ai-services-grid">
            <div className="ai-service-card ai-reveal ai-reveal-delay-1">
              <i className="ion-ios-gear-outline ai-service-icon" />
              {/* data-i18n="services.service_1_subtitle" */}
              <div className="ai-service-subtitle">Business</div>
              {/* data-i18n="services.service_1_title" */}
              <div className="ai-service-title">Automation</div>
              {/* data-i18n="service_descs.desc_1" */}
              <p className="ai-service-desc">Streamline operations with intelligent workflows that handle repetitive tasks, approvals, and data processing automatically.</p>
            </div>
            <div className="ai-service-card ai-reveal ai-reveal-delay-2">
              <i className="ion-ios-chatboxes-outline ai-service-icon" />
              {/* data-i18n="services.service_2_subtitle" */}
              <div className="ai-service-subtitle">Customer</div>
              {/* data-i18n="services.service_2_title" */}
              <div className="ai-service-title">Experience</div>
              {/* data-i18n="service_descs.desc_2" */}
              <p className="ai-service-desc">Deploy AI assistants that understand your business and respond to customers instantly across every channel.</p>
            </div>
            <div className="ai-service-card ai-reveal ai-reveal-delay-3">
              <i className="ion-ios-compose-outline ai-service-icon" />
              {/* data-i18n="services.service_3_subtitle" */}
              <div className="ai-service-subtitle">Content</div>
              {/* data-i18n="services.service_3_title" */}
              <div className="ai-service-title">at Scale</div>
              {/* data-i18n="service_descs.desc_3" */}
              <p className="ai-service-desc">Generate, optimize, and publish content across all your channels with AI-powered pipelines that maintain your brand voice.</p>
            </div>
            <div className="ai-service-card ai-reveal ai-reveal-delay-4">
              <i className="ion-ios-analytics-outline ai-service-icon" />
              {/* data-i18n="services.service_4_subtitle" */}
              <div className="ai-service-subtitle">Data</div>
              {/* data-i18n="services.service_4_title" */}
              <div className="ai-service-title">Intelligence</div>
              {/* data-i18n="service_descs.desc_4" */}
              <p className="ai-service-desc">Transform raw data into actionable insights with automated reporting, forecasting, and anomaly detection systems.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FACTS ===== */}
      <section className="ai-section ai-facts-section ai-section--surface" id="facts">
        <div className="ai-facts-glow" />
        <div className="ai-facts-content">
          <div className="ai-container">
            <div className="ai-section-header ai-section-header--center ai-reveal">
              {/* data-i18n="facts.subtitle" */}
              <div className="ai-section-subtitle">Built for impact</div>
              {/* data-i18n="facts.title" */}
              <h2 className="ai-section-title">Why AIDEAS</h2>
            </div>
            <div className="ai-facts-grid">
              <div className="ai-fact-item ai-reveal ai-reveal-delay-1">
                <div className="ai-fact-number">194</div>
                {/* data-i18n="facts.fact_1_label" */}
                <div className="ai-fact-label">Ready-to-Deploy Automations</div>
              </div>
              <div className="ai-fact-item ai-reveal ai-reveal-delay-2">
                <div className="ai-fact-number">
                  50<span className="ai-fact-suffix">+</span>
                </div>
                {/* data-i18n="facts.fact_2_label" */}
                <div className="ai-fact-label">Integrations</div>
              </div>
              <div className="ai-fact-item ai-reveal ai-reveal-delay-3">
                <div className="ai-fact-number">
                  1000<span className="ai-fact-suffix">+</span>
                </div>
                {/* data-i18n="facts.fact_3_label" */}
                <div className="ai-fact-label">Hours Saved Monthly</div>
              </div>
              <div className="ai-fact-item ai-reveal ai-reveal-delay-4">
                <div className="ai-fact-number">99.9</div>
                {/* data-i18n="facts.fact_4_label" */}
                <div className="ai-fact-label">% Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="ai-section">
        <div className="ai-container">
          <div className="ai-section-header ai-section-header--center ai-reveal">
            <div className="ai-section-subtitle">What they say</div>
            <h2 className="ai-section-title">Testimonials</h2>
          </div>
          <div className="ai-testimonials-grid">
            <div className="ai-testimonial-card ai-reveal ai-reveal-delay-1">
              <div className="ai-testimonial-quote-icon">&ldquo;</div>
              {/* data-i18n-html="testimonials.quote_1" */}
              <div className="ai-testimonial-text">
                We spent 20 hours a week processing emails manually. AIDEAS analyzed our workflow, built a custom automation, and now it runs itself — classification, responses, and escalation.{" "}
                <a className="link-effect" href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>
                  Completely hands-off
                </a>.
              </div>
              {/* data-i18n="testimonials.author_1" */}
              <div className="ai-testimonial-author">Marketing Agency</div>
            </div>
            <div className="ai-testimonial-card ai-reveal ai-reveal-delay-2">
              <div className="ai-testimonial-quote-icon">&ldquo;</div>
              {/* data-i18n="testimonials.quote_2" */}
              <div className="ai-testimonial-text">
                Our support response time dropped from hours to seconds. AIDEAS deployed an AI assistant that understands our products and handles 80% of customer inquiries without human intervention.
              </div>
              {/* data-i18n="testimonials.author_2" */}
              <div className="ai-testimonial-author">E-commerce Brand</div>
            </div>
            <div className="ai-testimonial-card ai-reveal ai-reveal-delay-3">
              <div className="ai-testimonial-quote-icon">&ldquo;</div>
              {/* data-i18n="testimonials.quote_3" */}
              <div className="ai-testimonial-text">
                We needed a content engine, not just a tool. AIDEAS built an end-to-end pipeline — from research to publishing — that runs our social media on autopilot while we focus on strategy.
              </div>
              {/* data-i18n="testimonials.author_3" */}
              <div className="ai-testimonial-author">Digital Startup</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WORKS / CATALOG ===== */}
      <section id="works" className="ai-section ai-section--surface">
        <div className="ai-container">
          <div className="ai-section-header ai-section-header--center ai-reveal">
            {/* data-i18n="works.subtitle" */}
            <div className="ai-section-subtitle">194+ automations ready to deploy</div>
            {/* data-i18n="works.title" */}
            <h2 className="ai-section-title">Solutions Catalog</h2>
          </div>
          <div className="ai-catalog-grid">
            <div className="ai-catalog-card ai-reveal ai-reveal-delay-1">
              <i className="ion-ios-email-outline ai-catalog-icon" />
              <div className="ai-catalog-title">Email &amp; Communications</div>
              <div className="ai-catalog-count">25+ automations</div>
              <p className="ai-catalog-desc">Auto-classification, smart responses, inbox routing, follow-up sequences, newsletter automation</p>
            </div>
            <div className="ai-catalog-card ai-reveal ai-reveal-delay-1">
              <i className="ion-ios-paper-outline ai-catalog-icon" />
              <div className="ai-catalog-title">Documents &amp; PDF</div>
              <div className="ai-catalog-count">20+ automations</div>
              <p className="ai-catalog-desc">Invoice processing, contract analysis, resume parsing, OCR extraction, document generation</p>
            </div>
            <div className="ai-catalog-card ai-reveal ai-reveal-delay-2">
              <i className="ion-ios-people-outline ai-catalog-icon" />
              <div className="ai-catalog-title">CRM &amp; Sales</div>
              <div className="ai-catalog-count">30+ automations</div>
              <p className="ai-catalog-desc">Lead qualification, pipeline automation, customer scoring, deal tracking, sales reporting</p>
            </div>
            <div className="ai-catalog-card ai-reveal ai-reveal-delay-2">
              <i className="ion-ios-chatboxes-outline ai-catalog-icon" />
              <div className="ai-catalog-title">Chatbots &amp; Support</div>
              <div className="ai-catalog-count">22+ automations</div>
              <p className="ai-catalog-desc">WhatsApp bots, Telegram assistants, website chat, RAG-powered knowledge base, ticket routing</p>
            </div>
            <div className="ai-catalog-card ai-reveal ai-reveal-delay-3">
              <i className="ion-social-instagram-outline ai-catalog-icon" />
              <div className="ai-catalog-title">Social Media &amp; Content</div>
              <div className="ai-catalog-count">28+ automations</div>
              <p className="ai-catalog-desc">Content generation, scheduling, sentiment analysis, trend monitoring, multi-platform publishing</p>
            </div>
            <div className="ai-catalog-card ai-reveal ai-reveal-delay-3">
              <i className="ion-ios-analytics-outline ai-catalog-icon" />
              <div className="ai-catalog-title">Data &amp; Analytics</div>
              <div className="ai-catalog-count">35+ automations</div>
              <p className="ai-catalog-desc">Web scraping, ETL pipelines, reporting dashboards, anomaly detection, predictive analytics</p>
            </div>
            <div className="ai-catalog-card ai-reveal ai-reveal-delay-4">
              <i className="ion-ios-cloud-outline ai-catalog-icon" />
              <div className="ai-catalog-title">Integrations &amp; APIs</div>
              <div className="ai-catalog-count">20+ automations</div>
              <p className="ai-catalog-desc">Connect any system — ERPs, databases, legacy software, custom APIs, third-party services</p>
            </div>
            <div className="ai-catalog-card ai-catalog-card--special ai-reveal ai-reveal-delay-4">
              <i className="ion-ios-lightbulb-outline ai-catalog-icon" />
              <div className="ai-catalog-title">Custom Solutions</div>
              <div className="ai-catalog-count">Unlimited</div>
              <p className="ai-catalog-desc">Don&apos;t see what you need? We build it from scratch — Python, AI, machine learning, whatever it takes</p>
            </div>
          </div>
          <div className="ai-works-caption ai-reveal">
            {/* data-i18n="works.caption" */}
            <p>These are just examples. We have 194+ ready-to-deploy automations — and if your need isn&apos;t covered, we build it from scratch. Whatever your challenge, we have a solution.</p>
          </div>
        </div>
      </section>

      {/* ===== USE CASES / NEWS ===== */}
      <section id="news" className="ai-section">
        <div className="ai-container">
          <div className="ai-section-header ai-reveal">
            {/* data-i18n="news.subtitle" */}
            <div className="ai-section-subtitle">Real results from real businesses</div>
            {/* data-i18n="news.title" */}
            <h2 className="ai-section-title">Use Cases</h2>
          </div>
          <div className="ai-cases-grid">
            <div className="ai-case-card ai-reveal ai-reveal-delay-1">
              {/* data-i18n="news.news_1_date" */}
              <span className="ai-case-badge">Email &amp; Inbox</span>
              {/* data-i18n="news.news_1_title" */}
              <div className="ai-case-title">Intelligent Email Workflows</div>
              {/* data-i18n-html="news.news_1_txt" */}
              <div className="ai-case-text">
                From auto-classification to AI-drafted responses, we build systems that manage your inbox so your team can focus on{" "}
                <a className="link-effect" href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>
                  work that matters
                </a>.
              </div>
              <div className="ai-case-meta">
                <div className="ai-case-meta-item">
                  {/* data-i18n="news.label_client" */}
                  <span className="ai-case-meta-label">Platforms</span>
                  {/* data-i18n="news.client_name" */}
                  <span className="ai-case-meta-value">Multiple</span>
                </div>
                <div className="ai-case-meta-item">
                  {/* data-i18n="news.label_duration" */}
                  <span className="ai-case-meta-label">Timeline</span>
                  {/* data-i18n="news.duration_value" */}
                  <span className="ai-case-meta-value">1-2 Weeks</span>
                </div>
              </div>
              {/* data-i18n="news.website_btn" */}
              <a
                href="#contact"
                className="ai-btn-outline"
                onClick={(e) => handleSmoothScroll(e, "#contact")}
              >
                Get Started
              </a>
            </div>

            <div className="ai-case-card ai-reveal ai-reveal-delay-2">
              {/* data-i18n="news.news_2_date" */}
              <span className="ai-case-badge">Documents &amp; Data</span>
              {/* data-i18n="news.news_2_title" */}
              <div className="ai-case-title">Document Intelligence</div>
              {/* data-i18n-html="news.news_2_txt" */}
              <div className="ai-case-text">
                Invoices, contracts, resumes — we build AI systems that read, extract, and organize your documents automatically. No more{" "}
                <a className="link-effect" href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>
                  manual data entry
                </a>.
              </div>
              <div className="ai-case-meta">
                <div className="ai-case-meta-item">
                  <span className="ai-case-meta-label">Platforms</span>
                  <span className="ai-case-meta-value">Multiple</span>
                </div>
                <div className="ai-case-meta-item">
                  <span className="ai-case-meta-label">Timeline</span>
                  <span className="ai-case-meta-value">1-2 Weeks</span>
                </div>
              </div>
              <a
                href="#contact"
                className="ai-btn-outline"
                onClick={(e) => handleSmoothScroll(e, "#contact")}
              >
                Get Started
              </a>
            </div>

            <div className="ai-case-card ai-reveal ai-reveal-delay-3">
              {/* data-i18n="news.news_3_date" */}
              <span className="ai-case-badge">Customer Support</span>
              {/* data-i18n="news.news_3_title" */}
              <div className="ai-case-title">AI-Powered Support</div>
              {/* data-i18n-html="news.news_3_txt" */}
              <div className="ai-case-text">
                We deploy smart assistants on WhatsApp, Telegram, or your website — trained on your business, answering customers{" "}
                <a className="link-effect" href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>
                  around the clock
                </a>.
              </div>
              <div className="ai-case-meta">
                <div className="ai-case-meta-item">
                  <span className="ai-case-meta-label">Platforms</span>
                  <span className="ai-case-meta-value">Multiple</span>
                </div>
                <div className="ai-case-meta-item">
                  <span className="ai-case-meta-label">Timeline</span>
                  <span className="ai-case-meta-value">1-2 Weeks</span>
                </div>
              </div>
              <a
                href="#contact"
                className="ai-btn-outline"
                onClick={(e) => handleSmoothScroll(e, "#contact")}
              >
                Get Started
              </a>
            </div>

            <div className="ai-case-card ai-reveal ai-reveal-delay-4">
              {/* data-i18n="news.news_4_date" */}
              <span className="ai-case-badge">Marketing &amp; Content</span>
              {/* data-i18n="news.news_4_title" */}
              <div className="ai-case-title">Content Engine</div>
              {/* data-i18n-html="news.news_4_txt" */}
              <div className="ai-case-text">
                We build automated pipelines that research, create, and publish content across your channels. Your brand voice,{" "}
                <a className="link-effect" href="#contact" onClick={(e) => handleSmoothScroll(e, "#contact")}>
                  powered by AI
                </a>.
              </div>
              <div className="ai-case-meta">
                <div className="ai-case-meta-item">
                  <span className="ai-case-meta-label">Platforms</span>
                  <span className="ai-case-meta-value">Multiple</span>
                </div>
                <div className="ai-case-meta-item">
                  <span className="ai-case-meta-label">Timeline</span>
                  <span className="ai-case-meta-value">1-2 Weeks</span>
                </div>
              </div>
              <a
                href="#contact"
                className="ai-btn-outline"
                onClick={(e) => handleSmoothScroll(e, "#contact")}
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="ai-section ai-section--surface">
        <div className="ai-container">
          <div className="ai-section-header ai-reveal">
            {/* data-i18n="contact.subtitle" */}
            <div className="ai-section-subtitle">Have an idea? A problem? A process you hate?</div>
            {/* data-i18n="contact.title" */}
            <h2 className="ai-section-title">Let&apos;s Talk</h2>
          </div>
          <div className="ai-contact-grid">
            <div className="ai-contact-info ai-reveal ai-reveal-delay-1">
              <div className="ai-contact-info-block">
                <i className="ion-ios-location-outline ai-contact-info-icon" />
                {/* data-i18n="contact.address_subtitle" */}
                <div className="ai-contact-info-label">Coverage</div>
                {/* data-i18n="contact.address_title" */}
                <div className="ai-contact-info-title">Location</div>
                {/* data-i18n="contact.address_text" */}
                <div className="ai-contact-info-value">United States &amp; Canada</div>
              </div>
              <div className="ai-contact-info-block">
                <i className="ion-ios-email-outline ai-contact-info-icon" />
                {/* data-i18n="contact.email_subtitle" */}
                <div className="ai-contact-info-label">Write Us</div>
                {/* data-i18n="contact.email_title" */}
                <div className="ai-contact-info-title">E-mail</div>
                <div className="ai-contact-info-value">
                  <a href="mailto:hello@aideas.ca">hello@aideas.ca</a>
                </div>
              </div>
              <div className="ai-contact-info-block">
                <i className="ion-ios-telephone-outline ai-contact-info-icon" />
                {/* data-i18n="contact.phone_subtitle" */}
                <div className="ai-contact-info-label">Call Us</div>
                {/* data-i18n="contact.phone_title" */}
                <div className="ai-contact-info-title">Phone</div>
                <div className="ai-contact-info-value">
                  <a href="tel:+11234567890">+1 (123) 456-7890</a>
                </div>
              </div>
              <div className="ai-contact-social">
                <a className="ion-social-twitter" href="#" aria-label="Twitter" />
                <a className="ion-social-facebook" href="#" aria-label="Facebook" />
                <a className="ion-social-linkedin" href="#" aria-label="LinkedIn" />
                <a className="ion-social-instagram" href="#" aria-label="Instagram" />
              </div>
            </div>

            <div className="ai-contact-form-wrap ai-reveal ai-reveal-delay-2">
              <form className="ai-form" onSubmit={handleFormSubmit}>
                <div className="ai-form-row">
                  {/* data-i18n="[placeholder]contact.form_name" */}
                  <input type="text" name="name" placeholder="Name" required />
                  {/* data-i18n="[placeholder]contact.form_email" */}
                  <input type="email" name="email" placeholder="Email" required />
                </div>
                {/* data-i18n="[placeholder]contact.form_message" */}
                <textarea
                  name="message"
                  placeholder="Describe the problem you want solved — no matter how unique, we'll find a way to automate it"
                  required
                />
                <div>
                  {/* data-i18n="contact.form_send" */}
                  <button type="submit" className="ai-btn">Send Message</button>
                </div>
                {/* data-i18n="contact.form_success" */}
                {formStatus === "success" && (
                  <div className="ai-form-status success">
                    Message sent! We&apos;ll reach out within 24 hours.
                  </div>
                )}
                {/* data-i18n="contact.form_error" */}
                {formStatus === "error" && (
                  <div className="ai-form-status error">
                    Something went wrong. Please try again.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="ai-footer">
        <div className="ai-container">
          <div className="ai-footer-text">AIDEAS &copy; 2026. All Rights Reserved.</div>
        </div>
      </footer>

      {/* ===== BACK TO TOP ===== */}
      <a
        href="#home"
        className={`ai-back-to-top${backToTopVisible ? " is-visible" : ""}`}
        onClick={(e) => handleSmoothScroll(e, "#home")}
        aria-label="Back to top"
      >
        <i className="ion-ios-arrow-up" />
      </a>

    </div>
  );
}
