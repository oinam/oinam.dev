# Status tones, 0.6.0 against 0.7.0

Run on 2026-11-23, before and after 0.7.0 gave badges and alerts four status tones, the first hue
the guide allows. Agent: Claude Code, headless, as `evals/run.js` sets it up.

| Brief   | 0.6.0 findings | 0.7.0 findings | Made-up elements | Runs off the side | Page errors |
| ------- | -------------- | -------------- | ---------------- | ----------------- | ----------- |
| contact | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| fees    | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| receipt | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| regatta | 0              | 0              | 0, 0             | no, no            | 0, 0        |
| search  | 0              | 0              | 0, 0             | no, no            | 0, 0        |

What was being watched for: an agent that reads the exception as leave to color a page. None did.
No page in the 0.7.0 run set a tone or named a status token, and none of these briefs shows
statuses side by side, so none should have. Regatta used an `<o-alert>` in both runs and left it
untoned in 0.7.0, as the guide asks. The elements each page used were the same in both runs but for fees, which used a form (`o-field`, `o-grid`, `o-input-group`) in 0.6.0 and prose (`o-prose`, `o-row`) in 0.7.0. That is two agents reading one brief differently, not the tones.

What this does not show: whether an agent reaches for a tone when a brief does call for one. A
brief with a report of statuses would measure that.
