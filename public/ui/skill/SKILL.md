---
name: oinam-ui
description: Design and build pages with Oinam UI, the design system in this project's ui/ folder. Use whenever you create or change a page, a screen, a component, a form, a layout, or any HTML or CSS a person will look at, even if the request does not mention the design system.
---

# Designing with Oinam UI

This project is designed with Oinam UI, a design system in plain HTML, CSS, and JavaScript. Its
files are in the project, in `ui/`. If the project keeps them somewhere else, use that path
wherever this page says `ui/`.

Follow these steps in order. Do not skip the first three because the request looks small.

## Before you write

1. **Read `ui/guide.md`.** All of it, once per session. It has the rules, and a section on making
   a first draft that does not look generated.
2. **Read the pattern nearest the page you were asked for.** They are whole pages in
   `ui/patterns/`: `form.html`, `table.html`, `settings.html`, `list.html`, `article.html`, and
   `dashboard.html`. Each opens with a comment that says why it is laid out as it is. Take the
   structure, not the words.
3. **Read the page of each component before you use it.** `ui/components/<name>.md`, such as
   `ui/components/button.md`. Do not guess at markup or attributes. `ui/contract.json` lists
   everything each element accepts.

## While you write

- Start from what the page has to say, not from a layout.
- Use the layout elements for spacing, the tokens for every value, and plain HTML inside.
- Put the project's own styles in its own stylesheet, outside `ui/`. Never edit the files in `ui/`.
- If the page needs something the system does not have, build it by the same rules under a prefix
  of the project's own, and tell the owner; see "When something is missing" in the guide.

## Before you hand it back

4. **Lint it.** `node ui/tools/lint.js <the files or folder you changed>`. Mend everything it
   reports and run it again until it says "Clean". Set a rule aside only where it is wrong for
   that line, with the reason in the comment.
5. **Look at it.** `node ui/tools/see.js --root <the site's folder> <the page>`, or give it the
   address of the running site. It saves pictures at three widths, in light and in dark, and
   reports anything that runs off the side or throws. Open the pictures and read them the way the
   owner will. Ask the questions under "Before you hand it back, look at it" in the guide.
6. **Say what you were unsure of.** Which copy you wrote yourself, what you could not check, and
   any rule you set aside and why.

To bend a rule on purpose, read `ui/why.md` first. It says what each rule protects.
