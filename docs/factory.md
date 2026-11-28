# The factory: not here

Decided by the owner on 2026-11-28.

A factory for front-end work, where anyone signs up, asks for a well-designed component or page,
and gets the code back, has been thought through. It is a separate product, not a part of
oinam.dev. It belongs with Inklyn, as the next step in how that product grows, and it is built
there.

## Why not here

- **oinam.dev is a static site, and stays one.** No accounts, nothing behind a sign-in, no
  Workers, and no databases (`AGENTS.md`, under Website, and `docs/cloudflare.md`). A factory
  needs all of these.
- **oinam.dev is the system, not a service.** The components, the guide, the linter, and the
  evals are what a factory would build with. Keeping them apart keeps them open and free, whoever
  builds with them, the factory included.
- **This repository is public.** Accounts, payments, and the running of a service have no place
  in it.

## What oinam.dev keeps

Requests for the system itself still come as they do now: a "design need" issue or a pull
request, as `CONTRIBUTING.md` says. If people come to notice oinam.dev and ask for more than
that, what to do about it is decided then, not now.
