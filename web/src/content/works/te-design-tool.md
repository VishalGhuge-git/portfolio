---
title: Foyr Neo for Total Environment
year: 2024
role: Associate Product Manager, on-site
tags: [B2B, 3D design tool, 0 to 1, "300+ screens", "100+ designers"]
---

**TL;DR** Total Environment's 100+ designers worked in AutoCAD. I was the sole on-site PM, in the client's Bangalore office, for a fully customised, web-based drag-and-drop 3D design tool, built from zero. It covered 300+ screens and 32+ flows, and was rolled out to the whole organisation.

| | |
| --- | --- |
| **Client** | Total Environment, Bangalore |
| **My role** | Associate Product Manager at Foyr, sole on-site PM: requirements, stakeholder alignment, prioritisation |
| **Timeline** | Sep 2024 to Nov 2025 (19 months) |
| **Type** | B2B 3D design SaaS, 0 to 1 |
| **Scope** | 300+ screens, 32+ user flows |
| **Team** | 20-member cross-functional team: 3D, backend, frontend, QA, design |
| **Users** | 100+ designers |

## Context

Total Environment builds premium residential and villa developments. The client wanted an interior design tool that **anyone can use on the web, with drag and drop in 3D**, and whose 3D data feeds a customer-facing product (the B2C portal, covered separately).

## The problem

The design team of **100+ designers worked in AutoCAD**: powerful, but built for drafting specialists, desktop-bound, and disconnected from what happens after design. The client needed a tool that was **easy enough for everyone to use**, and that produced **structured 3D data** a customer-facing product could build on.

<!-- REFINE: the concrete pain in AutoCAD (time per design, training, handoff errors), with any numbers you can share. -->

## What I owned

I was based **on site at the client's Bangalore office**, which meant I was the product owner in the room every day:

- **Daily requirement gathering** with the client's tech lead, design lead and project leads
- **Stakeholder meetings and alignment** up to CXO level
- **Prioritisation** of a roadmap that kept evolving
- Hiring **2 UI/UX designers** for the project and leading the **20-member cross-functional team** (3D, backend, frontend, QA, design)

## How I ran it: a daily priority loop with the CXOs

Scope evolved constantly, so a fixed quarterly plan would have been fiction. I ran the work **agile, with a daily standup with the CXOs** where priorities for the day were decided. The trade-off was clear: it cost the executives' time every day, but it removed the long wait between a question and a decision, and it kept the build tied to what the client actually needed.

<!-- REFINE: the single hardest prioritisation call (what was cut, delayed or pulled forward, and how it was settled). -->

## What "fully customised" meant

Nothing was left at the standard Foyr Neo defaults. The customisation covered:

- **The client's furniture library**, onboarded into the tool
- **Design tools** shaped to how their designers work
- **Software features and capabilities** built to their requirements

## How I structured a 19-month programme

The scope was too large to run as one list, so I broke it into **deep-dive tracks**, each rated for risk and tracked to done: the component library, rules for each space (kitchen, bathroom, furniture, landscape, fenestration), multi-floor units, electrical, packages, output drawings, external integrations and publishing. Three habits kept it moving:

- **Prove the risky parts first.** Anything that could break the plan got a proof of concept before it was committed: importing the client's 3D models, adding landscape planters without slowing the editor, and multi-floor units.
- **Dependencies had owners and dates.** Every document or API needed from the client or from Foyr was tracked by owner and ETA in a regular status review, so a blocker was visible before it became a delay.
- **Staged deliverables with user feedback after each.** Three deliverables, each followed by a feedback round with the client's users, then a buffer, user acceptance and creation on a live project.

## The decision that shaped the build: a rules engine

Customers can choose from far more combinations than anyone can model by hand, so the tool needed **rules**: what can replace what, what can be added or removed, and what conflicts. The existing rules lived in a fixed format and were hard to extend. My strategy was to **de-risk the change**:

1. **Existing rules keep working** in the new product and in Foyr Neo, with no rewrites
2. **New rules use the same data format** as today's
3. **A rules editor, backward compatible**, lets the client's designers write and publish rules themselves, creating everything the old rules could
4. **Then add new rule types**: spatial and conflict rules, which shape what the customer sees

The build order followed that: make the existing and new rules work in the customer product first, then the editor, then rules inside the design tool.

## Decisions I took to the client

Each status review opened with the open decisions, so nothing waited on a hallway conversation. Examples:

- Show **cost while the customer browses options**, or only after they select?
- If an item **goes out of stock after customers have submitted**, what is the business decision?
- **How much personalisation** do customers get, and what always stays with the architect?
- Where is the **cut-off for modelling** items, such as soft furnishings?
- Should **analytics** be at database level, or a UI for a high-level business view?

<!-- REFINE: your answers to these, and the one that was hardest to settle. -->

## Rollout

The tool was **rolled out to the complete organisation**, not left as a pilot with one team.

<!-- REFINE: how rollout was done (training, phasing, mandate) and any adoption numbers. -->

## Outcome

- Adopted **organisation-wide** at Total Environment
- Design workflows streamlined, with less reliance on external tools such as AutoCAD
- The design data now powers a customer-facing product (the B2C portal, covered separately)

<!-- Screens are confidential at the client's request, so this case study is text only. -->
<!-- REFINE: what I would do differently. -->
