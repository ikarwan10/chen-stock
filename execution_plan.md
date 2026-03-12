# Chen's Stocks — Execution Plan

**Document Version:** 1.0  
**Date:** March 11, 2026  
**Prepared by:** Software Group Manager  
**Source:** investment.md (MRD v1.1)  
**Status:** Awaiting Stakeholder Review  

---

## 1. Team Roster & Roles

| ID | Role | Responsibilities |
|----|------|------------------|
| **TL** | Tech Lead | Architecture decisions, code reviews, technical blockers, integration oversight |
| **BE-1** | Backend Engineer (Senior) | Data layer, API services (Portfolio, Quotes, PNL Engine), database schema |
| **BE-2** | Backend Engineer (Mid) | History Service, Financial Status Service, snapshot scheduler |
| **FE-1** | Frontend Engineer (Senior) | Dashboard, holdings table, portfolio summary, navigation shell |
| **FE-2** | Frontend Engineer (Mid) | Charts (PNL, history, value-over-time), per-ticker detail views, financial status UI |
| **QA** | QA Engineer | Test plans, manual testing, automated test scripts, PNL calculation verification |
| **UX** | UI/UX Expert (External Reviewer) | Usability review, accessibility audit, beginner-investor experience validation |

> **Staffing note:** UX is not embedded full-time. They are engaged at three formal review gates (see §5) and available ad-hoc for questions between gates.

---

## 2. Execution Principles

1. **Beginner-first design.** Every screen must make sense to someone who has never used a portfolio tracker. If it needs a tooltip to explain, the design isn't done yet.
2. **Vertical slices.** Each sprint delivers a working end-to-end feature (backend + frontend + tests), not isolated backend-only or frontend-only pieces.
3. **UX gates before code.** No major UI work starts until the UX expert approves wireframes/mockups for that feature.
4. **Ship P0 first.** All P0 requirements are completed and tested before any P1 work begins.
5. **Daily standups, sprint demos.** Team syncs daily (15 min). Sprint demo to stakeholder at the end of each sprint.

---

## 3. Sprint Plan Overview

| Sprint | Duration | Theme | Deliverable |
|--------|----------|-------|-------------|
| **Sprint 0** | 1 week | Setup & Design | Project scaffolding, tech stack finalized, DB schema, wireframes for all MVP screens |
| **Sprint 1** | 2 weeks | Foundation | Ticker management + live quotes + basic dashboard |
| **Sprint 2** | 2 weeks | PNL & Transactions | PNL calculations, transaction recording, PNL chart |
| **Sprint 3** | 2 weeks | History & Snapshots | Per-ticker history, portfolio performance history, snapshot engine |
| **Sprint 4** | 2 weeks | Financial Status Check | Full portfolio status, per-ticker status, trend indicators, scorecard |
| **Sprint 5** | 1 week | Polish, UX Fixes & Hardening | Bug fixes from UX review, performance tuning, edge cases, final QA pass |
| **Sprint 6** | 1 week | Release Prep | Documentation, packaging, deployment guide, stakeholder sign-off |

**Total estimated duration: 11 weeks**

---

## 4. Detailed Task Breakdown

### Sprint 0 — Setup & Design (Week 1)

| Task # | Task | Owner | Depends On | MRD Refs | Done Criteria |
|--------|------|-------|------------|----------|---------------|
| S0-01 | Initialize project repository (Git, folder structure, README) | TL | — | — | Repo cloned and builds with empty app shell |
| S0-02 | Finalize tech stack decision (frontend framework, backend framework) | TL | — | §8, Q1 | Decision documented; team aligned |
| S0-03 | Set up development environment (Python venv, Node, linting, CI) | TL | S0-02 | — | All team members can `npm start` / `python run` locally |
| S0-04 | Design SQLite database schema (all 4 tables) and write migration script | BE-1 | S0-02 | §9 | Schema matches data model; migration runs clean |
| S0-05 | Create wireframes/mockups for **all MVP screens**: Dashboard, Add Ticker, Transaction Form, Per-Ticker History, Portfolio History, Financial Status (portfolio), Financial Status (ticker) | FE-1 | S0-02 | §5.1–5.8 | Wireframes in Figma/draw.io, linked in repo |
| S0-06 | **>>> UX REVIEW GATE 1** — UX expert reviews all wireframes for beginner usability (see §5 below) | UX | S0-05 | NFR-05 | UX sign-off with written feedback incorporated |
| S0-07 | Spike: validate yfinance API — confirm quote fields, historical data, rate limits | BE-2 | — | §7 | Spike report with sample outputs; API confirmed working |

**Sprint 0 Exit Criteria:** Tech stack locked, DB schema approved, wireframes UX-approved, API validated.

---

### Sprint 1 — Foundation (Weeks 2–3)

| Task # | Task | Owner | Depends On | MRD Refs | Done Criteria |
|--------|------|-------|------------|----------|---------------|
| S1-01 | Backend: Implement Ticker CRUD API (add, edit, remove ticker) | BE-1 | S0-04 | FR-101, FR-102, FR-103 | API endpoints return correct responses; unit tests pass |
| S1-02 | Backend: Implement ticker symbol validation against yfinance | BE-1 | S0-07 | FR-104 | Invalid symbols rejected with clear error message |
| S1-03 | Backend: Implement Quotes Service — fetch live quotes for all portfolio tickers | BE-2 | S0-07 | FR-201, FR-202, FR-203 | Endpoint returns price, change, high, low, volume per ticker |
| S1-04 | Backend: Implement quote caching layer (handle API failures, stale indicator) | BE-2 | S1-03 | FR-205, NFR-02 | Cached quote served on failure; stale flag set correctly |
| S1-05 | Backend: Secure API key handling (env vars, .env file, no hardcoding) | BE-1 | — | NFR-04 | No secrets in code; .env.example provided |
| S1-06 | Frontend: Build application shell — navigation, layout, responsive frame | FE-1 | S0-06 | NFR-05 | App loads with nav; routes wired to empty pages |
| S1-07 | Frontend: Build Dashboard — holdings table (sortable columns) + portfolio summary bar | FE-1 | S1-01, S1-03 | FR-301, FR-302 | Table renders real data; summary shows totals |
| S1-08 | Frontend: Build Add/Edit Ticker dialog — form with validation, confirmation | FE-2 | S1-01 | FR-101, FR-103 | User can add ticker; form errors shown inline |
| S1-09 | Frontend: Build Remove Ticker flow — confirmation dialog, dashboard refresh | FE-2 | S1-01 | FR-102 | Ticker removed after confirm; dashboard updates |
| S1-10 | Frontend: Wire manual quote refresh button on dashboard | FE-2 | S1-03 | FR-203 | Button triggers refresh; loading spinner shown |
| S1-11 | QA: Write test plan for Sprint 1 features; execute manual + automated tests | QA | S1-07, S1-08, S1-09 | — | Test report with pass/fail; bugs logged |

**Sprint 1 Exit Criteria:** User can add/edit/remove tickers, see live quotes on a sortable dashboard, and manually refresh prices.

---

### Sprint 2 — PNL & Transactions (Weeks 4–5)

| Task # | Task | Owner | Depends On | MRD Refs | Done Criteria |
|--------|------|-------|------------|----------|---------------|
| S2-01 | Backend: Implement Transaction API — record buy transactions (ticker, date, qty, price, fees) | BE-1 | S1-01 | FR-501 | Transaction saved to DB; avg cost recalculated |
| S2-02 | Backend: Implement PNL Engine — unrealized PNL per ticker and total | BE-1 | S2-01, S1-03 | FR-401 | PNL = (current price − avg cost) × qty; matches manual calc |
| S2-03 | Backend: Implement historical PNL endpoint — portfolio-level PNL over time | BE-2 | S2-02 | FR-403 | Returns date-series of portfolio PNL values |
| S2-04 | Frontend: Build Transaction Form — buy entry with date picker, validation | FE-2 | S2-01 | FR-501 | Form submits; transaction appears in database |
| S2-05 | Frontend: Update Dashboard — add PNL columns (gain/loss $, gain/loss %) per row and summary | FE-1 | S2-02 | FR-301, FR-302, FR-401 | PNL values display correctly; color coded green/red |
| S2-06 | Frontend: Build PNL Chart — portfolio-level historical PNL line chart | FE-2 | S2-03 | FR-403 | Chart renders with real data; responsive |
| S2-07 | QA: PNL calculation verification — compare engine output against manual spreadsheet for 10+ test cases | QA | S2-02 | — | All calculations match to the cent |
| S2-08 | QA: Sprint 2 full regression + new feature testing | QA | S2-05, S2-06 | — | Test report; bugs logged and triaged |

**Sprint 2 Exit Criteria:** User can record buy transactions, see unrealized PNL on dashboard, and view a historical PNL chart.

---

### Sprint 3 — History & Snapshots (Weeks 6–7)

| Task # | Task | Owner | Depends On | MRD Refs | Done Criteria |
|--------|------|-------|------------|----------|---------------|
| S3-01 | Backend: Implement Snapshot Scheduler — daily auto-capture of portfolio + per-ticker snapshots | BE-2 | S2-02 | FR-701 | Scheduler runs on app start and at EOD; snapshots stored in DB |
| S3-02 | Backend: Implement Per-Ticker History API — transaction list, value-over-time, PNL timeline | BE-1 | S3-01 | FR-601, FR-602, FR-603, FR-604 | Endpoint returns full ticker history with chart data |
| S3-03 | Backend: Implement Portfolio History API — value vs. cost over time, delta between two dates | BE-2 | S3-01 | FR-702, FR-703 | Endpoint returns portfolio time series + delta calculation |
| S3-04 | Frontend: Build Per-Ticker History View — transaction table + value chart + PNL timeline chart | FE-2 | S3-02 | FR-601–FR-604 | Accessible from dashboard row click; all three sections render |
| S3-05 | Frontend: Build Portfolio History View — line chart (value vs. cost) + date-range delta display | FE-1 | S3-03 | FR-702, FR-703 | Chart renders; user can pick two dates and see $ and % change |
| S3-06 | Frontend: Implement time-range selectors on all chart views (1M, 3M, 6M, YTD, 1Y, All) | FE-2 | S3-04, S3-05 | FR-606, FR-707 | Buttons filter chart data correctly |
| S3-07 | **>>> UX REVIEW GATE 2** — UX expert reviews working history views + chart interactions for clarity and ease of use | UX | S3-04, S3-05, S3-06 | NFR-05 | UX feedback documented; critical items added to Sprint 5 |
| S3-08 | QA: Sprint 3 full test — history accuracy, snapshot integrity, chart correctness | QA | S3-04, S3-05 | — | Test report; no P0 bugs open |

**Sprint 3 Exit Criteria:** Per-ticker and portfolio history views working end-to-end with real snapshot data and time-range selection.

---

### Sprint 4 — Financial Status Check (Weeks 8–9)

| Task # | Task | Owner | Depends On | MRD Refs | Done Criteria |
|--------|------|-------|------------|----------|---------------|
| S4-01 | Backend: Implement Financial Status API — portfolio scope (value, invested, PNL, trend, scorecard) | BE-1 | S3-01, S2-02 | FR-801, FR-802, FR-803, FR-804 | Endpoint returns complete status payload for full portfolio |
| S4-02 | Backend: Implement Financial Status API — per-ticker scope (position details, PNL, trend, scorecard) | BE-1 | S4-01 | FR-801, FR-802, FR-803, FR-804, FR-806 | Endpoint returns complete status payload for single ticker |
| S4-03 | Backend: Implement trend direction algorithm (Improving / Declining / Stable based on ±1% threshold) | BE-2 | S4-01 | FR-803 | Algorithm unit-tested with edge cases (flat, +0.9%, −1.1%) |
| S4-04 | Backend: Implement per-ticker contribution to portfolio PNL (sorted breakdown) | BE-2 | S4-01 | FR-805 | Returns sorted list: top gainers to top losers |
| S4-05 | Frontend: Build Portfolio Financial Status panel — summary card, trend badge, scorecard grid, ticker breakdown table | FE-1 | S4-01, S4-04 | FR-801–FR-805, FR-808 | One-click from dashboard opens status; all data renders |
| S4-06 | Frontend: Build Per-Ticker Financial Status panel — position card, trend badge, scorecard, detail metrics | FE-2 | S4-02 | FR-801–FR-804, FR-806, FR-808 | Accessible from ticker history and dashboard; all data renders |
| S4-07 | Frontend: Implement color-coded indicators (green/red/grey) on scorecard and trend badges | FE-2 | S4-05, S4-06 | FR-804 | Colors applied consistently; accessible contrast ratio |
| S4-08 | **>>> UX REVIEW GATE 3** — Full app walkthrough by UX expert simulating a beginner investor (see §5 below) | UX | S4-05, S4-06, S4-07 | NFR-05 | UX sign-off on overall flow; punch list for Sprint 5 |
| S4-09 | QA: Financial status accuracy testing — verify trend logic, scorecard math, breakdown sort | QA | S4-05, S4-06 | — | Test report; no P0 bugs open |

**Sprint 4 Exit Criteria:** Financial status check fully functional for both portfolio and individual ticker, with trend direction and performance scorecard.

---

### Sprint 5 — Polish, UX Fixes & Hardening (Week 10)

| Task # | Task | Owner | Depends On | MRD Refs | Done Criteria |
|--------|------|-------|------------|----------|---------------|
| S5-01 | Address all critical and high-priority items from UX Review Gate 3 feedback | FE-1, FE-2 | S4-08 | NFR-05 | Each UX finding resolved or deferred with justification |
| S5-02 | Performance optimization — dashboard load time under 2s with 100 tickers | BE-1 | — | NFR-01 | Load time benchmarked and meets target |
| S5-03 | Error handling sweep — API failures, empty states, invalid inputs across all screens | BE-2, FE-1 | — | NFR-02 | No unhandled errors; user sees friendly messages |
| S5-04 | Implement auto-backup for SQLite database file | BE-2 | — | §13 | Backup created on every app launch; prior backup preserved |
| S5-05 | Accessibility pass — keyboard navigation, screen reader labels, color contrast | FE-2 | S5-01 | NFR-05 | WCAG AA compliance on critical flows |
| S5-06 | QA: Full regression test on all MVP features | QA | S5-01 | — | Full test suite green; no P0/P1 bugs open |
| S5-07 | QA: Edge case testing — 0 tickers, 1 ticker, 100 tickers, missing data, stale quotes | QA | S5-03 | — | All edge cases handled gracefully |

**Sprint 5 Exit Criteria:** All UX issues addressed, performance target met, zero P0 bugs, regression passing.

---

### Sprint 6 — Release Prep (Week 11)

| Task # | Task | Owner | Depends On | MRD Refs | Done Criteria |
|--------|------|-------|------------|----------|---------------|
| S6-01 | Write user guide / README with setup instructions and screenshots | TL | S5-06 | — | Non-technical user can install and start the app following the guide |
| S6-02 | Deploy to Render.com — backend Web Service, frontend Static Site, PostgreSQL database | TL, BE-1 | S5-06 | — | App live at Render URLs; health check passing; CI/CD on push to main |
| S6-03 | Final stakeholder demo and sign-off | TL | S6-01, S6-02 | — | Stakeholder approves release |
| S6-04 | Tag v1.0 release in Git; archive build artifacts | TL | S6-03 | — | Git tag created; Render deployment linked |

**Sprint 6 Exit Criteria:** Application packaged, documented, demonstrated, and approved for release.

---

## 5. UX Expert Review Gates — Detail

The UI must work for **users with zero investment experience**. The UX expert evaluates against this principle at every gate.

### Gate 1 — Wireframe Review (Sprint 0, Task S0-06)

**Scope:** All MVP screen wireframes/mockups (7 screens).

**Evaluation Checklist:**
| # | Criterion | Pass/Fail |
|---|-----------|-----------|
| 1 | Every screen has a clear, single purpose that a beginner can identify in under 3 seconds. | |
| 2 | Financial jargon (PNL, unrealized, cost basis) is either avoided OR accompanied by a plain-English label/tooltip. | |
| 3 | The primary action on each screen is visually obvious (size, color, position). | |
| 4 | Navigation is flat — any core feature reachable in ≤ 2 clicks from the dashboard. | |
| 5 | Data density is appropriate — no screen shows more than 8–10 columns without progressive disclosure. | |
| 6 | Color usage follows red = loss, green = gain, grey = neutral convention consistently. | |
| 7 | Empty states (no tickers yet, no transactions) guide the user on what to do next ("Add your first ticker →"). | |
| 8 | Font sizes and spacing support readability on a 14" laptop screen. | |

**Output:** Written feedback report. Wireframes updated before coding begins.

---

### Gate 2 — Working History Views Review (Sprint 3, Task S3-07)

**Scope:** Per-ticker history view, portfolio history view, all charts, time-range selectors — running with real data.

**Evaluation Checklist:**
| # | Criterion | Pass/Fail |
|---|-----------|-----------|
| 1 | Charts load without confusion — axes are labeled, legends are visible, units ($ or %) are clear. | |
| 2 | Time-range buttons are intuitive and the active range is visually highlighted. | |
| 3 | The relationship between the transaction list and the chart is obvious (e.g., transactions as markers on the chart). | |
| 4 | Value vs. cost basis overlay is easy to read — the "gap" between lines communicates gain/loss visually. | |
| 5 | Date-range delta feature (pick two dates) is discoverable without instructions. | |
| 6 | Back navigation from detail views to dashboard is always available and obvious. | |
| 7 | Loading and error states are handled (spinners, "no data" messages, retry options). | |

**Output:** Feedback report with severity ratings (Critical / High / Medium / Low). Critical and High items enter Sprint 5 backlog.

---

### Gate 3 — Full App Walkthrough (Sprint 4, Task S4-08)

**Scope:** Complete application, end-to-end, simulating a first-time user who:
1. Has never used a portfolio tracker.
2. Owns 5 stocks, knows ticker symbols but nothing about "cost basis" or "PNL."
3. Wants to answer: "Am I making money or losing money?"

**Walkthrough Scenarios:**
| Scenario | Expected UX Outcome |
|----------|---------------------|
| A. First launch — app is empty | User sees a welcoming empty state with a clear "Add Ticker" prompt; no intimidation. |
| B. Add 3 tickers with buy transactions | Form is self-explanatory; user is never stuck on what a field means. |
| C. View dashboard with holdings | User immediately understands which stocks are up, which are down, and by how much. |
| D. Check financial status — full portfolio | One click opens status; the Improving/Declining/Stable badge answers "how am I doing?" instantly. |
| E. Check financial status — single ticker | User drills into one stock; sees a clear "this stock is up/down X% this month" without cognitive overload. |
| F. View per-ticker history | User sees the timeline of their investment in one stock — when they bought, how price moved, how much they gained/lost. |
| G. View portfolio history over 3 months | User picks a date range and sees if their overall portfolio is trending up or down, in plain visual language. |

**Evaluation Criteria:**
| # | Criterion | Pass/Fail |
|---|-----------|-----------|
| 1 | The user can complete each scenario without external help or documentation. | |
| 2 | Key questions ("Am I up or down?", "Which stock is my best performer?") are answerable in ≤ 5 seconds from the dashboard. | |
| 3 | No screen requires scrolling to see the most important information. | |
| 4 | Terminology is beginner-friendly throughout (or has inline help). | |
| 5 | Transitions between views feel natural — no dead ends, no confusing back-button behavior. | |
| 6 | Visual hierarchy guides the eye: summary first, details on demand. | |
| 7 | Overall impression: would a non-technical 30-year-old feel comfortable using this daily? | |

**Output:** Final UX punch list. Items rated Critical must be fixed in Sprint 5 before release. Medium/Low items can be deferred to Phase 2.

---

## 6. Dependency Map

```
S0-02 (Tech Stack)
  ├── S0-03 (Dev Env)
  ├── S0-04 (DB Schema) ──► S1-01 (Ticker CRUD)
  ├── S0-05 (Wireframes) ──► S0-06 (UX Gate 1) ──► S1-06 (App Shell)
  └── S0-07 (API Spike) ──► S1-03 (Quotes Service)

S1-01 (Ticker CRUD)
  ├── S1-07 (Dashboard) ────────────────────────────► S2-05 (PNL on Dashboard)
  ├── S1-08 (Add Ticker)
  ├── S1-09 (Remove Ticker)
  └── S2-01 (Transaction API) ──► S2-02 (PNL Engine)
                                     ├── S2-03 (Historical PNL) ──► S2-06 (PNL Chart)
                                     ├── S3-01 (Snapshot Scheduler)
                                     │     ├── S3-02 (Ticker History API) ──► S3-04 (Ticker History UI)
                                     │     └── S3-03 (Portfolio History API) ──► S3-05 (Portfolio History UI)
                                     │                                            └── S3-07 (UX Gate 2)
                                     └── S4-01 (Status API: Portfolio) ──► S4-05 (Status UI: Portfolio)
                                          S4-02 (Status API: Ticker) ──► S4-06 (Status UI: Ticker)
                                                                           └── S4-08 (UX Gate 3)
                                                                                └── S5-01 (UX Fixes)
```

---

## 7. Risk Watchlist for Execution

| Risk | Mitigation |
|------|------------|
| UX review feedback causes major redesign late in Sprint 3/4 | Gate 1 catches layout/flow issues early on wireframes; minimize rework. |
| yfinance API breaks or is unreliable during development | API abstraction layer from Sprint 1; can swap to Alpha Vantage quickly. |
| Snapshot scheduler misses days (app not running) | On launch, detect missing days and backfill from API historical data. |
| PNL calculation bugs erode trust | Dedicated QA task (S2-07) with 10+ manual verification cases against spreadsheet. |
| Team velocity slower than planned | Sprints 5 and 6 have buffer; P1 features already deferred to Phase 2. |

---

## 8. Definition of Done (All Tasks)

Every task is considered **done** when:

- [ ] Code is committed to feature branch and passes CI (linting + tests).
- [ ] Peer code review approved by at least one other engineer.
- [ ] Unit tests cover the new logic (≥80% coverage for backend services).
- [ ] Feature works end-to-end in the local development environment.
- [ ] QA has verified the feature against acceptance criteria.
- [ ] No P0 or P1 bugs remain open for that feature.

---

## 9. Communication Cadence

| Event | Frequency | Participants | Purpose |
|-------|-----------|--------------|---------|
| Daily Standup | Daily, 15 min | Full team | Blockers, progress, plan for today |
| Sprint Planning | Start of each sprint | Full team | Commit to sprint scope; assign tasks |
| Sprint Demo | End of each sprint | Team + Stakeholder | Show working software; collect feedback |
| UX Review Gate | 3 scheduled sessions | UX + FE-1 + FE-2 + TL | Formal usability review |
| Stakeholder Sync | Bi-weekly | TL + Stakeholder | Status update, priority adjustments, open questions |

---

## 10. Open Decisions Needed from Stakeholder

Before Sprint 0 can begin, the following decisions from the MRD open questions must be resolved:

| # | Decision Needed | Impact |
|---|-----------------|--------|
| 1 | **Frontend tech stack** — Web (React) or Desktop (Electron / PyQt)? | Determines FE hiring/skills, packaging, and Sprint 0 setup. |
| 2 | **Crypto support in MVP** — Yes or No? | If yes, adds validation complexity and different market hours handling. |
| 3 | **Multi-account support** — Yes or No for MVP? | If yes, adds a data model layer (accounts table) in Sprint 0. |
| 4 | ~~**Deployment model**~~ — **RESOLVED: Render.com** (Web Service + Static Site + Managed PostgreSQL). render.yaml blueprint and Dockerfile created. | No longer blocks Sprint 0. |

---

*This execution plan is ready for your review. Please provide feedback on the sprint structure, task assignments, UX review gates, and any open decisions above so we can kick off Sprint 0.*
