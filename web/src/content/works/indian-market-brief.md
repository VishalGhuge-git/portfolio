---
title: Indian Stock Market News Brief
year: 2026
role: Product Manager and builder, solo
tags: [AI, Automation, Newsletter, Side build]
---

**TL;DR** A fully automated daily email that gives me and a small private list the stock-specific news from Indian markets, filtered for signal over noise, so nobody has to check five sources every morning. I scoped it, set the editorial rules, and run it as a scheduled AI task.

| | |
| --- | --- |
| **My role** | Product Manager and builder: scope, editorial rules, automation set-up |
| **Type** | Self-initiated AI product, solo |
| **Delivery** | Email, every morning at about 8:30 AM IST |
| **Audience** | A small private list, planned to stay under 50 readers |

## Context and user problem

Keeping up with Indian stock news means opening several sources, most of which mix useful news with macro commentary and noise. I wanted myself and my family to stay informed without that daily effort.

## Goal

One short, trustworthy email each morning that covers only what I want to read.

## Decision and rationale

I considered running it as a scheduled job from a code repository, then dropped that idea and chose a scheduled AI task that sends the email through a connector. Two product decisions shaped it:

- **Scope:** stock-specific news plus a one-line index close. No macro or global-cues section, because that was the noise I was trying to remove.
- **Voice:** written through an experienced-analyst filter that separates signal from noise, using verified data rather than loose summaries.

I also chose a separate, dedicated sender account instead of connecting my main inbox, so the automation never touches personal email.

## What I shipped

A scheduled daily email with a professional layout, delivered automatically each morning. I kept tightening it based on what I wanted from it: more detail and insight, and real verified numbers.

## What I would do differently

I would add a simple quality check on every edition, such as flagging missing or unverified figures before sending, and track which sections readers actually open.
