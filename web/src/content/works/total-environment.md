---
title: Total Environment
year: 2024
role: Associate Product Manager, on-site
tags: [B2B, B2C, 3D, 0 to 1, "300+ screens", "100+ designers"]
---

**TL;DR** Total Environment's 100+ designers worked in AutoCAD, and its home buyers faced a huge number of choices. As the sole on-site PM at the client's Bangalore office, I owned product strategy for **one pipeline in two products**: a web-based drag-and-drop 3D design tool for their designers, and a customer-facing portal where buyers explore and choose in 3D. The tool covered 300+ screens and 32+ flows and went organisation-wide. Per the sales team, the portal led to faster conversion, higher sales and stronger buyer confidence.

| | |
| --- | --- |
| **Client** | Total Environment, Bangalore (premium residential and villa developments) |
| **My role** | Associate Product Manager at Foyr, sole on-site PM: requirements, stakeholder alignment, product strategy, prioritisation |
| **Timeline** | Sep 2024 to Nov 2025 (19 months) |
| **Type** | B2B 3D design tool, 0 to 1, feeding a B2C buyer portal |
| **Scope** | 300+ screens, 32+ user flows |
| **Team** | 20-member cross-functional team: 3D, backend, frontend, QA, design |
| **Users** | 100+ designers, and the client's home buyers |

## Context

The client wanted an interior design tool that **anyone can use on the web, with drag and drop in 3D**, and wanted the **3D data from those designs to flow into a customer-facing web product**, where buyers choose their own selections: room sizes, design language, flooring, textures, furniture, electrical and more.

So this was one pipeline: **designers create in the tool, buyers configure in the portal**. Decisions in one half shaped the other.

## The problems

- **Designers:** the team of **100+ worked in AutoCAD**, and the client wanted a tool easy enough for anyone to use on the web, producing 3D data a customer product could build on.
- **Buyers:** there are **a huge number of combinations**. The problem was not showing options, it was **educating the buyer on everything that is possible** before asking them to choose.

<!-- REFINE: the concrete pain in AutoCAD (time per design, training, handoff errors) and how the buyer problem was found (sales feedback, buyer conversations), with any numbers you can share. -->

## What I owned

I was based **on site at the client's Bangalore office**, which made me the product owner in the room every day:

- **Daily requirement gathering** with the client's tech lead, design lead and project leads
- **Stakeholder meetings and alignment** up to CXO level
- **Prioritisation** of a roadmap that kept evolving
- Hiring **2 UI/UX designers** for the project and leading the **20-member cross-functional team**

## How I ran it: a daily priority loop with the CXOs

Scope evolved constantly, so a fixed quarterly plan would have been fiction. I ran the work **agile, with a daily standup with the CXOs** where priorities for the day were decided. The trade-off: it cost the executives' time every day, but it removed the long wait between a question and a decision and kept the build tied to what the client needed.

<!-- REFINE: the single hardest prioritisation call (what was cut, delayed or pulled forward, and how it was settled). -->

## Part 1: The design tool

### What "fully customised" meant

Nothing was left at the standard Foyr Neo defaults. The customisation covered the **client's furniture library**, **design tools** shaped to how their designers work, and **software features and capabilities** built to their requirements.

### How I structured a 19-month programme

The scope was too large to run as one list, so I broke it into **deep-dive tracks**, each rated for risk and tracked to done: the component library, rules for each space (kitchen, bathroom, furniture, landscape, fenestration), multi-floor units, electrical, packages, output drawings, external integrations and publishing. Three habits kept it moving:

- **Prove the risky parts first.** Anything that could break the plan got a proof of concept before it was committed: importing the client's 3D models, adding landscape planters without slowing the editor, and multi-floor units.
- **Dependencies had owners and dates.** Every document or API needed from the client or from Foyr was tracked by owner and ETA in a regular status review, so a blocker was visible before it became a delay.
- **Staged deliverables with user feedback after each.** Three deliverables, each followed by a feedback round with the client's users, then a buffer, user acceptance and creation on a live project.

### The decision that shaped both products: a rules engine

Buyers can choose from far more combinations than anyone can model by hand, so the products needed **rules**: what can replace what, what can be added or removed, and what conflicts. The existing rules lived in a fixed format and were hard to extend. My strategy was to **de-risk the change**:

1. **Existing rules keep working** in the new product and in Foyr Neo, with no rewrites
2. **New rules use the same data format** as today's
3. **A rules editor, backward compatible**, lets the client's designers write and publish rules themselves, creating everything the old rules could
4. **Then add new rule types**: spatial and conflict rules, which shape what the buyer sees

The build order followed that: make existing and new rules work in the customer product first, then the editor, then rules inside the design tool.

### Rollout

The tool was **rolled out to the complete organisation**, not left as a pilot with one team.

<!-- REFINE: how rollout was done (training, phasing, mandate) and any adoption numbers. -->

## Part 2: The buyer portal

### Strategy: educate, then configure

I framed the product around one idea: **show buyers what is possible, in their own home, before asking them to choose.** The portal lets a buyer explore the home in **3D**, choose **room sizes**, pick a **design language**, select **flooring and textures**, choose **furniture** and configure **electrical** layouts.

<!-- REFINE: how the choice flow is structured (guided steps vs free exploration, defaults, how options are limited so it does not overwhelm). -->

### Making the options manageable

Showing everything possible would overwhelm the buyer, and building every variant by hand would never finish. So the portal runs on rules that decide what a buyer sees and what the design team has to create:

| Rule type | What it does | Why it matters |
| --- | --- | --- |
| **Replace, add, remove** | Defines what can swap for what in a design | Buyers customise within what actually works |
| **Cross-category** | One choice adjusts another, for example the counter depth and cabinet size follow the basin chosen | Options stay consistent with each other |
| **Spatial zones** | Defines areas for replacement, so a bed can be swapped for another size without a separate design for each | Fewer options for designers to build |
| **Spatial placement** | Items align to the space available, for example bedside units fit the clear wall length | No hand-built packages for every layout |
| **Conflict** | Blocks an option that can't physically fit, for example tall units where there is a beam or false ceiling | Fewer wrong options shown to the buyer |

Rules can also be updated after a unit is published, so a **new customisation, an out-of-stock item or a change in the default offering** reaches buyers instantly.

### Decisions I took to the client

Each status review opened with the open decisions, so nothing waited on a hallway conversation. Examples:

- Show **cost while the buyer browses options**, or only after they select?
- If an item **goes out of stock after buyers have submitted**, what is the business decision?
- **How much personalisation** do buyers get, and what always stays with the architect?
- Where is the **cut-off for modelling** items, such as soft furnishings?
- Should **analytics** be at database level, or a UI for a high-level business view?

<!-- REFINE: your answers to these, and the one that was hardest to settle. -->

### Design language

The interface is a frame around the home: warm stone neutrals, **black for where the buyer is**, **brick red for their decision** (the selected option, the running price, the primary exit) and **green only for a confirmed choice**.

<a href="./works/total-environment/design-language.png" target="_blank" rel="noopener noreferrer"><img src="./works/total-environment/design-language.png" alt="Customer configurator design language board: colour, typography, components, contrast, shape and spacing" /></a>

<!-- Reference board only: tokens and component styles, no product data or screens. Values approximated from the interface. -->

## Outcome

- **Design tool:** adopted **organisation-wide**, with design workflows streamlined and less reliance on external tools such as AutoCAD
- **Buyer portal:** per the sales team, **faster conversion, higher sales and stronger buyer confidence** across premium residential and villa developments

<!-- REFINE: any conversion, sales-cycle or adoption numbers you can share; otherwise keep this qualitative and attributed to the sales team. -->
<!-- Screens are confidential at the client's request, so this case study is text only. -->
<!-- REFINE: what I would do differently. -->
