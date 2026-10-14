---
title: Total Environment
year: 2024
role: Associate Product Manager, on-site
tags: [B2B, B2C, 3D, 0 to 1, "300+ screens"]
---

**TL;DR** Total Environment's in-house designers worked in desktop CAD tools, and its home buyers faced a huge number of choices. As the sole on-site PM at the client's Bangalore office, I owned product strategy for **one pipeline in two products**: a web-based drag-and-drop 3D design tool for their designers, and a customer-facing portal where buyers explore and choose in 3D. The tool covered 300+ screens and 32+ flows and went organisation-wide. Per the client's sales team, the portal gave buyers more confidence in their choices.

| | |
| --- | --- |
| **Client** | Total Environment, Bangalore (premium residential and villa developments) |
| **My role** | Associate Product Manager at Foyr, sole on-site PM: requirements, stakeholder alignment, product strategy, prioritisation |
| **Timeline** | Sep 2024 to Nov 2025 (19 months) |
| **Type** | B2B 3D design tool, 0 to 1, feeding a B2C buyer portal |
| **Scope** | 300+ screens, 32+ user flows |
| **Team** | 20-member cross-functional team: 3D, backend, frontend, QA, design |
| **Users** | The client's design team, and its home buyers |

## Context

The client wanted an interior design tool that **anyone can use on the web, with drag and drop in 3D**, and wanted the **3D data from those designs to flow into a customer-facing web product**, where buyers choose their own selections: room sizes, design language, flooring, textures, furniture, electrical and more.

So this was one pipeline: **designers create in the tool, buyers configure in the portal**. Decisions in one half shaped the other.

## The problems

- **Designers:** the in-house team **worked in desktop CAD tools**, and the client wanted a tool easy enough for anyone to use on the web, producing 3D data a customer product could build on.
- **Buyers:** there are **a huge number of combinations**. The problem was not showing options, it was **educating the buyer on everything that is possible** before asking them to choose.

## What I owned

I was based **on site at the client's Bangalore office**, which made me the product owner in the room every day:

- **Daily requirement gathering** with the client's tech lead, design lead and project leads
- **Stakeholder meetings and alignment** up to CXO level
- **Prioritisation** of a roadmap that kept evolving
- Hiring **2 UI/UX designers** for the project and leading the **20-member cross-functional team**

## How I ran it: a daily priority loop with the CXOs

Scope evolved constantly, so a fixed quarterly plan would have been fiction. I ran the work **agile, with a daily standup with the CXOs** where priorities for the day were decided. The trade-off: it cost the executives' time every day, but it removed the long wait between a question and a decision and kept the build tied to what the client needed.

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

## Part 2: The buyer portal

### Strategy: educate, then configure

I framed the product around one idea: **show buyers what is possible, in their own home, before asking them to choose.** The portal lets a buyer explore the home in **3D**, choose **room sizes**, finishes and **furniture**, and configure the layout.

### Making the options manageable

Showing everything possible would overwhelm the buyer, and building every variant by hand would never finish. So the portal runs on rules that decide what a buyer sees and what the design team has to create: what can replace what, how one choice adjusts another, how items fit the space available, and which options are blocked because they cannot physically fit. Rules can also be updated after a unit is published, so changes reach buyers instantly.

### Decisions I took to the client

Each status review opened with the open product decisions (what to show when, how much personalisation buyers get, where to stop modelling, how to measure), so nothing waited on a hallway conversation.

## Outcome

- **Design tool:** adopted **organisation-wide**, with design workflows streamlined and less reliance on external desktop tools
- **Buyer portal:** per the client's sales team, **stronger buyer confidence** in their choices

*Screens are withheld at the client's request.*
