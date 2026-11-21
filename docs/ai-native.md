# Becoming AI native: what is missing

Oinam UI is written for agents, but mostly by telling them things. This is the list of what would
make it native to them: checked by tools, measured, and delivered where they work. It is in the
order to build it. The first item matters most, because nothing yet checks what an agent actually
produces.

## To do

- [ ] **A linter for pages built with the system.** One command an agent runs on its own output.
      It fails on a raw color, an unknown `o-` element or attribute, a control with no label, a
      card inside a card, two solid buttons side by side, an inline style. The garden has this
      kind of gate for designs; pages have none. Agents are good at fixing what a tool reports and
      poor at remembering rules.
- [ ] **Evals.** The standards here say anything that drives a model ships with evals, and the
      guide drives models. A set of briefs ("a pricing page", "a settings screen"), run through
      several agents, scored by the linter and by a look at the rendered page. It shows which
      rules agents ignore, and whether a change to the guide helps or hurts.
- [ ] **A way for an agent to see its page.** The guide says to look at the page, and gives no
      tool for it. A script that renders a page at three widths, in light and in dark, and saves
      the pictures.
- [ ] **Patterns, not only parts.** There are 37 components and one example page. A dozen worked
      pages: a form, a table view, a settings screen, a list that goes from empty to full, an
      article, a dashboard. Agents fall back on the generic layout when they have parts but no
      compositions.
- [ ] **A shorter guide.** It is one file, read in full every time, and it grows with each
      component. Split it into a short core (the rules, layout, and the judgment) and a file per
      component, fetched as needed.
- [ ] **A contract a machine can read.** The registry lists files, but not what each element
      accepts: its attributes, their values, what may go inside it. That is what the linter reads,
      and what an agent can check against before it writes.
- [ ] **Delivery where agents already work.** A skill, and perhaps a small MCP server, so an agent
      can ask for one component without fetching a web page.

## Done

- [x] **Design tokens in the standard JSON format.** `public/ui/tokens.json`, in the Design Tokens
      format (2025.10), with the same values as `tokens.css` and a test that holds the two
      together. Tools that cannot read CSS can read this. (0.3.0)
- [x] **A record of why.** `public/ui/why.md`: each decision, what it protects, what it costs, and
      when to revisit it, so that an agent asked to bend a rule knows what the rule is for. (0.3.0)

## What stays human

The components page, Play, and the garden are how a person judges whether the system is any good,
and judging is the part that stays with people. What can be for agents alone is the path they
write along: the guide, the contract, the linter, and the evals.
