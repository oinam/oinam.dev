# Kinds and the accent, 0.7.0 against 0.8.0

Run on 2026-11-24, after 0.8.0 gave badges six numbered hues for kinds and buttons an accent for the
one main action. A new brief, `crew`, was written for it: a listing whose rows each carry a status,
several kinds of work, and one thing to ask for, the first brief that calls for color at all. It
was run on the 0.7.0 guide and on 0.8.0; the other five ran on 0.8.0 and are compared with the
0.7.0 run of 2026-11-23.

| Brief   | 0.7.0 findings | 0.8.0 findings | Made-up elements | Runs off the side | Page errors |
| ------- | -------------- | -------------- | ---------------- | ----------------- | ----------- |
| contact | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| crew    | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| fees    | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| receipt | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| regatta | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| search  | 0              | 0              | 0, 0             | no, no            | 0, 0        |

Where color was called for, it was used as the guide asks:

- **crew, 0.7.0.** Statuses took tones (Open as success, Filling as warning), and the kinds of work took no color, since the guide gave them none.
- **crew, 0.8.0.** Statuses took the same tones, and Taken was left plain. Each kind of work kept one
  hue on every row: Deck 1, Navigation 3, Engine 4, Cooking 2, First aid 5. The accent went on the
  one action that sends something, "Send to the skipper", in each form, with Cancel beside it
  quieter; the row buttons that open a form stayed outline.

Where it was not called for, it was not used. contact, fees, receipt, and search set no hue, tone,
or accent. regatta made its bad-weather notice `<o-alert variant="warning" tone="warning">`, which
the guide allows: a status, with its weight, and its words.

What this does not show: how an agent chooses among six hues when it has more kinds than six, or
whether the accent is held to one per page on a page with several forms. A brief with many forms
would measure the second.
