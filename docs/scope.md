# Arise — 66-Day Life Reset

## Idea
A personal transformation web app disguised as an RPG: gamified daily habits tracked across a finite 66-day arc, where the interface mirrors identity change back at the user in real time — and guilt-trips them back when they slip.

## Who It's For
People in a "weird in-between phase" — not completely broken, but not proud of how they're living. Students, early-career people, gym beginners, anime/gaming types, people who know exactly what they should do but can't do it consistently. They've downloaded habit apps before and ghosted them by Week 2. They respond to stakes, momentum, and a little pressure. They don't need a life coach — they need a system that makes discipline feel playable.

## Inspiration & References
- **Life Reset: 66-Day Habit** — validates the finite transformation window concept; stat categories (Confidence, Strength, Discipline, Wisdom, Focus) closely match the vision. 1.4M users confirm the market exists.
  - https://apps.apple.com/us/app/life-reset-66-day-habit/id6478942469
- **MainQuest** — the closest existing UI to the target aesthetic: deep navy/charcoal, cyan and gold glows, glassmorphism, command-center energy.
  - https://www.mainquest.net/
- **Solo Leveling (manhwa/anime)** — philosophical inspiration only. The fantasy that your life has hidden stats, your boring actions are quests, your effort compounds, and you become visibly stronger. NOT borrowing IP, characters, or visual style directly.
- **Duolingo** — re-engagement mechanics reference. Humorous guilt, urgency nudges, streak threats.

**Design energy:** Dark, sharp, intense — not soft or wellness-y. Black/graphite base, deep green or electric cyan accents, muted gold for rewards. Command center, not journal. Big numbers. High contrast. Think premium indie game meets productivity terminal.

## Goals
- Ship a working, demonstrable prototype in 3–4 hours
- Prove the core emotional loop: onboard → get your plan → open the app daily → feel your streak → feel the guilt if you slip
- Use this as a rehearsal and template for a future full product build
- Build something monetizable — not a demo, but a real product foundation

## What "Done" Looks Like
A web app with four functional screens:

1. **Onboarding flow** — 6–10 diagnostic questions (age, current life situation, biggest reason for reset, stress/pride self-assessment, readiness, ambition level, habit targets: wake time, water, cardio, reading, screen time). Outputs a default-difficulty 66-day plan. Feels intimate but not soft — like the app already knows what you're avoiding.

2. **Plan confirmation screen** — shows the user's projected Day 1 stats vs. estimated Day 66 stats. Current rating low, Day 66 rating looks powerful. A vow / "Start my program" moment. Cinematic, not clinical.

3. **Daily dashboard** — the core daily experience:
   - "Day 14 of 66" prominent at top
   - Streak indicator with urgency ("2 days left to lock your 14-day streak")
   - Level bar slowly filling
   - 4–6 quest cards with live status: done, pending, at-risk, easy win
   - Evidence strip: XP earned this week, stat deltas since Day 1, habit consistency %

4. **Re-engagement screen / notification state** — if a user is slipping (no activity logged today, streak at risk), the app switches tone: humorous, slightly threatening, Duolingo-energy. Guilt mechanics with a dark comedy edge.

A judge opening this app should immediately feel: "This is different. This one actually wants something from me."

## What's Explicitly Cut
- **Personalized plan generation** — no dynamic AI-generated plans. Onboarding answers shape the displayed habit targets, but difficulty is a default progression. Saves backend complexity for V2.
- **Weekly difficulty slider** — the "trainer mode" with no-progression/easy/medium/hard preview is a V2 feature.
- **Full progress analytics** — no charts, graphs, or trend dashboards. The evidence strip on the daily dashboard is sufficient proof of change for the prototype.
- **Push/email notifications** — re-engagement is handled in-app (on-screen state change) for the prototype. Real notifications are a V2 infrastructure concern.
- **Multi-user / social features** — no leaderboards, no community campaigns, no friend streaks. Single-user only.
- **Day 66 completion ceremony** — the arc endpoint exists conceptually but the full cinematic payoff screen is post-hackathon scope.

## Loose Implementation Notes
- **Platform:** Web app. Frontend deployed on Vercel; backend (if needed) on Railway.
- **Stack:** To be decided in /spec, but frontend-heavy is appropriate — most of the product is UI state and flow logic.
- **Data persistence:** Minimal for prototype. LocalStorage or a lightweight backend to persist onboarding answers and daily check-ins across sessions.
- **Quest card logic:** Cards need live-feeling status based on time of day and logged completions. The "at-risk" and "easy win" labels are the differentiating interaction detail — worth getting right even in prototype.
- **Re-engagement state:** Can be triggered by a simple rule: if today's quests are less than 50% complete after a certain hour, flip the UI tone. No complex notification infrastructure needed.
