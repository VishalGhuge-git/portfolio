---
title: iqigai
year: 2025
role: Product Manager, 0 to 1
tags: [AI agents, 0 to 1, B2B + B2C, "xxxx+ daily users"]
---

**TL;DR** Fractal staffed its bench through spreadsheets and manual follow-up. I led the 0-to-1 build of a platform that matches people to demand, explains every recommendation, and is now used by **xxxx+ people a day**.

| | |
| --- | --- |
| **Company** | Fractal Analytics |
| **My role** | Product Manager: strategy, roadmap, MVP scope, agent prioritisation |
| **Timeline** | Platform build from Nov 2025, as Product Manager from Apr 2026 |
| **Type** | B2B and B2C platform, 0 to 1 |
| **Reach** | xxxx+ daily active users, used organisation-wide |
| **Team** | 7-person cross-functional team: design, engineering, AI, QA and product |

## Context

Fractal is a large organisation with a sizeable bench at any time. It is a billable services business, so **every bench hour is lost revenue**: the less time someone sits on the bench, onshore or offshore, the bigger the cost win.

## Users and their jobs

| User | Job to be done |
| --- | --- |
| **Staffing team** | Match bench people to open demand quickly, with less manual tracking |
| **Project managers** | Find and select the right person for a project, with confidence |
| **Bench candidates** | See and respond to opportunities with minimal effort |

## The problem

The process lived in **large spreadsheets and pivot tables**, with constant manual follow-up over Teams and calls. It stayed afloat only through manual effort, so it could not scale and could not be trusted at speed.

## Baseline: where the funnel leaked

Two leaks stood out: **a meaningful part of the bench had no AI match at all**, and **only a fraction of recommendations turned into a selection**. That second leak is why trust in the recommendation became a design goal.

## Goals and success metrics

I framed success around the funnel, since every stage leaks time and money:

- **Primary:** more of the bench selected, faster (less time on the bench)
- **Adoption:** daily active use across staffing, project managers and candidates
- **Trust:** project managers act on recommendations instead of re-checking in a spreadsheet

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

## Prioritising the six AI agents

I defined the use case for each agent and ordered the build by **impact on the hiring funnel**. The six agents cover lateral hiring, fresher hiring, job descriptions and candidate matching, bench assessment and a candidate-facing assistant.

## Risks and trade-offs

- **Scope pressure:** stakeholders kept asking for enhancements during the MVP. The trade-off was speed to launch against completeness, so I held the MVP line and tracked what came next.
- **Alignment:** agreeing on MVP content and timelines across the business and a 7-person team was the hardest part of the job, more than the model.

## Outcome

- **xxxx+ daily active users**, used organisation-wide
- A manual, spreadsheet-driven process replaced by one platform for the staffing team, project managers and candidates
- **6 AI agents** defined, prioritised and integrated
