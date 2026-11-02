---
title: POPM Prep
year: 2026
role: Product Manager and builder, solo
tags: [AI, Ed-tech, Side build, MCQ practice]
---

**TL;DR** While preparing for the SAFe Product Owner/Product Manager (POPM) exam, I designed and built my own practice platform with AI tools, so that the way I studied matched the way the exam tests. It is an MCQ assessment-prep product: 374 questions across 14 topics, built mobile-first, and focused on one exam, done deeply.

<video controls loop preload="metadata" playsinline poster="./works/pmpo-portal/poster.jpg" src="./works/pmpo-portal/demo.mp4"></video>

*Product demo (68 seconds).*

| | |
| --- | --- |
| **My role** | Product Manager and builder: scoping, content structure, product design, build with AI tools |
| **Type** | Self-initiated AI product, solo |
| **Scope** | SAFe POPM only, done deeply, rather than a general quiz tool |
| **Content** | 374 questions, 14 topics |
| **Study material** | AI-Empowered SAFe 26.5 workbook |

## Context and user problem

The POPM exam is a multiple-choice assessment. Reading the workbook builds understanding, but it does not tell you whether you can pick the right answer under exam conditions, or where you are weak. I was the user: one person, one exam, one deadline.

## Goal

Turn passive reading into active practice, and make it obvious at any moment where I stand against the exam date.

## Decision and rationale

I chose scope over reach. The platform covers **POPM only, and covers it deeply**, instead of trying to serve several certifications. A narrow product let me make every part of it feel designed around one job: pass this exam.

The demo shows three product ideas that shaped it:

1. **Know where you stand.** A dashboard turns the exam date into a plan: days left, the number of questions still to master, a suggested daily target, a day streak and a predicted score. Mastery only counts a question once you answer it right without marking "Not sure", and correct guesses count half, so the number cannot be flattered.
2. **Every answer teaches.** A wrong answer does not just say "wrong". It shows the right answer and the key theory behind it, so each question is also a mini-lesson.
3. **Adaptive exam simulation.** A 45-question, 90-minute exam that leans on weak topics and missed questions, with at least 40% scenario questions, since scenario questions are where the exam gets hard.

Around those sit spaced-repetition daily review (a ten-minute highest-value session), a weak-topics view, flashcards (recall, then reveal), a concept map to revise from, a study plan with a daily goal, and an activity view.

## What I shipped

A mobile-first practice platform for the SAFe POPM exam, built with AI tools. Walkthrough in the demo video above.

*This is an unofficial study aid. It is not affiliated with Scaled Agile, Inc.; SAFe is a registered trademark of Scaled Agile, Inc.*

## What I would do differently

I would define the success metric before building, for example mock-exam score trend or time to reach a target score, so the platform could prove it worked instead of only being used.
