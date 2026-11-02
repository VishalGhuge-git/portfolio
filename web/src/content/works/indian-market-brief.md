---
title: Indian Stock Market News Brief
year: 2026
role: Product Manager and builder, solo
tags: [AI, Automation, Newsletter, Side build]
---

**TL;DR** Every morning my family asked, "What happened in the market?" The answer was spread across app alerts, forwarded tips, broker PDFs and TV tickers: too many sources, too little signal. I built a daily email where an AI agent does the reading, cross-checks every number against sources, and sends one 6-to-8-minute brief. I built it as a PM, not an engineer.

<video class="is-tall" controls loop preload="metadata" playsinline poster="./works/indian-market-brief/poster.jpg" src="./works/indian-market-brief/demo.mp4"></video>

*Product demo (52 seconds).*

| | |
| --- | --- |
| **My role** | Product Manager and builder: scope, editorial rules, automation set-up |
| **Type** | Self-initiated AI product, solo |
| **Delivery** | One email every morning, around 8:30 AM IST, from a scheduled task that runs unattended |
| **Audience** | Me and a small private list of family readers |

## Context and user problem

The users are a few people who want to stay informed about the Indian stock market without opening five sources. Their problem was not a lack of information. It was noise: hot takes, "this will double" tips and numbers that disagree with each other.

## Goal

One short, trustworthy email each morning that covers only what they want to read, with every number either confirmed or clearly labelled.

## Decision and rationale

The core product decision was to treat **trust as the feature**. The agent runs each morning, searches several named sources for the market close, results and flows, and then applies a simple rule to every item:

| Check | What the brief does |
| --- | --- |
| Three sources agree | Marked **confirmed** |
| Sources differ | Shows the **range** instead of picking one |
| A reversal or odd item is found | **Flags** it |
| Only one source | Marked **unconfirmed** |
| A tip with no source | **Dropped** |

Other scope choices:

- **Stock-specific news plus a one-line index close.** No macro or global-cues section, because that was the noise I was removing.
- **Analyst filter.** Written the way an experienced analyst would, separating signal from noise.
- **Weekend edition.** A lighter, playful format with games and quizzes; weekdays stay in plain analyst style.
- **Kept the build small on purpose.** No email-marketing platform, no code repository or deployment and no database. The problem only needed a scheduled AI task that sends email through a connector, so that is all I built. I used a separate, dedicated sender account so the automation never touches my personal inbox.

## What I shipped

A scheduled daily email with a clean layout: the day's numbers, the noise, the sources behind every figure, and a short disclaimer that it is informational only. Walkthrough in the demo video above.

## What I would do differently

I would add an automatic check before each send, flagging any figure that is missing or unverified, and track which sections readers actually open.
