# Vishal Ghuge: PM Portfolio, Scope of Work

**Working title:** "The portfolio is a product"
**Inspiration:** about.senbuzy.com (open-source code: github.com/dayinji/sen-3d-resume, MIT)
**Goal:** Land Product Manager roles (AI-native and B2B SaaS focus) by showing how I think, not just what I shipped.
**Audience:** Hiring managers, recruiters, founders.

---

## 1. Concept

Sen's site works because the personality is the navigation: a character, eye-tracking, a camera that dives through the scene as you scroll. Mine should prove I'm a PM because the site itself is a well-managed product.

### Signature ideas
1. **Stickers as shipped products.** Each product (iqigai, Foyr Ideate, Total Environment, Amazon MX Player, CompanyLens) is a sticker on the hero. Scrolling or clicking zooms the camera in and opens the case study.
2. **JD Match mode.** A recruiter pastes a job description. The site reorders case studies and shows a fit score with reasons.
3. **Ask Vishal.** An AI chat grounded only in my case studies, answering in my voice with links to evidence.
4. **Case studies as PM artifacts.** Problem, metric, options rejected, decision, outcome, "what I'd do differently", plus an interactive tradeoff.
5. **Built like a product.** A page with the site's own PRD, success metrics, analytics, and learnings.

---

## 2. Scope

### In scope (v1)
- Scroll-driven hero with a 3D (or 2.5D) avatar, stickers, and eye/cursor tracking
- Resume timeline (Bocconi, Amazon MX Player, Foyr, Total Environment, iqigai, etc.)
- 4-5 full case studies in the PM-artifact structure
- Works gallery with sticker-to-case-study navigation
- Contact / links (LinkedIn, email, resume PDF)
- Mobile-friendly fallback, loading screen, performance budget
- Analytics and SEO basics

### In scope (v1.5, after launch)
- JD Match mode
- Ask Vishal AI chat (needs a small backend)
- "Built like a product" page

### Out of scope
- Blog / CMS
- Multi-language (Sen has EN/ZH; not needed)
- Reusing any of Sen's personal content (name, model, copy, logos, links). Only the MIT-licensed code structure is reused.

---

## 3. Build phases

| Phase | Work | Output |
|---|---|---|
| **0. Foundation** | Fork code structure, strip Sen's content and assets, set up repo and hosting | Running skeleton |
| **1. Content** | Write case studies and resume data in the PM-artifact format | Substance |
| **2. 3D hero** | Avatar, stickers, eye-tracking, scroll camera path | The wow |
| **3. PM features** | JD Match, then Ask Vishal | Differentiator |
| **4. Polish & launch** | Mobile, performance, analytics, SEO, LinkedIn link | Shippable |

**Milestone "v1 launchable":** Phases 0, 1, and a working hero.

---

## 4. Tech approach

- **Stack:** React, TypeScript, React Three Fiber, drei, framer-motion, zustand, Vite (same as the reference)
- **Content:** data-driven. Case studies are markdown files, resume and works are data files
- **Hosting:** static (Vercel, Netlify, or GitHub Pages)
- **AI features:** a small serverless function calling the Claude API, with the API key kept server-side

---

## 5. Case study template (PM artifact)

1. Context and user problem
2. Goal and success metric
3. Options considered (and why rejected)
4. Decision and rationale
5. What I shipped (visuals)
6. Outcome / impact
7. What I'd do differently
8. Interactive tradeoff: "What would you choose?"

---

## 6. Open decisions

| # | Decision | Options | Status |
|---|---|---|---|
| 1 | Avatar approach | Stylized 3D bust from photo (Blender) vs 2.5D illustrated fallback | **Open** |
| 2 | Projects to feature | Candidates: iqigai, Foyr Ideate, Total Environment, Amazon MX Player, CompanyLens | **Open** |
| 3 | AI features timing | In v1 vs post-launch | **Open** (default: post-launch) |
| 4 | Domain / hosting | TBD | **Open** |

---

## 7. Risks

- **3D avatar is the biggest time sink.** Mitigation: ship v1 with a placeholder or 2.5D hero, upgrade later.
- **Performance on mobile / low-end devices.** Mitigation: static fallback, compressed assets, lazy loading.
- **Content quality matters more than the 3D.** Mitigation: write case studies in Phase 1, before polishing visuals.
- **Licensing.** Only MIT code is reused; fonts and HDR assets from the reference need separate license checks.

---

## 8. Success metrics (for the "Built like a product" page)

- Recruiter / hiring-manager visits and average time on site
- Case study open rate per sticker
- JD Match usage (post-launch)
- Inbound recruiter messages or interview invites attributed to the site
