# ARISE v2 — Requirements

## Concept

A 66-day self-improvement program presented as "The System" from hunter-awakening anime.
The user is a Hunter. The System issues daily quests, tracks XP, levels, rank, and stats,
and punishes failure. The tone is cold, gamified, and ceremonial.

## Quest model

### Mandatory quests (Daily Quests)

Six quests issued every day. Failing to clear all of them by midnight marks the day.

| Quest        | Clear condition                          | Base XP | Stats        |
|--------------|------------------------------------------|---------|--------------|
| Wake Up      | Confirm wake at/before target time       | 50      | DIS+2 FOC+1  |
| Hydration    | Log water >= daily target (L)            | 60      | VIT+2        |
| Cardio       | Complete timer session (target minutes)  | 120     | STR+3 VIT+2  |
| Training     | Complete timer session (target minutes)  | 120     | STR+3 DIS+2  |
| Reading      | Log pages >= daily target                | 80      | INT+3 FOC+2  |
| Screen Limit | Log screen time <= daily cap             | 70      | FOC+2 DIS+2  |

Targets are set during onboarding and editable in settings.

### Side quests (the 12-point system)

Ten optional items worth 12 points total. Daily target: 10 points.

Mind: read 10 pages (2), long-form content (1), academic paper (1), write 200 words (1),
explain a learning (1). Discipline: no phone first 30 min (1), no phone last 30 min (1),
1 hr offline (1). Body: sleep 8+ hrs (2), 20+ min cardio (1).

Side quests pay 30 XP per point, plus small stat gains.

### The 2x rule (Overdrive)

While any mandatory quest is incomplete, side quests pay base XP.
The moment all six mandatory quests clear:

1. An ALL CLEAR bonus of 100 XP is awarded once.
2. Overdrive activates: side quests completed afterwards pay 2x XP.
3. Retroactive top-up: side-quest XP already earned today is paid again
   (so order of completion never matters; everyone lands on 2x).

## Progression

- XP is never revoked. All awards are idempotent (one award per quest/item per day).
- Level curve: XP to advance from level L is `300 + (L - 1) * 75`. Computed iteratively.
- Ranks by level: E 1–5, D 6–12, C 13–20, B 21–29, A 30–39, S 40+.
- Rank-ups trigger a full-screen ceremony overlay.
- Five stats: STR, VIT, INT, DIS, FOC. Gained from quest completions.

## Day lifecycle

- Day N maps to calendar date `programStartDate + (N - 1)`. The app derives the
  current day from the real date, never from open counts.
- Day outcome, evaluated at rollover:
  - CLEARED: all 6 mandatory complete.
  - PARTIAL: 1–5 complete and not given up.
  - FAILED: 0 complete, or the Hunter surrendered the day.
- Streak: consecutive CLEARED days. PARTIAL and FAILED both reset it.
- Milestones lock at days 1, 7, 14, 21, 35, 48, 66 when that day is CLEARED.
  Locked milestones survive rollback. Locking queues a ceremony.
- Daily Report: on the first open of a new day, a gate screen reports each elapsed
  day's outcome, XP, points, streak movement, and penalties before the dashboard.

## Penalty system

- PARTIAL/FAILED day: streak resets; report shows a PENALTY notice.
- 3+ consecutive FAILED days: rollback — XP and stats revert to the last weekly
  snapshot (snapshots saved at days 7, 14, 21, ...). Applied at most once per
  report, never below zero, skipped if no snapshot exists yet.
- System Warning (guilt screen reimagined): from the warning hour (default 20:00),
  if mandatory quests are incomplete, opening or using the dashboard summons a
  warning screen. Options: return to quests (snoozes 30 min) or surrender the day
  (typed confirmation; marks day FAILED, no further warnings).
- Surrendered days cannot earn further XP that day.

## Screens

1. Awakening — boot sequence, "you have been chosen" hook, enter the System.
2. Onboarding — 3 steps: identity (name), quest parameters (targets), the Oath
   (type ARISE to commit). Starts day 1.
3. Dashboard — HUD (rank, level, XP, streak), mandatory quest board, side quest
   panel with points ring and Overdrive state, stats panel, evidence strip.
4. Daily Report — per-day outcome cards, penalties, rollback notice; acknowledge to continue.
5. System Warning — penalty threat with remaining quests.
6. Settings — edit name/targets/warning hour; abandon program (typed confirmation).
7. Program Complete — day 66 done: final level, rank, stats, totals; restart option.
8. Ceremony overlay — rank-up and milestone-lock celebrations above the dashboard.

## Edge cases handled

- Multiple missed days: each elapsed day evaluated in order; report lists all;
  at most one rollback per catch-up; days beyond 66 clamp to program completion.
- Clock moved backwards: derived day < stored day → no-op (keep stored day).
- Midnight while app open: a 30s interval detects date change and triggers rollover.
- Double-award exploits: per-day `xpAwardedFor` map guards every XP source,
  including the ALL CLEAR bonus and the retroactive Overdrive top-up.
- Unchecking a side quest: points drop (target tracking), XP is never clawed back.
- Rollback floor: never below 0 XP / level 1; recomputed rank may drop (rank decay).
- Corrupted/missing localStorage: safe parse, version check, falls back to a fresh state.
- v1 data: ignored (schema key `arise/v2`); the program restarts fresh.
- Timer abandoned mid-session (refresh): timer state is ephemeral; quest stays incomplete.
- Settings changed mid-program: allowed, flagged in state (`settingsUsed`), applies from now.
- Day 66 evaluation: report shows final day, then routes to Program Complete.

## Non-goals

- No backend, accounts, or sync. localStorage only.
- No notifications/PWA work beyond what exists.
- No audio.
