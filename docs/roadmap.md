# Roadmap: the components still to build

The measure is the component list of [shadcn/ui](https://ui.shadcn.com/docs/components), read from
their own index on 2026-11-21: 59 entries. Tailwind CSS is not on this page because it is a styling
toolkit, not a set of components; the tokens and layout elements here cover that ground.

As of version 0.4.0, 45 of the 59 have an answer here, one has half an answer, and 13 do not.

"Has an answer" does not mean "is as proven". shadcn/ui stands on libraries with years of
accessibility work behind them. The answers here lean on native elements, which carry much of that
for free, and have been checked in Chrome and in a simulated browser only. Safari, Firefox, a screen
reader, and real use in projects are still to come, and belong on this roadmap as much as any
missing component.

## What each one maps to

| shadcn/ui                      | Here                                               | Note                                                  |
| ------------------------------ | -------------------------------------------------- | ----------------------------------------------------- |
| Accordion, Collapsible         | `<onm-accordion>` around `<details>`               | One `<details>` alone is a collapsible                |
| Alert                          | `<onm-alert>`                                      |                                                       |
| Alert Dialog                   | `.onm-dialog` with `role="alertdialog"`            | No `closedby`, so only its buttons close it           |
| Aspect Ratio                   | `<onm-ratio>`                                      |                                                       |
| Avatar                         | `<onm-avatar>`                                     |                                                       |
| Badge                          | `<onm-badge>`                                      |                                                       |
| Breadcrumb                     | `.onm-breadcrumb`                                  |                                                       |
| Button                         | `.onm-button`                                      |                                                       |
| Button Group                   | `<onm-button-group>`                               |                                                       |
| Card                           | `<onm-card>`                                       |                                                       |
| Checkbox, Radio Group          | `.onm-choice`                                      | The browser's own controls, in ink                    |
| Dialog                         | `.onm-dialog`                                      | Opened by `commandfor`, with no script                |
| Drawer, Sheet                  | `.onm-dialog` with `data-side`                     | No drag to dismiss                                    |
| Dropdown Menu                  | `<onm-menu>`                                       | No submenus, and no checkable items                   |
| Context Menu                   | `<onm-menu context>`                               | Right click only; no long press on touch              |
| Empty                          | `<onm-empty>`                                      |                                                       |
| Field, Label                   | `<onm-field>`                                      |                                                       |
| Hover Card                     | `.onm-popover`                                     | By choice: it opens on a press, which touch can reach |
| Input, Textarea, Native Select | `.onm-input`                                       |                                                       |
| Input Group                    | `<onm-input-group>`                                |                                                       |
| Item                           | `<onm-item>`                                       |                                                       |
| Kbd, Typography, Separator     | Plain `<kbd>`, headings, `<hr>`, and `<onm-prose>` | Styled as they are                                    |
| Pagination                     | `.onm-pagination`                                  |                                                       |
| Popover                        | `.onm-popover`                                     |                                                       |
| Progress                       | `.onm-progress`                                    |                                                       |
| Scroll Area                    | `<onm-scroll>`                                     | The browser's own scrollbar, made thin                |
| Skeleton                       | `<onm-skeleton>`                                   |                                                       |
| Slider                         | `.onm-slider`                                      | One thumb; no range between two                       |
| Sonner, Toast                  | `<onm-toast>`                                      | No stacking animation, and no action button           |
| Spinner                        | `<onm-spinner>`                                    |                                                       |
| Switch                         | `input[role="switch"]`                             |                                                       |
| Table                          | `<onm-table>`                                      |                                                       |
| Tabs                           | `<onm-tabs>`                                       |                                                       |
| Toggle, Toggle Group           | `.onm-toggle`, `<onm-toggle-group>`                | A checkbox or radio underneath                        |
| Tooltip                        | `<onm-tooltip>`                                    | Always above; Escape does not dismiss it              |
| Select                         | `.onm-input` on `<select>`                         | Half: the list that opens is the browser's own        |

## Still to build

### Next: behavior that has to be written and tested

Each of these needs script of its own, keyboard handling, and tests. One to two weeks of work
together, by the estimate given when this roadmap was asked for.

- **Combobox.** A field that filters a list as you type. The hardest of this group to get right
  for screen readers.
- **Command.** The search palette on this site is one, but it is the site's own code. Make it a
  component, `<onm-command>`.
- **Menubar** and **Navigation Menu.** Menus that open from a bar, with arrow keys across it.
- **Input OTP.** One box per digit of a code.
- **Carousel.** CSS scroll snapping does most of it; the buttons and the announcements are script.
- **Sidebar.** A collapsing side column for an app, with its state remembered.
- **Resizable.** Panels with a handle between them.
- **Data Table.** Sorting, and perhaps filtering, on top of `<onm-table>`.
- **Select**, the other half: a styled list. Wait for the browser's own customizable `<select>`
  to be dependable, and then it is CSS.
- **Direction.** Right-to-left text. The stylesheets still say `left` and `right` in places where
  they should say `inline-start` and `inline-end`.

### Later: large on their own

A week or more each. Build them when a project needs them. Until then, `<input type="date">` is the
date picker.

- **Calendar** and **Date Picker.**
- **Chart.**

### Alongside: proving what is here

- Check every component in Safari and in Firefox.
- Go through each with a screen reader.
- Use the system in real projects, and let their design needs set the order of everything above.

## How this page is kept

When a component is added, move its row up into the table and take it off the list. When shadcn/ui
adds one, add it here. The count at the top is the table and the lists, counted.
