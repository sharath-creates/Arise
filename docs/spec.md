# Arise — Technical Specification

## Stack

| Layer | Tool | Version | Docs |
|-------|------|---------|------|
| Framework | React | 19 | [react.dev](https://react.dev) |
| Build tool | Vite | 8 | [vite.dev](https://vite.dev) |
| Styling | Tailwind CSS | v4 | [tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4) |
| Components | shadcn/ui | latest | [ui.shadcn.com/docs/installation/manual](https://ui.shadcn.com/docs/installation/manual) |
| Persistence | Browser LocalStorage | native | — |
| Deployment | Vercel | — | [vercel.com/docs/frameworks/frontend/vite](https://vercel.com/docs/frameworks/frontend/vite) |

**Rationale:** Pure frontend — no backend, no auth, no cloud sync (per `prd.md > Non-Goals`). All state lives in LocalStorage. shadcn/ui components are copied into the project (no library lock-in), which makes AI-assisted building more effective. Tailwind v4 uses a CSS-first config that simplifies custom theming for the dark command-center aesthetic.

---

## Runtime & Deployment

- **Platform:** Web app, mobile-first. Must render well on a phone screen (iOS Safari + Android Chrome).
- **PWA:** `public/manifest.json` + service worker enables "Add to Home Screen" on iOS/Android — gives native app feel (no browser chrome, full screen). Required for alpha testing on Sharath's phone.
- **Deployment:** Vercel. Connect GitHub repo → every push to `main` auto-deploys. Free tier, no size concerns for this project.
- **Local dev:** `npm run dev` → `localhost:5173`
- **No environment variables required** — no API keys, no backend URLs.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      App.jsx                            │
│          (top-level screen controller)                  │
│   reads AppContext → decides which screen to render     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴──────────┐
         │     AppContext.jsx    │
         │  (React Context +    │
         │   useReducer)        │
         │  syncs to/from       │
         │  LocalStorage        │
         └───────────┬──────────┘
                     │
     ┌───────────────┼───────────────────────────────┐
     │               │                               │
┌────▼─────┐  ┌──────▼──────┐               ┌───────▼──────┐
│ screens/ │  │   logic/    │               │    hooks/    │
│ 9 screen │  │ pure fns:   │               │ midnight     │
│ components│ │ questStatus │               │ check,       │
│           │ │ statProject │               │ guilt        │
│           │ │ rollback    │               │ trigger      │
│           │ │ dayTransit  │               └──────────────┘
│           │ │ xp          │
└───────────┘ └─────────────┘
```

**Data flow — quest completion (critical path):**
```
User taps quest CTA on DashboardScreen
  → QuestCard dispatches logQuestCompletion({ questType, value })
  → reducer.js updates dailyLog[currentDay] + programState.currentXP + stats
  → localStorage.js syncs full state
  → QuestCard re-renders with Done chip
  → XPLevelBar animates new XP value
```

**Data flow — midnight rollover:**
```
useMidnightCheck (setInterval, 60s) detects date change
  → dispatches ADVANCE_DAY
  → reducer: saves snapshot if 7-day checkpoint
              applies rolled-over tasks from today
              resets quest completions for new day
              increments currentDay
              checks consecutiveFailureDays → triggers rollback if ≥ 3
  → App.jsx transitions to DayTransitionScreen
```

**Screen state machine:**
```
THRESHOLD → ONBOARDING → PLAN_CONFIRMATION → COMMITMENT
                                                   ↓
                         SETTINGS ←→ DASHBOARD ←→ DAY_TRANSITION
                                         ↓               ↓
                                   GUILT_SCREEN    MILESTONE_REWARD
```

No React Router. `App.jsx` reads `appState.currentScreen` from context and renders the matching screen component. All navigation is via `dispatch({ type: 'NAVIGATE', screen: 'DASHBOARD' })`.

---

## Screens

### ThresholdScreen
*Implements `prd.md > Onboarding — First Entry` (story 1)*

- Dark full-screen view. Arise mark centered. Ambient motion (CSS keyframe animation — slow pulse or particle drift, no library needed).
- Charged copy line: "You are not starting over. You are starting awake."
- Single CTA button: "Begin Assessment"
- Does not auto-advance. Waits for tap.
- On tap: dispatch `NAVIGATE` → `ONBOARDING`, step 0.

### OnboardingScreen
*Implements `prd.md > Onboarding — First Entry` (story 2)*

- Renders one question at a time, full screen. No progress bar.
- Question sequence (9 questions total):

| # | Field | Input type |
|---|-------|-----------|
| 1 | Age | Slider (13–60) |
| 2 | Current life situation | Multiple choice (4 options, judgmental tone) |
| 3 | Biggest reason for reset | Multiple choice (4 options, judgmental tone) |
| 4 | Stress/pride self-assessment | Multiple choice (4 options) |
| 5 | Readiness | Multiple choice (4 options) |
| 6 | Ambition level | Multiple choice (4 options) |
| 7 | Target wake time | Slider (4:00 AM – 10:00 AM, 15-min increments) |
| 8 | Quantitative habits (water, cardio sessions+duration, training sessions+duration, reading pages, screen-time cap) | Multiple sliders on one screen |
| 9 | Daily re-engagement trigger time | Slider (6:00 PM – 11:00 PM, 30-min increments) |

- User cannot advance without making a selection or moving a slider.
- On completion: dispatch `COMPLETE_ONBOARDING` → saves `userProfile` to LocalStorage → navigate to `PLAN_CONFIRMATION`.

### PlanConfirmationScreen
*Implements `prd.md > Onboarding — First Entry` (story 3)*

- Two-column layout: "You, Today" vs "Day 66 Projection"
- Today: Level 1, 0 XP, empty progress bar, "This is your starting point"
- Day 66: projected level (computed), projected XP (computed), full bar, payoff copy
- Five stat rows (Wisdom, Confidence, Strength, Discipline, Focus): 0 → projected value. Animate on mount — values count up from 0.
- Projected values calculated via `logic/statProjection.js` (see Data Model section)
- CTA: "Claim This Path" → navigate to `COMMITMENT`

### CommitmentScreen
*Implements `prd.md > Onboarding — First Entry` (story 4)*

- Full-screen dark background. Short vow copy. Acknowledges setbacks.
- Single CTA: "Start My Program"
- On tap: dispatch `START_PROGRAM` → sets Day 1 state → navigate immediately to `DASHBOARD`. No loading screen.

### DashboardScreen
*Implements `prd.md > Daily Dashboard — Core Daily Loop`*

- Header: "Day [N] of 66" prominent. Streak indicator. XP level bar. All update in real time as quests complete.
- 4–6 quest cards rendered from `getQuestCards(userProfile, dailyLog[currentDay], now)` — computed, not stored.
- Evidence strip pinned below quest cards (see `EvidenceStrip` component).
- On mount and on every minute tick: re-evaluate quest status chips (At-Risk changes over time).
- Guilt trigger: `useGuiltTrigger` hook checks time vs. `userProfile.triggerTime` + completion % → dispatches `SHOW_GUILT` if conditions met.

### DayTransitionScreen
*Implements `prd.md > Day Transitions — Between Days`*

- Shown on first app open after midnight (detected by `useMidnightCheck`).
- Branches:
  - **Full completion:** encouraging message + "Day [N] begins" + continue CTA
  - **Partial/give-up:** rolled-over tasks listed + penalty note + continue CTA
- Copy carries weight but is not demoralizing.
- On continue: navigate to `DASHBOARD` for new day.

### MilestoneScreen
*Implements `prd.md > Day Transitions — Between Days` (milestone story)*

- Shown once on completing milestone days: 1, 7, 14, 21, 35, 48, 66.
- Content: milestone name, "Streak Locked" state, identity-framing System message.
- Milestone recorded in `programState.lockedMilestones`. Screen never repeats.
- On continue: navigate to `DASHBOARD`.

### GuiltScreen
*Implements `prd.md > Re-engagement — Guilt & Accountability`*

- Replaces dashboard (not a modal overlay — full screen swap).
- Light-novel / visual novel chat interface. Messages appear as "System:" with name on each bubble.
- Draws message from `data/guiltMessages.js` using tone-aware random selection (no immediate repeat, no sequential order).
- Snooze button available for first 3 encounters (snooze dismisses for 30 min).
- 4th encounter: snooze removed. Two options only: "Give Up on Today" or "I'll Do It."
- "I'll Do It" → navigate to `DASHBOARD`.
- "Give Up on Today" → dispatch `GIVE_UP_TODAY` → show "I'm disappointed in you." System message → navigate to `DASHBOARD` with give-up state applied.

### SettingsScreen
*Implements `prd.md > Settings & Exit`*

- Accessible from dashboard header (gear icon).
- **First visit:** shows all adjustable targets (wake time, water, cardio duration, training duration, reading pages, screen-time cap) + re-engagement trigger time. Save button.
- **After save:** settings permanently shows only "Give Up on Program" option. Target editing is gone.
- "Give Up on Program" → confirmation dialog: System message + "Are you sure?" + "Yes, I'm done" / "No, keep going."
- "Yes, I'm done" → dispatch `ABANDON_PROGRAM` → navigate to `THRESHOLD` (fresh start).

---

## Components

### QuestCard
*Used by `DashboardScreen`*

Props: `questType`, `questData` (from computed quest list), `dispatch`

Renders:
- Icon + quest title
- Exact target (e.g. "30 min")
- Weekly frequency context (e.g. "Session 2 of 4 this week")
- Status chip: Done (green) / Pending (neutral) / At-Risk (amber) / Easy Win (cyan highlight)
- XP reward + stat gains (e.g. "+120 XP · +Strength · +Discipline")
- Logging CTA — behavior varies by quest type:

| Quest type | CTA behavior |
|-----------|-------------|
| Wake time | Single tap → logs immediately |
| Water | Increment input — running total vs. target |
| Cardio / Training | Starts countdown timer; user can end early (partial) or complete |
| Reading | Page input; accumulates toward daily target |
| Screen time | Manual number entry; marks Done if ≤ cap |

- XP animates into `XPLevelBar` on completion.

### EvidenceStrip
*Used by `DashboardScreen`*

Three data points, always visible (no tap to expand):
1. XP earned this week
2. Stat deltas since Day 1 (e.g. "+47 Discipline")
3. Habit consistency % (e.g. "83% of days complete")

Tone: 70% proof, 30% pressure. Computed from `dailyLog` + `programState`.

### XPLevelBar
Props: `currentXP`, `currentLevel`, `xpToNextLevel`

- Shows level number, XP fraction, animated bar fill.
- Animates on XP change (CSS transition on width).
- Level formula: `level = Math.floor(totalXP / 400) + 1`
- XP to next level: `400 - (totalXP % 400)`

### StreakIndicator
Props: `streakDays`, `lockedMilestones`, `currentDay`

- Shows current streak count with urgency copy.
- Copy variants: "Day [N] streak — locked" (if on milestone day) / "[N] days left to lock your [M]-day streak" (approaching milestone) / "[N]-day streak" (standard).
- Milestone days: 1, 7, 14, 21, 35, 48, 66.

### StatRow
Props: `statName`, `currentValue`, `projectedValue`, `animate`

- Used on `PlanConfirmationScreen`.
- When `animate=true`, value counts up from 0 to `projectedValue` on mount.

### SystemMessage
Props: `message`, `tone` (`sarcasm` | `disappointment` | `pressure`)

- Renders a chat bubble prefixed with "System:"
- Used in `GuiltScreen`, `CommitmentScreen`, rollback announcement on `DayTransitionScreen`.

---

## Logic (Pure Functions)

### logic/questStatus.js
*The most important logic file in the app.*

```
getQuestCards(userProfile, todayLog, now) → QuestCard[]
```

Each card's status chip is computed as follows:

| Status | Condition |
|--------|-----------|
| **Done** | Quest completed today (logged in `todayLog`) |
| **Easy Win** | Incomplete AND low-effort quest (wake tap, water tap, screen-time entry) AND not past trigger time |
| **At-Risk** | High-effort quest (cardio, training, reading) AND current time ≥ 9 PM OR it is the last day of the week for a non-daily task AND sessions remaining = 1 AND incomplete |
| **Pending** | Everything else incomplete |

"High effort" = cardio, training, reading. "Low effort" = wake, water, screen time.

Weekly task tracking: cardio and training have a sessions-per-week target. Track completions in current 7-day window. If `weeklyTarget - completions = 1` AND today is Sunday (or last day of the user's week), status = At-Risk regardless of time.

Status chips update dynamically — `DashboardScreen` re-evaluates every 60 seconds via `setInterval`.

### logic/statProjection.js

**Stat gain per quest completion:**

| Quest | Stat 1 | Gain | Stat 2 | Gain |
|-------|--------|------|--------|------|
| Wake time | Discipline | +2 | Focus | +1 |
| Water | Confidence | +2 | — | — |
| Cardio | Strength | +3 | Discipline | +2 |
| Training | Strength | +3 | Discipline | +2 |
| Reading | Wisdom | +3 | Focus | +2 |
| Screen time | Wisdom | +2 | Focus | +2 |

**XP per quest completion:**

| Quest | XP |
|-------|----|
| Wake time | 50 |
| Water | 60 |
| Cardio | 120 |
| Training | 120 |
| Reading | 80 |
| Screen time | 70 |

**Day 66 projection formula:**
```
projectedXP = sum over all habits:
  wake:      50  × 66 (daily)
  water:     60  × 66 (daily)
  cardio:    120 × (weeklyCardioSessions / 7 × 66)
  training:  120 × (weeklyTrainingSessions / 7 × 66)
  reading:   80  × 66 (daily)
  screenTime: 70 × 66 (daily)

projectedStats = sum over all habit completions × stat gains above
```

Projected values scale with the aggressiveness of the user's targets. A user who sets 5 cardio sessions/week projects higher Strength than one who sets 2.

### logic/rollback.js

```
checkRollback(programState) → { shouldRollback, targetSnapshot }
```

- Triggered when `consecutiveFailureDays >= 3`.
- Finds the most recent 7-day checkpoint snapshot in `dailySnapshots`.
- Returns the full `programState` from that snapshot (day counter, XP, all five stats).
- Rollback is announced on next app open via a System message on `DayTransitionScreen`.

**Daily snapshots:** taken automatically in `reducer.js` every time `currentDay` is a multiple of 7 (Day 7, 14, 21, 28, 35, 42, 49, 56, 63). Stored as `dailySnapshots[day]`.

### logic/dayTransition.js

```
shouldTransition(storedDate) → boolean
```

- Compares stored date string (YYYY-MM-DD) to `new Date()` formatted as YYYY-MM-DD.
- Called by `useMidnightCheck` hook every 60 seconds.
- If different: dispatch `ADVANCE_DAY`.

### logic/xp.js

- `getTotalXP(dailyLog) → number` — sums XP across all days
- `getWeeklyXP(dailyLog, currentDay) → number` — sums XP for current 7-day window
- `getLevel(totalXP) → number` — `Math.floor(totalXP / 400) + 1`
- `getXPToNextLevel(totalXP) → number` — `400 - (totalXP % 400)`

---

## Data Model

All state is stored in LocalStorage under these five keys:

### `arise_userProfile`
```js
{
  age: number,
  lifeSituation: string,           // selected option text
  reasonForReset: string,
  stressPrideAssessment: string,
  readiness: string,
  ambitionLevel: string,
  targetWakeTime: string,          // "05:30"
  dailyWaterTarget: number,        // liters
  weeklyCardioSessions: number,
  cardioDuration: number,          // minutes
  weeklyTrainingSessions: number,
  trainingDuration: number,        // minutes
  dailyReadingPages: number,
  dailyScreenTimeCap: number,      // hours
  triggerTime: string              // "20:00" — re-engagement trigger
}
```

### `arise_programState`
```js
{
  currentScreen: string,           // e.g. 'DASHBOARD'
  currentDay: number,              // 1–66
  totalXP: number,
  stats: {
    wisdom: number,
    confidence: number,
    strength: number,
    discipline: number,
    focus: number
  },
  streakDays: number,
  consecutiveFailureDays: number,
  lockedMilestones: number[],      // e.g. [1, 7, 14]
  programStartDate: string,        // ISO date string
  settingsUsed: boolean,
  programStatus: 'active' | 'abandoned',
  lastOpenDate: string             // YYYY-MM-DD — for midnight detection
}
```

### `arise_dailyLog`
```js
{
  [dayNumber]: {
    date: string,                  // YYYY-MM-DD
    questCompletions: {
      wakeTime: boolean,
      water: number,               // liters logged
      cardio: { sessions: number, partial: boolean },
      training: { sessions: number, partial: boolean },
      reading: number,             // pages logged
      screenTime: number           // hours logged
    },
    rolledOverTasks: string[],     // quest types rolled over from previous day
    wasGiveUp: boolean,
    xpEarned: number
  }
}
```

### `arise_dailySnapshots`
```js
{
  [dayNumber]: {                   // only stored at multiples of 7
    totalXP: number,
    stats: { wisdom, confidence, strength, discipline, focus },
    streakDays: number,
    currentDay: number
  }
}
```

### `arise_guiltState`
```js
{
  date: string,                    // YYYY-MM-DD — resets each day
  snoozeCount: number,             // 0–3
  shownMessageIndices: number[]    // to avoid immediate repeats
}
```

---

## Guilt Messages

*Implements `prd.md > Re-engagement — Guilt & Accountability`*

Stored in `src/data/guiltMessages.js`. Structure:
```js
export const guiltMessages = {
  sarcasm: [...],        // 30 messages — dry, wry, knowing
  disappointment: [...], // 30 messages — quiet, heavy, personal
  pressure: [...]        // 30 messages — direct, urgent, unforgiving
}
```

**Selection logic in `GuiltScreen`:**
1. Pick a tone at random (weighted equally: 33% each).
2. Within that tone array, pick a random index not in `guiltState.shownMessageIndices`.
3. Add to `shownMessageIndices`. If all messages in a tone have been shown, reset that tone's shown list.

All 90 messages will be generated by the AI during `/build`. Sharath will edit voice/content afterward.

---

## Hooks

### hooks/useMidnightCheck.js

```js
useEffect(() => {
  const interval = setInterval(() => {
    if (dayTransition.shouldTransition(programState.lastOpenDate)) {
      dispatch({ type: 'ADVANCE_DAY' })
    }
  }, 60_000)
  return () => clearInterval(interval)
}, [programState.lastOpenDate])
```

### hooks/useGuiltTrigger.js

```js
// Runs on DashboardScreen mount and every 5 minutes
// Conditions: current time >= triggerTime AND quest completion < 50%
// → dispatch SHOW_GUILT
```

Completion % = quests marked Done / total quest cards for today.

---

## File Structure

```
arise/
├── public/
│   ├── manifest.json              # PWA manifest (name, icons, display: standalone)
│   └── icons/
│       ├── icon-192.png           # PWA icon
│       └── icon-512.png           # PWA icon (splash screen)
├── src/
│   ├── main.jsx                   # Vite entry point, renders <App />
│   ├── App.jsx                    # Screen controller — reads currentScreen → renders screen
│   ├── index.css                  # @import "tailwindcss" + @theme vars (dark palette)
│   ├── screens/
│   │   ├── ThresholdScreen.jsx    # Entry screen with ambient motion
│   │   ├── OnboardingScreen.jsx   # 9-question diagnostic flow
│   │   ├── PlanConfirmationScreen.jsx  # Day 1 vs Day 66 animated comparison
│   │   ├── CommitmentScreen.jsx   # Vow + "Start My Program"
│   │   ├── DashboardScreen.jsx    # Core daily loop — quest cards + header + strip
│   │   ├── DayTransitionScreen.jsx # New-day acknowledgement, rollover display
│   │   ├── MilestoneScreen.jsx    # Streak locked reward moment
│   │   ├── GuiltScreen.jsx        # Light-novel guilt interface
│   │   └── SettingsScreen.jsx     # One-time target edit + Give Up
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (do not edit directly)
│   │   ├── QuestCard.jsx          # Quest card: status chip + logging CTA
│   │   ├── EvidenceStrip.jsx      # Bottom proof strip (XP/stats/consistency)
│   │   ├── XPLevelBar.jsx         # Animated XP progress bar
│   │   ├── StreakIndicator.jsx     # Streak count + urgency copy + milestone lock state
│   │   ├── StatRow.jsx            # Animated stat row for plan confirmation
│   │   └── SystemMessage.jsx      # "System:" chat bubble, tone-aware
│   ├── store/
│   │   ├── AppContext.jsx         # createContext + Provider wrapping the whole app
│   │   ├── reducer.js             # All state transitions (single switch statement)
│   │   ├── actions.js             # Action type string constants
│   │   └── localStorage.js        # read/write helpers + key constants
│   ├── logic/
│   │   ├── questStatus.js         # getQuestCards() — Done/Pending/At-Risk/Easy Win
│   │   ├── statProjection.js      # Day 66 projection formula
│   │   ├── rollback.js            # 3-day failure check + snapshot restore
│   │   ├── dayTransition.js       # Midnight detection
│   │   └── xp.js                  # XP totals, level, XP-to-next-level
│   ├── data/
│   │   └── guiltMessages.js       # 90 messages × 3 tones, with section comments
│   └── hooks/
│       ├── useMidnightCheck.js    # setInterval polling for date change
│       └── useGuiltTrigger.js     # Time + completion % → guilt screen trigger
├── docs/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── process-notes.md
├── package.json
└── vite.config.js
```

---

## Key Technical Decisions

**1. No React Router — screen state machine instead**
- Decided: `App.jsx` reads `currentScreen` from context and renders the matching component directly.
- Why: All navigation is programmatic (guilt screen triggers on a time rule, day transition triggers at midnight). URL-based routing adds complexity with no benefit for a single-user app where link sharing isn't a use case.
- Tradeoff accepted: Browser back button won't work. Not a concern for a phone home-screen PWA.

**2. LocalStorage only — no backend**
- Decided: All state in five LocalStorage keys. No server.
- Why: PRD explicitly excludes auth, cloud sync, and multi-user. LocalStorage gives zero deployment complexity and zero backend cost.
- Tradeoff accepted: Data lives on one device. If Sharath clears browser storage, progress is lost. Acceptable for V1 alpha.

**3. Pure functions in `logic/` — no React dependencies**
- Decided: All business logic (quest status, stat projection, rollback, XP math) lives in plain JS functions with no React imports.
- Why: These are the most important and most testable parts of the app. Keeping them framework-free makes them easy to unit-test and easy for AI tools to modify without breaking component logic.
- Tradeoff accepted: Minor duplication in passing state as arguments rather than reading from context directly.

---

## Dependencies & External Services

| Dependency | Purpose | Docs | Notes |
|-----------|---------|------|-------|
| React 19 | UI framework | [react.dev](https://react.dev) | — |
| Vite 8 | Build tool | [vite.dev](https://vite.dev) | Uses Rolldown; `optimizeDeps` config may need adjustment |
| Tailwind CSS v4 | Utility CSS | [tailwindcss.com](https://tailwindcss.com/docs/upgrade-guide) | CSS-first config (`@theme` in CSS, not `tailwind.config.js`) |
| shadcn/ui | Component library | [ui.shadcn.com](https://ui.shadcn.com/docs/tailwind-v4) | Components are copied into project — full ownership |
| Vercel | Hosting + deploy | [vercel.com/docs](https://vercel.com/docs/frameworks/frontend/vite) | Free tier; git push → auto-deploy |

No external APIs. No API keys required. No paid services.

---

## Open Issues

**Resolved in this spec:**
- ✅ Day boundary: midnight
- ✅ Stat projection formula: defined above
- ✅ Guilt messages: AI-generated during `/build`, stored in `guiltMessages.js`
- ✅ Partial timer (cardio/training): partial completion marks quest as partial (logged, no XP awarded, task does NOT roll over if partial — it's treated as attempted)

**Still open:**
1. **Onboarding qualitative answer copy** — the 4 options per qualitative question (life situation, reason for reset, etc.) need to be written before or during `/build`. They carry the app's judgmental voice. Recommend writing these during `/build` alongside the guilt messages.
2. **Ambient motion on ThresholdScreen** — CSS keyframe animation vs. a lightweight library (e.g. `tsparticles`). Decision can wait for `/build`. Default: CSS-only to avoid dependencies.
3. **Partial cardio/training timer** — if user ends timer early, quest shows partial state (amber chip variant). No XP awarded, task does not roll over. Spec treats this as "attempted, not complete."
