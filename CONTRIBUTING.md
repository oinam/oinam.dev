# Contributing

Oinam UI is meant to be used in real projects, and to grow from what those projects turn out to
need. There are three ways to send something back.

## Send a need

A project needed something the components do not have, or do not do well. That is the most useful
thing to hear about, and it does not have to come with a fix.

Open a [design need](https://github.com/oinam/oinam.dev/issues/new?template=design-need.md). Say
what the page needed, where, and what was done in the meantime. If the project built its own
version to get by, paste the markup and CSS; that is the best starting point for a component.

An agent working in a project should write this up for the project's owner to send. It should not
post it on its own.

## Send a change

Read [AGENTS.md](AGENTS.md) first, the Components section above all. It is the canonical statement
of how the components are made. In short:

- Plain HTML, CSS, and JavaScript. No framework, no build step, and no dependencies.
- A native element that does the job takes a class. Anything else is an `onm-` custom element.
- Script is an enhancement, in the light DOM, around HTML that reads correctly without it.
- Tokens only. Base has two colors, and no component adds a hue.

Then:

1. `mise trust` and `mise install`, once.
2. Make the change. A new component goes in every place AGENTS.md lists; the tests fail until it
   is in all of them.
3. `mise run dev`, and look at it on the components page, in light and in dark, on a narrow screen
   and a wide one.
4. `mise run check`. It must pass.
5. Add what changed to the top entry of `public/ui/CHANGELOG.md`. If a page that worked could stop
   working, say under "What to do" exactly what a project must change, by old name and new.
6. Open a pull request that says what need the change answers.

## Send a design

The [garden](https://oinam.dev/garden/) shows one page in many designs. A design is a variation of
Base: one stylesheet that sets tokens and nothing else. Anyone may send one, and an agent can make
one end to end.

1. Start in [Play](https://oinam.dev/play/), or from the list of tokens in
   `public/ui/tokens.css`.
2. Write `public/garden/<name>.css`. Open it with a comment giving the design's title, `By` and
   your name, a sentence about it, and the fonts it needs. Then one `:root` rule that sets only
   tokens. `public/garden/paper.css` is the pattern.
3. Add it to `public/garden/variations.json`, and add a row to the table in
   `public/garden/index.html`.
4. `mise run dev`, and look at `/garden/?design=<name>`, in light and in dark.
5. `mise run check`. It fails a design that sets anything but a token, names a token that does not
   exist, gives a color no dark value, or lets text fall below a contrast of 4.5 to 1.
6. Open a pull request. What you send is under the MIT license, like everything here.

A design keeps to two colors, its own ink and cloud. It may use the fonts in `public/ui/fonts/`.
Where this is heading is in [docs/garden-plan.md](docs/garden-plan.md).

## What belongs here, and what does not

- **A change to Base** belongs here: a new component, a new option, a new token, a fix.
- **A variation** is a look made by changing tokens. One that is a project's own lives in that
  project. One that others could use belongs in the garden.
- **One project's special case** stays in that project, built by the same rules, under a prefix of
  its own.
