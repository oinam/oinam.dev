# Becoming AI native: what is missing

Oinam UI is written for agents, but mostly by telling them things. This is the list of what would
make it native to them: checked by tools, measured, and delivered where they work. It is in the
order to build it. The first item matters most, because nothing yet checks what an agent actually
produces.

## To do

The first list is done. These came out of the first eval run.

- [ ] **Run the evals with other agents.** One run by one agent of the same family as the guide's
      author is weak evidence.
- [ ] **Briefs that are not for reading.** An app screen, a wide layout, and a page that needs a
      component with script. All five pages of the first run were one narrow column.
- [ ] **Read the CSS the agents wrote.** Four of five pages wrote 69 to 103 lines of their own.
      What they keep rebuilding is what the system lacks.
- [ ] **Tell a clean page from a mended one.** Record whether the agent ran the linter, and what it
      found the first time, so a run shows what the guide taught and what the linter caught.

## Done

- [x] **Evals.** `evals/`: five briefs, a runner that has an agent build each with only the guide
      to go on, and a scorer that uses the linter and the pictures. The first run is written up
      in `evals/results/`. So far it has been run with one agent; other agents are a flag away.
- [x] **Delivery where agents already work.** `public/ui/skill/SKILL.md`, the steps as a skill,
      and `public/ui/tools/mcp.js`, a Model Context Protocol server with eight tools. Both answer
      from the project's own copy. The server is tested by speaking the protocol to it, not yet
      by connecting a real host. (0.4.0)
- [x] **A shorter guide.** `guide.md` went from about 1,000 lines to under 500: the rules, the
      judgment, and a table of components. Each component has its own page in
      `public/ui/components/`. Whether agents then read those pages is for the evals to say.
      (0.4.0)
- [x] **Patterns, not only parts.** `public/ui/patterns/`: six whole pages, each with a note on
      why it is laid out as it is. Six, not the dozen first suggested; add one when a project
      needs a page none of these is near. (0.4.0)
- [x] **A way for an agent to see its page.** `public/ui/tools/see.js`: pictures at three widths,
      in light and in dark, plus a report of anything that runs off the side or throws. On its
      first run it found the homepage 9px too wide on a small phone. (0.4.0)
- [x] **A linter for pages built with the system.** `public/ui/tools/lint.js`: one command, 21
      rules, no dependencies. It reads the contract, and this site passes it. (0.4.0)
- [x] **A contract a machine can read.** `public/ui/contract.json`: what each element and class
      accepts, with tests that hold it to the stylesheets. The linter reads it. (0.4.0)
- [x] **Design tokens in the standard JSON format.** `public/ui/tokens.json`, in the Design Tokens
      format (2025.10), with the same values as `tokens.css` and a test that holds the two
      together. Tools that cannot read CSS can read this. (0.3.0)
- [x] **A record of why.** `public/ui/why.md`: each decision, what it protects, what it costs, and
      when to revisit it, so that an agent asked to bend a rule knows what the rule is for. (0.3.0)

## What stays human

The components page, Play, and the garden are how a person judges whether the system is any good,
and judging is the part that stays with people. What can be for agents alone is the path they
write along: the guide, the contract, the linter, and the evals.
