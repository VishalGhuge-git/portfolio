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

An AI-powered staffing and recruitment platform inside **Fractal Analytics**, built from zero. **iqigai by Fractal** is the platform, and a set of AI agents live inside it. I own the product strategy and roadmap.

| | |
| --- | --- |
| **Company** | Fractal Analytics |
| **My role** | Product Manager (owner of strategy and roadmap) |
| **Timeline** | Platform build from Nov 2025, as Product Manager from Apr 2026 |
| **Type** | B2B and B2C platform, 0 to 1 |
| **Reach** | xxxx daily active users, used organisation-wide |
| **Team** | 7 people: 2 UI/UX designers, 2 backend engineers, 1 AI engineer, 1 QA, 1 APM |

## The problem

Fractal is a thousands-person organisation with hundreds people on the bench at any time, who must be matched to open demand. In a billable services business, **every bench hour is money**: each employee who stays on the bench for less time is a cost win, onshore and offshore.

The process that handled this was held together by people and spreadsheets:

- large Excel files and pivot tables as the source of truth
- **one resource working manual just to maintain the data**
- constant manual follow-up over Teams messages and calls

It worked only because of that manual effort. It was a broken flow that stayed afloat, and it did not scale.

## The funnel I set out to fix

Of every 100 people on the bench:

| Stage | People |
| --- | --- |
| Receive AI matches | 70 |
| Recommended to a project manager | 30 |
| Selected for a project | 10 |

<!-- REFINE: confirm whether this is the current state or the launch baseline, and add the target / trend. -->

## What I built first

I scoped the MVP as the **smallest flow that made the platform usable and live**, not the full vision:

- a **matching engine** that scores bench employees against open demand
- platform access for the **staffing team, project managers and candidates**, each with only the few actions they need
- the AI **agents as standalone tools** (they were folded into the platform after the core flow was live)

## What I chose not to build yet

| Decision | Why |
| --- | --- |
| **No integrations** with other internal systems in the MVP | Integrations add dependencies and delay launch. Prove the matching flow first, then connect the systems. |
| **Agents stay standalone** in the MVP, then integrate | Get the core staffing flow live first, then bring each agent into the platform in order of funnel impact. |

<!-- REFINE: the options you considered and rejected beyond these (e.g. buy vs build, matching on skills only, full auto-assignment vs recommend-then-decide). -->

## Designing for trust

An AI score is useless if project managers do not believe it. Each recommendation shows:

- a **conversational explanation, in plain paragraphs**, of why this candidate ranked where they did, including the gaps
- a **clear breakdown of how the score was calculated**, so nothing is a black box

The aim was a PM who can read the reasoning, check it against their own judgement, and decide, rather than a number to accept on faith.

## Six AI agents, and how I prioritised them

I defined the use cases and set the build order by **impact on the hiring funnel**, then integrated each into the platform.

- **Interview Bot** for lateral hiring
- **Practice Bot** for fresher hiring
- **JD Bot** for creating job descriptions and matching candidates
- **Case Study Bot** and **Debrief Bot** for bench assessment
- **Candidate Agent**

<!-- REFINE: how funnel impact was measured and why this order. -->

## The hard part

The hardest part was not the model; it was **alignment**: agreeing on what the MVP would include, holding the timeline, and handling enhancements that stakeholders wanted added mid-build. Scope kept moving, so I made the cut line explicit and kept a visible list of what came next.

## Outcome

- **xxxx daily active users**, used organisation-wide
- **6 AI agents** defined, prioritised and integrated into the platform
- A manual, spreadsheet-driven process replaced by one platform used by the staffing team, project managers and candidates

<!-- REFINE: confirm the "50% less time spent on staffing" figure and its definition before publishing. -->
<!-- REFINE: screens (matching view, score breakdown, explanation paragraph) in public/works/iqigai/ -->
<!-- REFINE: What I would do differently -->
