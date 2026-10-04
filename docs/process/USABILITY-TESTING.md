# Usability Testing

Usability testing on the **working app** with at least **5 participants** (real or proxy users). Findings are logged below and fixed or planned. Silva coordinates the sessions (see [TESTING.md](TESTING.md)); each member runs or joins sessions for their own role.

Status: **plan ready, no sessions held yet.** Sections marked "fill in after sessions" stay empty until then.

## Plan

| Item | Decision |
|---|---|
| Objective | Check that each role can complete its main tasks quickly, correctly and with confidence |
| Participants | Minimum 5 in total; cover all three roles where possible (proxy users such as classmates acting as conductor or authority are allowed, note this in the results) |
| Build tested | Final APK or Expo Go build, version noted per session |
| Environment | Android phone, one facilitator and one note-taker per session |
| Method | Moderated task-based test, think-aloud, short post-test questionnaire |
| Consent | Verbal or written consent; no personal data stored beyond age range and role |

### Recruiting (passenger area)

- Aim for **6 passenger participants** so that 5 usable sessions are left if one is lost. Add the conductor and authority sessions run by Herath and Fernando.
- Mix: at least 2 people who ride buses or trains regularly in Sri Lanka, at least 1 who is not a student, and at least 1 who has never used a transport app. Note each person's smartphone experience, because it explains differences in results.
- Nobody from the team who built the screens being tested. Classmates from another group are fine.
- Each session takes about 25 minutes (5 min intro, 15 min tasks, 5 min questionnaire and chat). Book them across 2 or 3 days, no more than 3 per day, so notes can be written up while they are fresh.

### Test setup (passenger area)

Two builds of the same app are used on purpose, because the live backend seed has one trip per vehicle and the Filter & Sort task needs several trips on a route.

| Tasks | Data | Setup |
|---|---|---|
| T0, T1, T1b, T1c, T2b | Sample data (no Firebase keys in `.env`, or an APK built without them) | Several trips per route, so filters and sorting make a visible difference |
| T2, T2c (live tracking) | Live data | Real keys in `.env`; in `ridetrack-backend` run `npm run seed` and then `npm run simulate`, and keep it running for the whole session so the marker moves |

Before every session:

1. Phone charged, on Wi-Fi, app freshly installed or data cleared so the first launch shows Select Transport.
2. For live tasks: simulator running (the console prints a line every 3 seconds) and the phone showing `Live data` on Home.
3. Screen recording on, with the participant's consent.
4. Task sheet and questionnaire printed or open on a second device.

### Roles in a session

| Role | Does |
|---|---|
| Facilitator | Welcomes the participant, reads the tasks one at a time, prompts "what are you thinking?", never explains the screen or points at buttons |
| Note-taker | Times each task, counts errors, writes quotes, records help given |
| Participant | Uses the app as if alone and speaks their thoughts aloud |

### Session script

1. **Welcome (2 min).** "We are testing the app, not you. If something is confusing, that is the app's fault and exactly what we need to hear. You can stop at any time." Ask for consent to take notes and record the screen.
2. **Background (1 min).** Age range, how often they travel by bus or train, smartphone experience.
3. **Tasks (15 min).** Hand over the phone on the first screen. Read each task aloud, then start the timer. Stop a task when the success criterion is met, when the participant says they are done or stuck, or at 3 minutes.
4. **Help rule.** Give no help. If the participant is stuck for 60 seconds, ask "what would you try next?". If still stuck after 2 minutes, give one hint and record the task as "completed with help"; if they still cannot finish, stop and record "failed".
5. **Questionnaire (5 min).** SUS (below), then three open questions: What was easiest? What was most confusing? What would you change first?
6. **Thank and close.** Within one hour, the note-taker copies the notes to the sheet below.

## Participants

| ID | Role tested | Type (real / proxy) | Age range | Smartphone experience | Date |
|---|---|---|---|---|---|
| P1 | | | | | |
| P2 | | | | | |
| P3 | | | | | |
| P4 | | | | | |
| P5 | | | | | |
| P6 | | | | | |

## Tasks

Wording read to the participant is in quotes. Targets: at least 80% of participants complete each passenger task without help, and every task is done in under 2 minutes.

| ID | Role | Task | Success criterion | Requirement |
|---|---|---|---|---|
| T0 | Passenger | "You want to travel by bus. Start the app and get ready to look for buses." | Reaches Home showing buses | FR3 |
| T1 | Passenger | "Find a bus from Colombo to Kandy tomorrow and open its details." | Reaches Transport Details for a Colombo to Kandy trip | FR3, FR4 |
| T1b | Passenger | "Find a bus from Colombo to Kandy that is on time and leaves after 5 pm." | Opens the 18:30 trip (needs On time only and an evening filter, or reading the list) | FR3 |
| T1c | Passenger | "Save this route so you can find it again, then find it on the home screen." | Route appears under Saved routes on Home | FR3, FR4 |
| T2 | Passenger | "Show where this bus is right now on the map." | Opens Live Tracking with the moving marker | FR7 |
| T2b | Passenger | "Which places does this bus stop at, and when does it reach Kandy?" | Names the stops and the arrival time from Route & Stops or Transport Details | FR4 |
| T2c | Passenger | "Is the bus on its way? Roughly how long until its next stop?" | Gives a sensible answer from the Live Tracking panel (comprehension, not a tap) | FR7 |
| T3 | Passenger | Buy a ticket and find it in My Tickets | Digital Ticket shown | FR1, FR2 |
| T4 | Conductor | Scan a passenger's ticket | Valid screen shown | FR2, FR6 |
| T5 | Conductor | Report a delay | Incident Reported shown | FR7, FR8 |
| T6 | Authority | Publish an alert | Alert Published shown | FR8, FR10 |

T0 to T2c are ready to test now. T3 to T6 depend on the booking, conductor and authority screens; keep them in the plan and run them when those screens are built. Adjust task wording to match the requirement wording once it is filled in on [TRACEABILITY.md](../project/TRACEABILITY.md).

## Measures

| Measure | How |
|---|---|
| Task success | Completed, completed with help, failed |
| Time on task | Seconds, per task |
| Errors | Count of wrong taps or dead ends |
| Satisfaction | System Usability Scale (SUS) questionnaire, 10 questions |
| Qualitative | Quotes and observations |

### Observation sheet (one per participant)

| Task | Outcome (C / CH / F) | Time (s) | Errors | What they said or did |
|---|---|---|---|---|
| T0 | | | | |
| T1 | | | | |
| T1b | | | | |
| T1c | | | | |
| T2 | | | | |
| T2b | | | | |
| T2c | | | | |

C = completed, CH = completed with help, F = failed.

### System Usability Scale

Ask the participant to rate each statement from 1 (strongly disagree) to 5 (strongly agree) about the app they just used.

| # | Statement |
|---|---|
| 1 | I think that I would like to use this app frequently. |
| 2 | I found the app unnecessarily complex. |
| 3 | I thought the app was easy to use. |
| 4 | I think that I would need the support of a technical person to be able to use this app. |
| 5 | I found the various functions in this app were well integrated. |
| 6 | I thought there was too much inconsistency in this app. |
| 7 | I would imagine that most people would learn to use this app very quickly. |
| 8 | I found the app very cumbersome to use. |
| 9 | I felt very confident using the app. |
| 10 | I needed to learn a lot of things before I could get going with this app. |

**Scoring.** For odd statements (1, 3, 5, 7, 9) take the rating minus 1. For even statements (2, 4, 6, 8, 10) take 5 minus the rating. Add the ten values and multiply by 2.5 to get a score from 0 to 100. A score of 68 is average; the target is 68 or higher. Report each person's score and the average.

### Severity scale for issues

| Level | Meaning |
|---|---|
| 1 Cosmetic | Noticed, no effect on the task |
| 2 Minor | Slowed the participant down or caused a small error |
| 3 Major | Caused a failure or help for at least one participant |
| 4 Critical | Blocks the task for most participants; fix before the demo |

An issue seen by 2 or more participants at level 2 is raised to level 3.

## Results (fill in after sessions)

| Task | Success rate | Avg time (s) | Avg errors | Notes |
|---|---|---|---|---|
| T0 | | | | |
| T1 | | | | |
| T1b | | | | |
| T1c | | | | |
| T2 | | | | |
| T2b | | | | |
| T2c | | | | |
| T3 | | | | |
| T4 | | | | |
| T5 | | | | |
| T6 | | | | |

SUS score per participant and average: _to record_.

Compare with the earlier prototype test results (Milestone 2) to show improvement. One earlier finding, UI-01 (show that tracking is live and when it last updated), is already built as the LIVE pill and the "Updated Ns ago" label; check that participants notice and understand it (T2c).

## Issues found and fixes

| ID | Issue | Seen by | Severity | Fix or recommendation | Status |
|---|---|---|---|---|---|
| U1 | | | | | |

## Timeline

| Step | Owner | Target |
|---|---|---|
| Passenger screens merged into `dev`, APK or Expo Go build ready | Silva | _date_ |
| Recruit 6 participants, book sessions | Silva | _date_ |
| Pilot session with a teammate to check the tasks and timings | Silva | _date_ |
| Sessions held | Silva with a note-taker | _date_ |
| Results table, SUS scores and issue list filled in | Silva | _date_ |
| Fixes for severity 3 and 4 issues, then re-check | Owners of the screens | _date_ |

## Evidence to keep

- Session recordings or links
- Completed task sheets and questionnaires
- Before and after screenshots for any fixes
