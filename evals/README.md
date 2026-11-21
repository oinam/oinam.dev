# Evals

The guide is a prompt: it is what an agent reads before it designs. The standards of this
repository say that anything which drives a model ships with evals that measure whether it does
its job. These are the guide's.

## What a run does

For each brief in `briefs/`, a run makes an empty project with a copy of the system in `ui/`, as
`install.sh` would leave it, and asks an agent to build the page. The agent gets the brief and one
instruction: read `ui/guide.md` and follow it. It is told nothing the guide should have taught it.

Then each page is:

- **scored** by the system's own linter, and for whether it was built at all, whether it used the
  project's copy of the system, and whether it made up elements the system does not have;
- **photographed** at three widths, in light and in dark, with a note of any width where it runs
  off the side and any error it throws;
- **written up**, with what the agent said about its own work, in `runs/<label>/results.md`.

There is no single score, on purpose. What a program can tell is in the table. Whether a page looks
made, and not generated, is for a person: open the pictures in `seen/` beside each page.

## Running one

```sh
mise run eval                                   # every brief, with Claude Code
node evals/run.js fees contact                  # only these briefs
node evals/run.js --label after-split           # a name, to compare runs
node evals/run.js --agent "codex exec"          # another agent
```

The agent is any command that reads the instruction on its standard input and works in the
current folder. The default is Claude Code, headless, allowed to read, write, and run the system's
tools, and with the user's own settings left out so that they do not teach it the rules.

A run spends the agent's tokens and takes several minutes, so it is not part of `mise run check`.
Run one before and after a change to the guide, a component's page, or the skill, and compare.

`runs/` is not committed; the pages and pictures are large. A run worth keeping is summarized in
`results/`.

## Reading the results

- **Lint findings** are rules the guide states that the agent broke anyway. A rule that is broken
  often is a rule the guide is not getting across: say it sooner, say it plainer, or show it.
- **Made-up elements** mean the agent guessed at a component and did not read its page.
- **Runs off the side** and **page errors** mean it did not look at what it built.
- **Notes** are habits the linter lets pass: rows of equal cards, centered text, a great many
  badges. They are prompts for a person to look, not faults.

## Briefs

A brief describes a page by what its reader came for and the facts it has to carry. It does not
say how to design the page; that is what is being measured. To add one, write
`briefs/<name>.md` with the same two headings. A test checks that each brief has them.

Choose pages that are not among the patterns, so that a run measures the guide and not the
agent's skill at copying.
