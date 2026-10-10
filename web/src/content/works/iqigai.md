---
title: iqigai
year: 2025
role: Product Manager, 0 to 1
tags: [AI agents, 0 to 1, B2B + B2C, "xxxx daily users"]
---

<!--
  DRAFT built only from the CV. Sections marked REFINE below are left out until there is real
  content for them; do not invent. Add: the "before" numbers, options rejected, outcome beyond
  daily users, screenshots, and what you would do differently.
-->

**TL;DR** Fractal staffed its bench through spreadsheets and one manual person. I led the 0-to-1 build of a platform that matches people to demand, explains every recommendation, and is now used by **xxxx people a day**.

| | |
| --- | --- |
| **Company** | Fractal Analytics |
| **My role** | Product Manager: strategy, roadmap, MVP scope, agent prioritisation |
| **Timeline** | Platform build from Nov 2025, as Product Manager from Apr 2026 |
| **Type** | B2B and B2C platform, 0 to 1 |
| **Reach** | xxxx daily active users, used organisation-wide |
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

Of every 100 people on the bench:

| Stage | People |
| --- | --- |
| Receive AI matches | 70 |
| Recommended to a project manager | 30 |
| Selected for a project | 10 |

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

<!-- REFINE: options you rejected beyond these (buy vs build, skills-only matching, full auto-assignment vs recommend-then-decide), and the criteria you used. -->

## The product decision that mattered: explainable recommendations

An AI ranking people's careers will not be trusted as a black box. Every recommendation shows:

- a **plain-language explanation** of why the person ranked where they did, including the **gaps**
- a **clear breakdown of how the score was calculated**

The design goal: a project manager can read the reasoning, test it against their own judgement, and decide. That is what moves recommendations to selections.

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

- **xxxx daily active users**, used organisation-wide
- A manual, spreadsheet-driven process replaced by one platform for the staffing team, project managers and candidates
- **6 AI agents** defined, prioritised and integrated

<!-- REFINE: confirm "50% less time on staffing" and what it measures before publishing. -->

## What I'd do differently

<!-- REFINE: one honest learning. Interviewers weigh this heavily. -->

<!-- REFINE: screens (match view, score breakdown, explanation) in public/works/iqigai/ -->
