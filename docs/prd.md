# Arise — Product Requirements

## Problem Statement

People who know exactly what they should do — wake early, train, read, limit screens — can't make themselves do it consistently. Every habit app they've tried flatters them into a comfortable routine and they ghost it by Week 2. They don't need encouragement; they need a system that creates real stakes, mirrors their own inertia back at them, and makes discipline feel like a game they're winning. Arise addresses this with a finite 66-day arc, punitive rollback mechanics, a judgment-voiced onboarding, and a daily experience that rewards completion and punishes avoidance with the same system.

---

## User Stories

### Epic: Onboarding — First Entry

- As a first-time visitor, I want to feel like I'm entering something intentional before I answer any questions, so that the app feels different from every other form-based habit tracker I've abandoned.
  - [ ] App opens to a dark threshold screen: Arise mark centered, subtle ambient motion, one line of charged copy (e.g. "You are not starting over. You are starting awake."), and a single CTA: "Begin Assessment"
  - [ ] No questions appear until the user taps "Begin Assessment"
  - [ ] Threshold screen does not auto-advance; it waits for a tap

- As a first-time visitor, I want to answer diagnostic questions that feel honest and slightly confrontational, so that I'm forced to be truthful about where I actually am.
  - [ ] Questions are presented one at a time, full screen — no progress bar showing how many are left
  - [ ] Quantitative questions (age, wake time, water intake, cardio duration, training duration, reading pages, screen-time cap) use sliders with visible target values
  - [ ] Qualitative questions (life situation, reason for reset, stress/pride self-assessment, readiness, ambition level) use multiple-choice options
  - [ ] Option copy for qualitative questions carries a judgmental tone — specific enough to sting (e.g. "I've been saying 'I'll start Monday' for months" not "I want to improve")
  - [ ] Onboarding collects exactly these data points: age, current life situation, biggest reason for reset, stress/pride self-assessment, readiness, ambition level, target wake time, daily water intake (liters), weekly cardio sessions + duration, weekly training sessions + duration, daily reading (pages), daily screen-time cap (hours)
  - [ ] User cannot proceed past a question without making a selection or moving a slider
  - [ ] No question is skipped

- As a first-time visitor, I want to see what I could become by Day 66 before I commit, so that I feel the gap between my current self and my potential self clearly.
  - [ ] After onboarding, user lands on a plan confirmation screen showing "You, Today" vs "Day 66 Projection"
  - [ ] Today section shows: Level 1, 0 XP, a thin muted progress bar, subtext "This is your starting point"
  - [ ] Day 66 section shows: projected level (e.g. Level 34), projected XP (e.g. 12,850), a bright full progress bar, payoff copy (e.g. "This is who you become if you stay with the system")
  - [ ] Five stat rows displayed between the two sections: Wisdom, Confidence, Strength, Discipline, Focus — each showing 0 → projected Day 66 value
  - [ ] Stat rows animate on load — values expand visually, not just appear
  - [ ] Projected values are calculated from onboarding inputs: harder targets and more habits produce higher projections
  - [ ] Primary CTA at bottom: "Claim This Path" — leads to the commitment screen, not directly to the dashboard

- As a first-time visitor, I want a brief vow moment before starting the program, so that the decision to begin feels weighty and deliberate.
  - [ ] After tapping "Claim This Path," user sees a Commitment screen: full-screen dark background, short vow copy framed as a promise to oneself, single final CTA: "Start My Program"
  - [ ] Tapping "Start My Program" immediately loads the Day 1 daily dashboard — no delay, no loading interstitial
  - [ ] The vow copy acknowledges setbacks ("even when you slip") — it's a commitment, not a boast

---

### Epic: Daily Dashboard — Core Daily Loop

- As a user mid-program, I want to see exactly where I am in my 66-day journey the moment I open the app, so that the arc feels real and not abstract.
  - [ ] Dashboard header shows: "Day [N] of 66" prominently at top
  - [ ] Streak indicator directly below with urgency copy (e.g. "2 days left to lock your 14-day streak" or "Day 7 streak — locked")
  - [ ] XP level bar below streak: current level number, XP to next level, bar fill proportion
  - [ ] All three header elements update in real time as quests are completed during the day

- As a user on any given day, I want each quest card to tell me exactly what's required and how urgent it is in one glance, so that I can decide what to do next without thinking.
  - [ ] Each quest card contains: icon + quest title, exact target (e.g. "30 min"), today's frequency context (e.g. "Session 2 of 4 this week"), status chip, XP reward with stat gains (e.g. "+80 XP · +Strength · +Focus"), tap action CTA
  - [ ] Status chips use exactly four states: Done (green), Pending (neutral), At-Risk (amber/red), Easy Win (soft highlight)
  - [ ] Status logic:
    - **Done**: quest completed today
    - **Pending**: incomplete, time/flexibility still available without stress
    - **At-Risk**: window is closing (e.g. high-effort task late in the day, or last weekly slot running out)
    - **Easy Win**: incomplete, low-effort, completable in under a few minutes
  - [ ] At-Risk triggers when: high-effort tasks (cardio, training, reading) remain incomplete in the final ~3 hours of the user's day; OR it's the last day of the week for a non-daily task
  - [ ] Status chips update dynamically — they change as time passes without requiring a page refresh
  - [ ] Dashboard shows 4–6 quest cards based on the user's configured habit targets

- As a user completing a quest, I want the logging experience to match the type of task, so that checking off my work feels honest rather than fake.
  - [ ] **Wake time**: single tap "I woke at target time" — logs immediately
  - [ ] **Water**: incremental input — user logs current consumption (e.g. 0.5L, then +0.3L later); card updates running total vs. target
  - [ ] **Cardio / Training**: tapping CTA starts a countdown timer set to the session duration target; user can end early (marks as partial) or complete (marks Done)
  - [ ] **Reading**: user inputs pages read; card accumulates toward daily target
  - [ ] **Screen time**: user opens phone's Digital Wellbeing / Screen Time app, reads their number, enters it manually; card marks Done if at or under cap
  - [ ] All completed quests show a Done chip and visual completion state; XP animates into the level bar

- As a user, I want to see proof that the program is working without digging for it, so that I stay motivated through the long middle of the 66-day arc.
  - [ ] Evidence strip appears at the bottom of the dashboard (below quest cards)
  - [ ] Evidence strip shows three data points: XP earned this week, stat deltas since Day 1 (e.g. "+47 Discipline"), habit consistency % (e.g. "83% of days complete")
  - [ ] Tone is 70–80% proof ("Your effort is adding up"), 20–30% pressure (gaps are visible but not dominant)
  - [ ] Evidence strip does not require a tap to expand — it's visible in the default scroll position

---

### Epic: Day Transitions — Between Days

- As a user opening the app at the start of a new day, I want a brief acknowledgement of yesterday before the new day's quests appear, so that the arc feels continuous and consequential.
  - [ ] App shows a brief transition screen when a new day is detected (midnight cutover or first open after midnight)
  - [ ] If yesterday was fully completed: transition screen shows an encouraging message + "Day [N] begins" — celebratory but not excessive
  - [ ] If yesterday was partially completed: transition screen shows rolled-over tasks and notes the penalty; copy carries weight without being demoralizing
  - [ ] Rolled-over tasks (cardio, training, reading, meditation) are added to today's quest cards as additional requirements
  - [ ] Wake-up and water targets are NOT rolled over — they reset daily regardless
  - [ ] After the transition screen, user lands directly on the new day's dashboard

- As a user who hits a streak milestone, I want a lightweight reward moment that records it permanently, so that hitting 14 days (or 21, or 35) feels like crossing a real threshold.
  - [ ] Milestone days: Day 1, Day 7, Day 14, Day 21, Day 35, Day 48, Day 66
  - [ ] On milestone completion, app shows a dedicated reward screen: milestone name, "Streak Locked" state, a brief System message (identity-framing copy, e.g. "You are no longer trying. You've entered a new phase.")
  - [ ] Milestone is permanently recorded — visible in the streak indicator copy ("Day 14 — Locked")
  - [ ] Milestone reward screen is a one-time moment; it does not repeat on subsequent opens

---

### Epic: Re-engagement — Guilt & Accountability

- As a user who is falling behind on a given day, I want the app to confront me when I open it past my configured trigger time, so that avoidance has consequences.
  - [ ] User can configure a daily re-engagement trigger time in Settings (e.g. 8:00 PM)
  - [ ] If user opens app after trigger time AND daily quest completion is below 50%, the guilt screen replaces the dashboard
  - [ ] Guilt screen uses a light-novel / visual novel chat interface layout
  - [ ] Messages appear as if sent by "System:" — name displayed on each message
  - [ ] Message pool contains at least 90 messages cycling across three tones: dry sarcasm, genuine disappointment, aggressive pressure
  - [ ] Each app open after trigger time draws a different message from the pool — not sequential, not immediately repeating
  - [ ] Snooze is available up to 3 times; each snooze dismisses the guilt screen for 30 minutes
  - [ ] On the 4th encounter (after 3 snoozes), snooze option is removed
  - [ ] 4th encounter shows only two options: "Give Up on Today" or "I'll Do It" (returns to dashboard)

- As a user choosing to give up on a day, I want clear consequences applied immediately, so that the decision feels real and not consequence-free.
  - [ ] Tapping "Give Up on Today" triggers a System message: "I'm disappointed in you." — displayed before the dashboard reloads
  - [ ] Non-daily tasks (cardio, training, reading, meditation) are added to tomorrow's quest cards as rolled-over requirements — they stack if give-up days are consecutive
  - [ ] Wake-up and water targets are NOT rolled over
  - [ ] Give-up day counts as a failure day for the 3-day reset tracker
  - [ ] Not opening the app at all on a given day is treated identically to Give Up

- As a user who fails for 3 consecutive days, I want the system to roll back my progress, so that long avoidance has real cost.
  - [ ] After 3 consecutive failure days, the system applies a progression rollback
  - [ ] Rollback restores the day counter, XP total, and all five stat values to the state saved at the previous 7-day checkpoint
  - [ ] Examples: failing on Days 19–21 rolls back to Day 14 state; failing Days 22–24 rolls back to Day 14 again (if no new checkpoint was reached); if the rollback target is Day 0, program restarts from the beginning
  - [ ] Rollback is announced with a System message on next app open: "I'm disappointed in you." plus rollback details
  - [ ] App takes a daily snapshot of the user's full state (day counter, XP, stats, quest history) — these snapshots are the rollback targets

---

### Epic: Settings & Exit

- As a user who needs to recalibrate their targets after starting, I want one opportunity to adjust my habit targets before I'm locked in, so that the program reflects my actual capacity.
  - [ ] Settings screen is accessible from the dashboard (icon or menu)
  - [ ] On first access: settings shows all adjustable habit targets (wake time, water, cardio duration, training duration, reading pages, screen-time cap)
  - [ ] User can modify any target and save once
  - [ ] After saving, the settings screen permanently replaces the target-editing UI with a single option: "Give Up on Program"
  - [ ] The one-time adjustment is enforced: once saved, targets cannot be changed again

- As a user who wants to formally end the program, I want a deliberate exit option (not buried), so that quitting is a conscious decision with weight.
  - [ ] "Give Up on Program" (post-settings-lock state) shows a confirmation: System message + "Are you sure?" + two options: "Yes, I'm done" and "No, keep going"
  - [ ] Confirming ends the 66-day program and returns the user to the onboarding/threshold screen for a potential restart
  - [ ] Program end is recorded (partial run history)

---

## What We're Building

The complete prototype covers these behaviors, verifiable by looking at the screen:

1. **Threshold screen** — dark atmospheric entry screen with ambient motion, charged copy, "Begin Assessment" CTA
2. **Onboarding flow** — 8–9 questions (sliders for quantitative, judgment-voiced options for qualitative), one at a time, no skipping
3. **Plan confirmation screen** — animated Day 1 vs Day 66 stat comparison across 5 stats + level + XP, with "Claim This Path" CTA
4. **Commitment screen** — vow copy + "Start My Program" CTA leading directly to dashboard
5. **Daily dashboard** — Day N of 66 header, streak indicator with milestone lock state, XP level bar, 4–6 quest cards with dynamic status chips (Done / Pending / At-Risk / Easy Win), evidence strip
6. **Task logging** — five distinct logging flows: wake tap, water increment, workout timer, reading page input, screen-time manual entry
7. **Day transition screen** — new-day acknowledgement with full/partial completion branching, rolled-over tasks applied
8. **Streak milestone screens** — lightweight reward moment at Days 1, 7, 14, 21, 35, 48, 66 with "Streak Locked" System message
9. **Re-engagement guilt screen** — light-novel chat interface, "System:" voice, 90-message pool across 3 tones, 3-snooze mechanic, 4th-encounter forced choice
10. **Progression rollback** — daily snapshots, 3-consecutive-failure trigger, full rollback of day counter + XP + stats to previous 7-day checkpoint
11. **Settings** — one-time target adjustment, then permanently becomes "Give Up on Program"

---

## What We'd Add With More Time

- **Day 66 completion ceremony** — full cinematic payoff screen celebrating program completion; currently the milestone reward handles Day 66 but without the full treatment it deserves
- **Push / local notifications** — external re-engagement nudges at the configured trigger time rather than requiring the user to open the app first
- **Personalized plan generation via AI** — onboarding answers currently produce a default-difficulty plan; a smarter system would generate a truly customized progression curve
- **Weekly difficulty slider** — trainer mode letting users preview no-progression / easy / medium / hard curves and switch between them at the start of each week
- **Full progress analytics** — charts, trend lines, and streak history; the evidence strip covers this minimally for the prototype
- **Run history** — persistent record of past completed and abandoned 66-day runs
- **Social / leaderboard features** — friend streaks, community campaigns; explicitly out of scope for the single-user prototype

---

## Non-Goals

1. **Push notifications** — re-engagement is triggered on app open, not externally. OS-level notification infrastructure is V2.
2. **AI-generated plans** — onboarding answers shape visible habit targets, but the difficulty progression is a default system. No dynamic plan generation.
3. **Multi-user or social features** — no leaderboards, no friend streaks, no community. Single-user only.
4. **Backend user accounts / authentication** — the prototype uses local storage or a lightweight session. No sign-up, no login, no cloud sync.
5. **Biometric or calendar integrations** — screen time is manually self-reported; wake time is a tap. No OS integrations for the prototype.

---

## Open Questions

1. **90-message guilt content** — the message pool (90 messages × 3 tones) needs to be written before or during build. Does Sharath want to write these, or should the agent generate them during `/build`? Needs to be resolved before `/build` starts. *(Resolve before /spec or early in /build)*

2. **Stat projection formula** — exactly how are Day 66 stat projections calculated from onboarding inputs? A simple formula (e.g. base + habits × multiplier) needs to be defined so the plan confirmation screen produces consistent, believable numbers. *(Resolve before /spec)*

3. **Day boundary definition** — does a new day trigger at midnight, or at a configurable "sleep time"? If a user is awake past midnight, when does the app flip to "Day 16"? *(Resolve before /build)*

4. **Partial timer completion for cardio/training** — if the user starts a 30-min timer and stops at 22 min, is that a partial credit toward the target or a failure? *(Can wait until /build)*
