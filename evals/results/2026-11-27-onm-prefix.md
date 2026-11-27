# The onm- prefix, 0.8.0 against 0.10.0

Run on 2026-11-27, after 0.10.0 renamed every element from `o-` to `onm-` and gave every class the
same prefix. Only the names changed, so the question was whether an agent reading the renamed
guide still builds the same clean pages, and uses only the new names. The six briefs ran on 0.10.0
and are compared with the 0.8.0 run of 2026-11-24.

| Brief   | 0.8.0 findings | 0.10.0 findings | Made-up elements | Runs off the side | Page errors |
| ------- | -------------- | --------------- | ---------------- | ----------------- | ----------- |
| contact | 0              | 0               | 0, 0             | no, no            | 0, 0        |
| crew    | 0              | 0               | 0, 0             | no, no            | 0, 0        |
| fees    | 0              | 0               | 0, 0             | no, no            | 0, 0        |
| receipt | 0              | 0               | 0, 0             | no, no            | 0, 0        |
| regatta | 0              | 0               | 0, 0             | no, no            | 0, 0        |
| search  | 0              | 0               | 0, 0             | no, no            | 0, 0        |

Every page used the new names and none of the old: no `o-` element and no unprefixed class of the
system in any of the six. The pages' own classes, such as `quiet`, `num`, and `actions`, kept no
prefix, which the guide allows for a page's own CSS; it asks for a prefix of the project's own only
for elements and classes a project builds to fill a gap in the system.

What this does not show: how an agent upgrades a page written for 0.9.0. No brief starts from an
old page, so the changelog's "What to do" was not measured.
