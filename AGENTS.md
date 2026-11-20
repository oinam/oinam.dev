# oinam.dev

Instructions for any AI agent working in or pointed at this repository. This file is the canonical
source; tool-specific files (such as `CLAUDE.md`) import it rather than repeat it.

## Purpose

- This is the starting point to hand any AI at the beginning of design and development work.
- Read this file first. It sets the scope, audience, standards, and style that every oinam.dev
  project inherits. A project may add its own rules on top, but not loosen these.

## Scope

- This repository is only for AI: AI agents, agent harnesses, prompts, skills, evals, and the
  tooling around them.
- Anything that is not about AI belongs in another repository.

## Audience

- Primary: personal work, family work, and general Oinam work and projects.
- Later, possibly, the public. Write and build so that opening it up needs no rework: no private
  data, no personal details, and no secrets in the repository.

## Visibility

- GitHub repositories under oinam.dev are public by default.
- Treat everything committed as published. A repository is made private only by explicit choice,
  never by default.
- Every oinam.dev repository carries the GitHub topic `oinam-dev`, so the group can be filtered on
  GitHub. (Topics allow only lowercase letters, numbers, and hyphens, so no dot.) Grouping uses
  topics only; no custom properties.

## Standards

All code meets the highest standard practice for its language and ecosystem. A change is not done
until every point below holds.

- **Linted.** Use the ecosystem's standard linter, configured in the repository, with zero warnings.
- **Formatted.** Use the ecosystem's standard formatter, configured in the repository, so output
  never depends on an editor.
- **Evaluated.** Anything that drives or wraps a model (prompts, agents, skills, harnesses) ships
  with evals that measure whether it does its job, and those evals are run before the change lands.
- **Tested.** Deterministic code ships with a well-written test suite that passes. Bugs get a
  failing test before the fix.
- **Followed.** Lint, format, eval, and test run in CI on every push and pull request; a red check
  blocks the merge. Do not skip, silence, or weaken a check to get a change through.
- **Documented.** Each project states how to install, lint, format, test, and run evals in one
  place, and keeps it current.

## Writing style

- Plain text. No emoji or emoticons, in code, comments, docs, commit messages, or output, unless a
  specific case truly needs one.
- American English with the Oxford comma.

## Ownership

- `README.md` belongs to the owner. Agents do not edit it unless the owner gives explicit
  permission for that specific change.
