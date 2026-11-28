# Phosphor's icons, 0.10.0 against 0.11.0

Run on 2026-11-28, after 0.11.0 added Phosphor's icons and a short "Icons" section to the guide.
The question was twofold: whether the new section made agents reach for icons where none belong,
and whether, where one did belong, they used it as `icons.md` says. The six briefs ran on 0.11.0
and are compared with the 0.10.0 run of 2026-11-27.

| Brief   | 0.10.0 findings | 0.11.0 findings | Icons used | Made-up elements | Runs off the side | Page errors |
| ------- | --------------- | --------------- | ---------- | ---------------- | ----------------- | ----------- |
| contact | 0               | 0               | 1          | 0, 0             | no, no            | 0, 0        |
| crew    | 0               | 0               | 10         | 0, 0             | no, no            | 0, 0        |
| fees    | 0               | 0               | 0          | 0, 0             | no, no            | 0, 0        |
| receipt | 0               | 0               | 0          | 0, 0             | no, no            | 0, 0        |
| regatta | 0               | 0               | 0          | 0, 0             | no, no            | 0, 0        |
| search  | 0               | 0               | 0          | 0, 0             | no, no            | 0, 0        |

Four of the six used no icon and said why, in the guide's words: none would tell the reader
anything the words do not. The search page named the case outright: a magnifying glass beside the
word "Search" would only decorate.

The two that used icons used them as `icons.md` says. Crew put a bookmark on each row's Save
button, regular when off and fill when saved, which is the one use of fill the page allows; every
icon was Phosphor's, inlined at `1.25em`, in `currentColor`, with `aria-hidden="true"`, and the
page carried Phosphor's license. Contact put a phone on its call button, and called it borderline
under the rule against decoration itself.

What this does not show: whether an agent finds the right icon by its tags in `icons.json` when
the name is not obvious, since every icon used here had an obvious name.
