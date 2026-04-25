# Process Notes

## /onboard

**Technical experience:** Former DevOps engineer (Python, shell scripts), ~4 years removed. Intermediate level, self-described as rusty. Comfortable delegating framework choices to AI. Has experimented with AI coding agents but never completed a large build.

**Learning goals:** Use this as a repeatable template for future projects. Explicit monetization goal — wants to ship something real, not just a demo. Entrepreneurial mindset throughout.

**Creative sensibility:** Deep into sci-fi/fantasy/superhero films, anime, AAA campaign PC games, and speculative fiction. Strong sense of immersive progression and narrative-driven design. Habit tracker should feel like a life RPG, not a fitness dashboard.

**Prior SDD experience:** Informal — lists features before building, but no structured documentation process. First exposure to formal SDD. Understands the instinct, not the method.

**Energy and engagement:** High conviction on his idea, entrepreneurial focus, pragmatic about tooling. Moves decisively. Good candidate for deeper spec rounds — he thinks in product terms.

## /scope

**How the idea evolved:** Arrived fully formed — one of the richest brain dumps in the curriculum. The core concept (Solo Leveling-style progression applied to a 66-day habit arc) was clear from the first message. The conversation sharpened two things: (1) the daily experience (Day 14 loop) which he articulated vividly once prompted, and (2) scope cuts to make it prototype-feasible.

**Pushback received:** Pushed to identify what gets cut from a very ambitious feature list. Responded decisively — dropped personalized plan generation, weekly difficulty slider, and full analytics. Kept the re-engagement guilt mechanics as the primary hook. No resistance, clean cuts.

**References that resonated:** Life Reset was the closest existing product match; he recognized it immediately. MainQuest's aesthetic matched his visual instincts. Explicitly rejected Solo Leveling System — wants the tropes, not the IP. Duolingo surfaced as a re-engagement reference unprompted, which was a strong creative addition.

**Deepening rounds:** 0. Learner chose to proceed after mandatory questions. Brain dump was thorough enough that additional rounds weren't necessary — he arrived with more context than most learners produce after two deepening rounds.

**Active shaping:** Learner drove heavily. Original vision was detailed and specific before any prompting. Key moments where he steered: (1) unprompted addition of "Duolingo tactics but humorous" for re-engagement — that's a distinct product voice not in any reference app; (2) explicit rejection of Solo Leveling System aesthetic ("let's not borrow anything from them") — showed clear brand instincts; (3) re-engagement mechanics named as the primary hook, not the onboarding or the RPG stats — an interesting prioritization that suggests he's thought about the retention problem specifically.

## /prd

**What the learner added vs. scope doc:** The PRD surfaced substantial new behaviors not in the scope: judgment-voiced qualitative options (a deliberate provocation mechanic), the threshold screen as a distinct first screen, the vow/commitment step as a separate screen before "Start My Program," the full quest card anatomy (icon/target/frequency/status/XP/CTA), the four distinct task logging flows (tap/increment/timer/pages/manual), the task rollover and stacking mechanic on Give Up or missed days, the one-time settings adjustment that permanently becomes "Give Up on Program," milestone locking at 7 specific days, daily state snapshots as rollback targets, and the light-novel chat interface for the guilt screen.

**"What if" moments that surprised him:** The daily snapshot question ("to roll back to Day 14, the app needs to have saved that state") landed cleanly — he hadn't explicitly thought through the snapshot requirement, but immediately said "snapshots of every day." The task stacking question ("what if they give up 2 days in a row — does cardio double?") surfaced a real design decision; he confirmed stacking is intentional. The push notification flag was a genuine scope guard moment — he'd added push + snooze + forced choice, which was out of scope; he accepted the "on-open trigger" substitute without resistance and saw the logic.

**Pushback / strong opinions:** Took a clear stance on options tone being deliberately judgmental to "trigger" honesty — framed it as a brand position, not just tone. Was decisive on all rollback/penalty mechanics — confirmed 3-day failure → rollback, full XP+stats+day reset, same treatment for missed days as Give Up. Trusted agent judgment on the 90-message content system and partial timer question rather than over-specifying.

**Scope guard moments:** Push notification snooze system caught and redirected to on-open trigger with 3 snoozes + forced choice. Learner accepted cleanly. No other scope creep.

**Deepening rounds:** 1 round. Surfaced: the one-time settings mechanic (initially unclear if it was the cut difficulty slider — clarified as target recalibration), the evidence strip's emotional job (70% proof / 30% pressure), the day transition branching (full completion vs. partial + rollover), streak milestone locking as identity proof (not just achievement), and the milestone schedule (Days 1, 7, 14, 21, 35, 48, 66).

**Active shaping:** Strongly driven throughout. Key moments: (1) unprompted articulation of the threshold screen concept — "one emotionally charged opening screen, one tap to begin" with specific copy suggestion; (2) the plan confirmation screen answer was the most detailed single response in the session — he came in with a fully formed visual layout including the animated stat reveal; (3) the "I don't want to waste the user's time" framing on question types showed genuine UX thinking, not just feature listing; (4) the judgment-as-motivation design rationale was his own framing, not prompted; (5) "I trust your judgement" on the remaining open questions shows confidence and appropriate delegation after doing the hard thinking himself.

## /spec

**Technical decisions made:**
- Stack: React 19 + Vite 8 + Tailwind v4 + shadcn/ui → Vercel. Learner deferred framework choices to agent; recommendation accepted immediately.
- Pure frontend / no backend. Learner's call, made decisively: "if we find reasons to use the backend later, we'll migrate."
- LocalStorage for all persistence (5 keys). No auth, no cloud sync — matches PRD non-goals.
- No React Router — top-level screen controller via `currentScreen` in context. Learner accepted the rationale (programmatic nav, PWA home-screen use case).
- PWA manifest included for mobile home-screen testing on Sharath's phone.
- Midnight cutover for day boundary. Chosen over configurable sleep time or lazy evaluation.
- Stat projection formula: base(10) + habits × stat weights × frequency × 66 days. Accepted without modification.
- Guilt messages: AI-generated during /build, stored in `src/data/guiltMessages.js`, Sharath edits later.
- Level formula: `Math.floor(totalXP / 400) + 1`. Simple, consistent.
- Pure functions in `logic/` — no React dependencies. Intentional for testability and AI tool effectiveness.

**What the learner was confident about vs. uncertain:**
- Confident: no backend, frontend-only, deployed URL for phone testing, midnight cutover, deferring guilt message authorship.
- No hesitation on any architectural question — fast, clear answers throughout.
- No deepening rounds chosen — proceeded directly after mandatory questions were covered.

**Stack choices and why:**
React + Vite chosen for speed and ecosystem. Tailwind v4 for CSS-first theming (suits dark aesthetic). shadcn/ui for full code ownership (AI-tool-friendly). Vercel for zero-config deployment. All confirmed against current docs before recommendation.

**Deepening rounds:** 0 rounds. Learner chose to proceed immediately after the mandatory phase. The mandatory questions were thorough enough — stack, deployment, day boundary, stat formula, and guilt content authorship all resolved cleanly. No architecture issues surfaced that would have benefited from additional rounds.

**Active shaping:** Minimal — learner deferred to agent on nearly all architecture questions. This is appropriate given his frontend inexperience. The one genuine input: the "build frontend only, migrate backend later" decision was his framing, not prompted. Clean product thinking.

## /checklist

**Sequencing decisions:** Foundation-first order: scaffold → state → logic → onboarding arc → dashboard → quest cards → day transitions → guilt → settings/rollback → deploy → submit. Key dependency rationale: logic layer (items 1–3) built before any screen uses it; onboarding before dashboard because dashboard needs userProfile; quest card timer (item 7) identified as highest-risk interaction — built mid-sequence while there's time to pivot.

**Build mode:** Autonomous. Rationale: intermediate/experienced learner, wants to ship fast, entrepreneurial mindset. Verification checkpoints every 3 items (after 3, 6, 9, 12).

**Comprehension checks:** N/A (autonomous mode).

**Verification:** Yes — checkpoints every 3 items.

**Git cadence:** Commit after each item.

**Check-in cadence:** N/A (autonomous mode).

**Total items:** 12 items. Estimated build time: 3–6 hours.

**Submission planning:** Live Vercel URL via GitHub auto-deploy (already in spec). GitHub repo: https://github.com/MeSharath/Arise.git (just created by Sharath). "Wow moment" identified as the GuiltScreen — dark visual-novel chat interface, unlike anything in the habit app category. Four screenshot targets mapped to PRD epics: ThresholdScreen, mid-program Dashboard, GuiltScreen, PlanConfirmationScreen.

**Deepening rounds:** 0 rounds. Learner confirmed the proposed plan immediately and deferred sequencing logic to agent.

**Active shaping:** Minimal on sequencing — learner accepted the proposed order without modification. Decisive on build mode (autonomous) and verification (yes). Key input: directed to use GitHub repo https://github.com/MeSharath/Arise.git and confirmed Vercel/GitHub auto-deploy approach. Clean, fast decision-making throughout.
