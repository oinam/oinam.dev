# The garden: a plan

The aim is for Oinam UI to be to AI-made design what the
[CSS Zen Garden](https://csszengarden.com) was to CSS: one page of markup that never changes, and
many designs of it, each written by someone else, each proof that the same structure can look like
itself and not like everyone else's.

This is a plan, kept in the repository so it can be argued with. The first stage is built. The
rest is in order of what unlocks the most.

## What exists now

- **The page.** `/garden/` shows one sample page, built from the components. Its markup is fixed.
- **Designs.** Each is one stylesheet in `public/garden/`, holding token values only, with its name
  and author in a comment at the top. `variations.json` lists them, with the fonts each asks for.
- **Choosing one.** `/garden/?design=paper` shows the page in that design. The link can be shared.
- **A gate that an agent can run.** `mise run check` fails a design that sets anything other than
  a token, names a token that does not exist, leaves a color without a dark value, or lets text
  fall below a contrast of 4.5 to 1. A person or an agent can write a design, run the check, and
  know it is sound before anyone reviews it.
- **Play.** `/play/` is where a design starts: choose fonts, corners, and colors, and take the
  result away.
- **How to send one.** `CONTRIBUTING.md` has the steps.

## The rules, and why

- **Tokens only.** A design changes values, never markup and never a component's CSS. The Zen
  Garden allowed any CSS, and its designs broke when the page changed. Tokens are a contract: a
  design written for 0.1.0 keeps working as components are added.
- **Two colors.** Each design chooses its own ink and cloud. This is the system's character, and it
  is what keeps a garden of designs from becoming a garden of gradients.
- **Open fonts, served from here.** A design may use the fonts the system carries. A design that
  needs another must bring it under an open license (stage 3).
- **A name and an author.** A design is someone's work, and says whose.

## What comes next

### Stage 2: make it easy to take a design, and to see them all

- `install.sh` learns to fetch a design by name into the project, beside `ui/`, with the links to
  add printed out.
- The garden's list shows each design as a small picture of the page, not only a name. Without a
  build step these are screenshots made by a script and committed; decide whether that is worth
  it, or whether a row of ink, cloud, and a line of type drawn in CSS says enough.
- Each design gets an address of its own that an agent can be handed: "Read https://oinam.dev/ and
  build the page in the Paper design."
- Play gains "start from" any design in the garden, and a button that writes the file in the
  garden's format, ready to send.

### Stage 3: let designs reach further

- **More tokens.** The more of a component's look is a token, the more a design can change. Add
  them as designs ask for them: border widths, heading weight and case, the gap scale, the shape
  of a button, the weight of a rule. Each new token is a minor version.
- **Fonts a design brings.** A folder per design, with its font files and licenses, checked by the
  same tests as the system's own fonts.
- **A third tier, perhaps.** Some designs will want what tokens cannot say: a different card, an
  underline in place of a box. One answer is a `design` cascade layer that sits above the
  components, allowed to restyle them but not to add elements. It gives the Zen Garden's freedom
  and its fragility, so it should be a separate, clearly marked kind of entry, and only if tokens
  prove too small.

### Stage 4: let it run without the owner

- A pull request with a new design is checked by CI alone: format, the token gate, contrast, and a
  rendered picture attached to the request for a person to look at.
- Designs name the version they were written against, and the check says which designs a change to
  Base would alter.
- If the garden outgrows this repository, it moves to one of its own, and this one keeps Base.

## Decisions for the owner

- **Who may add a design?** Anyone by pull request, or by invitation at first?
- **How many designs ship with the installer?** None today: a project takes Base, and fetches a
  design if it wants one.
- **Is "tokens only" the rule for good, or the rule for now?** Stage 3 turns on this.
- **Does a design have a license of its own?** Today everything here is MIT, and sending a design
  means agreeing to that.
