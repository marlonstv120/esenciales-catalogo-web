# AGENTS.md

## Purpose

This file defines the working rules for AI agents contributing to `esenciales-catalogo-web`.

The goal is to help build a functional, understandable, maintainable, and academically defensible Full Stack project without losing context or introducing unnecessary complexity.

AI is a development assistant, not the final decision-maker. Important implementation, scope, architecture, dependency, and technology decisions should be presented to the user before being treated as accepted unless they were already explicitly approved.

---

## 1. Read context before working

Before making meaningful changes, read the documentation relevant to the task.

Minimum context:

1. `README.md`
2. `docs/README.md`
3. `docs/project/overview.md`
4. `docs/project/scope.md`
5. `.ai/current-context.md`

Then consult as needed:

* Requirements → `docs/project/requirements.md`
* Business rules → `docs/project/business-rules.md`
* Actors and flows → `docs/project/actors-and-flows.md`
* Architecture → `docs/architecture/overview.md` and relevant ADRs
* Course requirements → `docs/sources/` and `docs/academic/`
* Academic report → `docs/academic/report/`
* Project history → `docs/history/`

Do not read or modify unrelated documentation unnecessarily.

---

## 2. Source priority

When information conflicts, use this priority:

1. Latest explicit professor instructions.
2. Official course documents.
3. Confirmed project decisions.
4. Confirmed requirements and business rules.
5. Accepted architecture decisions.
6. Professional best practices compatible with the course.
7. Simplicity and ease of understanding.

Never silently resolve an important contradiction. Point it out when it affects the requested work.

---

## 3. Never invent project information

Do not assume or fabricate:

* requirements;
* business rules;
* professor instructions;
* user needs;
* implemented functionality;
* technologies;
* dependencies;
* architecture decisions;
* database structures;
* test results;
* evidence;
* academic results;
* conclusions;
* references.

When information is uncertain, distinguish explicitly between:

* `Confirmed`
* `Preliminary`
* `Pending validation`
* `Outside MVP`
* `Future evolution`

If required information is missing, ask for it or clearly state the assumption/proposal before proceeding.

Do not present a proposal as an existing project decision.

---

## 4. Protect the MVP

The current project is focused on Esenciales.

Multi-business support is future evolution and is not an MVP requirement.

Before proposing additional functionality, evaluate:

* Does it solve the current problem?
* Is it required by the course or professor?
* Does it provide meaningful value?
* Is it feasible within the available time?
* Does it add unnecessary complexity?

Do not turn the MVP into a larger commercial platform without an explicit decision.

---

## 5. User retains final decision

For meaningful changes involving:

* scope;
* architecture;
* technologies;
* dependencies;
* data model;
* authentication/security strategy;
* important business behavior;
* removal or replacement of functionality;

explain the proposed change and its reason before treating it as accepted.

When multiple reasonable alternatives exist, briefly explain the relevant trade-offs and recommend the option most appropriate for the course and current project.

Do not make unnecessary project-level decisions on behalf of the user.

Small implementation details that follow already accepted decisions do not require repeated approval.

---

## 6. Programming principles

Prioritize, in this order:

1. Correct behavior.
2. Clarity and readability.
3. Security.
4. Maintainability.
5. Compatibility with course requirements and current project decisions.
6. Simplicity.

Follow good practices appropriate to the current stage of the course.

In particular:

* use clear and descriptive names;
* keep responsibilities focused;
* avoid duplicated logic when a simple reuse is appropriate;
* validate external/user input where necessary;
* handle expected errors appropriately;
* use semantic and accessible HTML when applicable;
* keep CSS organized and responsive when applicable;
* keep JavaScript understandable;
* handle asynchronous operations and failures correctly;
* protect secrets and sensitive configuration;
* never hard-code credentials, tokens, passwords, or private keys;
* avoid unnecessary global state;
* remove dead code introduced by a change;
* preserve consistency with existing project conventions.

Do not introduce abstractions, patterns, layers, libraries, or dependencies only because they are considered modern or sophisticated.

Prefer the simplest correct solution that leaves the code understandable and maintainable.

---

## 7. Dependencies and technologies

Do not add a dependency without checking whether it is actually necessary.

Before introducing an important dependency or new technology:

1. explain what problem it solves;
2. determine whether the existing stack can solve the problem reasonably;
3. consider its complexity and impact;
4. verify compatibility with the course and project;
5. obtain user approval when it represents a meaningful project decision.

Do not replace course technologies merely because another technology would be more common professionally.

If an academic requirement differs from common professional practice, prioritize the academic requirement and briefly explain the difference when relevant.

---

## 8. Existing code first

Before modifying existing code:

1. inspect the relevant implementation;
2. understand what it currently does;
3. identify the actual problem or requested change;
4. determine the smallest reasonable modification;
5. preserve unrelated behavior.

Do not rewrite complete files when a focused modification is sufficient.

When debugging, do not guess the cause of an error. Use available evidence and request missing information when necessary.

---

## 9. Learning and explainability

This is both a software project and a learning project.

The user must be able to understand the implementation and defend the project during the academic presentation.

When the user asks to learn, understand, review, or explain something:

* explain what it is;
* explain what purpose it serves;
* explain how it works in the current context;
* explain why the selected approach is appropriate;
* relate it to the project when useful.

Do not over-explain every routine change automatically.

For normal implementation tasks, keep explanations proportional to the complexity and importance of the change.

Never use complexity as a substitute for understanding.

Code generated by AI is not considered correct merely because it compiles or appears to work. It should be understandable, testable, and validated.

---

## 10. Changes and validation

After implementing a change:

* review the affected code;
* run appropriate available checks/tests when possible;
* report what was actually validated;
* distinguish successful validation from assumptions;
* mention relevant limitations or untested behavior.

Do not claim that something works unless it was reasonably verified.

Do not silently modify unrelated functionality.

---

## 11. Documentation maintenance

Documentation must evolve with the project, but not every code change requires updating every document.

Update only documentation actually affected by the change.

Examples:

* Scope changed → `docs/project/scope.md`
* Requirement changed → `docs/project/requirements.md`
* Business rule changed → `docs/project/business-rules.md`
* Actor/flow changed → `docs/project/actors-and-flows.md`
* Important technical decision → relevant ADR
* Professor instruction → `docs/academic/professor-instructions.md` and affected documents
* Relevant project milestone/decision → `docs/history/project-log.md`
* Relevant product change → evaluate `docs/history/CHANGELOG.md`
* Current working state changed significantly → `.ai/current-context.md`

Avoid duplicating large amounts of information. Link to the source of truth instead.

When a decision is replaced, preserve its history rather than rewriting the past.

---

## 12. Architecture decisions

Important technical decisions should be documented using ADRs under:

`docs/architecture/decisions/`

Do not create an ADR for trivial implementation details.

Do not create retrospective fictional decisions.

If an accepted decision changes, document why it changed and preserve traceability.

---

## 13. Academic documentation

The working academic material is located under:

`docs/academic/report/`

The current official requirements are defined by the source documents under:

`docs/sources/`

Professor instructions given later have priority when applicable.

Do not assume that every development activity belongs in the academic report.

Never invent:

* results;
* evidence;
* tests;
* conclusions;
* references;
* project outcomes.

Do not describe planned functionality as implemented.

Evaluate whether actual project progress provides relevant material before updating `REPORT_DRAFT.md`.

The official final document is maintained separately by the team. Markdown files in the repository are working material and context, not automatically the final submitted document.

---

## 14. AI context

`.ai/` exists to accelerate continuity between AI sessions.

It is not a second source of truth.

Permanent knowledge belongs in `docs/`.

Keep `.ai/current-context.md` concise and use links to canonical documentation instead of duplicating it.

Temporary reasoning and disposable working material belongs in `.ai/scratch/`.

---

## 15. Git and destructive actions

Do not perform destructive or difficult-to-reverse actions without explicit approval.

Do not automatically:

* delete important files;
* rewrite Git history;
* force push;
* discard uncommitted work;
* remove dependencies with project-wide impact;
* perform irreversible migrations.

Before potentially destructive commands, explain their effect.

Do not commit or push unless explicitly requested.

---

## Core principle

Build only what the project currently needs, based on verified context.

Understand before modifying.
Do not invent missing information.
Prefer simple and defensible solutions.
Keep code, documentation, academic work, and confirmed decisions consistent.
Use AI to assist development, not to replace understanding or human decision-making.
