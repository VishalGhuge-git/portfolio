---
title: iqigai
year: 2025
role: Product Manager, 0 to 1
tags: [AI agents, 0 to 1, B2B + B2C, "xxxx+ daily users"]
---

<!--
  DRAFT built only from the CV. Sections marked REFINE below are left out until there is real
  content for them; do not invent. Add: the "before" numbers, options rejected, outcome beyond
  daily users, screenshots, and what you would do differently.
-->

**TL;DR** Fractal staffed its bench through spreadsheets and one manual person. I led the 0-to-1 build of a platform that matches people to demand, explains every recommendation, and is now used by **xxxx+ people a day**.

| | |
| --- | --- |
| **Company** | Fractal Analytics |
| **My role** | Product Manager: strategy, roadmap, MVP scope, agent prioritisation |
| **Timeline** | Platform build from Nov 2025, as Product Manager from Apr 2026 |
| **Type** | B2B and B2C platform, 0 to 1 |
| **Reach** | xxxx+ daily active users, used organisation-wide |
| **Team** | 7 people: 2 UI/UX designers, 2 backend engineers, 1 AI engineer, 1 QA, 1 APM |

## Context

Fractal has thousands people and hundreds on the bench at any time. It is a billable services business, so **every bench hour is lost revenue**: the less time someone sits on the bench, onshore or offshore, the bigger the cost win.

## Users and their jobs

| User | Job to be done |
| --- | --- |
| **Staffing team** | Match bench people to open demand quickly, with less manual tracking |
| **Project managers** | Find and select the right person for a project, with confidence |
| **Bench candidates** | See and respond to opportunities with minimal effort |

## The problem

The process lived in **large Excel files and pivot tables**, with **manual effort**, and constant follow-up over Teams and calls. It stayed afloat only through manual effort, so it could not scale and could not be trusted at speed.

## Baseline: the funnel

Of every 100 people on the bench, most never made it to a project manager's shortlist, and only **a fraction was selected**:

<div class="funnel">
  <div class="funnel-row"><span class="funnel-label">Receive AI matches</span><span class="funnel-bar" style="width:most">most</span></div>
  <div class="funnel-row"><span class="funnel-label">Recommended to a project manager</span><span class="funnel-bar"></span></div>
  <div class="funnel-row"><span class="funnel-label">Selected for a project</span><span class="funnel-bar"></span></div>
</div>

| Step | Rate |
| --- | --- |
| Bench step | n/a |
| Bench step | n/a |
| Bench step | n/a |

Two leaks stand out: **a third of the bench had no AI match at all**, and **only a third of recommendations turned into a selection**. That second leak is why trust in the recommendation became a design goal.

<!-- REFINE: confirm current vs launch baseline, and add the target. -->

## Goals and success metrics

I framed success around the funnel, since every stage leaks time and money:

- **Primary:** more of the bench selected, faster (less time on the bench)
- **Adoption:** daily active use across staffing, project managers and candidates
- **Trust:** project managers act on recommendations instead of re-checking in a spreadsheet

<!-- REFINE: the numeric targets and the measured before/after (time to staff, selection rate). -->

## Strategy: the smallest thing that goes live

My bet was that adoption beats completeness. I scoped the MVP to the **minimum flow that made the platform usable and live**, then improved on real usage.

| Horizon | Scope | Why |
| --- | --- | --- |
| **MVP** | Matching engine; access for staffing, project managers and candidates with only the few actions each needs; AI agents as standalone tools | The shortest path to a working, usable flow |
| **Next** | Fold the agents into the platform, in order of funnel impact | Core flow first, then more value per user |
| **Deferred** | Integrations with other internal systems | They add dependencies and delay launch; prove the flow first |
| **Deferred** | **Auto-assignment** (the system assigns people itself) | Recommended by stakeholders, but only worth building once the matching algorithm is upgraded. Getting the foundation state-of-the-art came first. |


## The product decision that mattered: explainable recommendations

An AI ranking people's careers will not be trusted as a black box. Every recommendation shows:

- a **plain-language explanation** of why the person ranked where they did, including the **gaps**
- a **clear breakdown of how the score was calculated**

The design goal: a project manager can read the reasoning, test it against their own judgement, and decide. That is what moves recommendations to selections.

## Design language

The visual language the platform is built on: calm navy on cool white, one warm accent for identity, and tables that stay readable at density. The text and surface pairings shown meet WCAG contrast, and green is reserved for success.

<a href="./works/iqigai/design-language.png" target="_blank" rel="noopener noreferrer"><img src="./works/iqigai/design-language.png" alt="iqigai design language board: logo, typography, colour palette, contrast pairings, components, table anatomy, radius and spacing" /></a>

<!-- Reference board only: tokens and component styles, no product data or screens. -->

## Prioritising the six AI agents

I defined the use case for each agent and ordered the build by **impact on the hiring funnel**:

- **Interview Bot** for lateral hiring
- **Practice Bot** for fresher hiring
- **JD Bot** for creating job descriptions and matching candidates
- **Case Study Bot** and **Debrief Bot** for bench assessment
- **Candidate Agent**

<!-- REFINE: how funnel impact was estimated, and why this order. -->

## Risks and trade-offs

- **Scope pressure:** stakeholders kept asking for enhancements during the MVP. The trade-off was speed to launch against completeness, so I held the MVP line and tracked what came next.
- **Alignment:** agreeing on MVP content and timelines across the business and a 7-person team was the hardest part of the job, more than the model.

## Outcome

- **xxxx+ daily active users**, used organisation-wide
- A manual, spreadsheet-driven process replaced by one platform for the staffing team, project managers and candidates
- **6 AI agents** defined, prioritised and integrated

<!-- REFINE: confirm "50% less time on staffing" and what it measures before publishing. -->
