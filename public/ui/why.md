# Why Oinam UI is the way it is

The guide says what the rules are. This page says what each one protects, what it costs, and when
to think again. Read it before you bend a rule, or when an owner asks you to. A rule you understand
can be bent well; a rule you only obey gets broken badly.

Each entry has the same four parts: the decision, why, what it costs, and when to revisit it.

## Two colors

**Decision.** Base has ink and cloud, and every other shade is one mixed into the other. No
component adds a hue. Meaning is carried by weight, size, a border, or by swapping the two.

**Why.** Color is where a page made by an AI gives itself away: the purple gradient, the green for
"good", the row of pastel icon tiles. With two colors those habits are not available, so hierarchy
has to come from type and space, which is where it should come from. It also makes the dark theme
free: swap the two values and every mix follows.

**What it costs.** No red for an error, no green for success. A warning has to be told apart by
weight alone, and a chart cannot tell five series apart.

**Revisit when** a page carries data that needs more than one series, or a state that weight cannot
make clear enough to someone in a hurry. Then add one color, as a token, with a second cue beside
it. Do not add it for decoration.

## Tokens are the only way to change the look

**Decision.** A variation is a stylesheet of token values and nothing else. It does not restyle a
component.

**Why.** A token is a contract. A design written against the tokens of one version still works when
components are added in the next, because it never knew about the components. Free CSS over fixed
markup, which is what the CSS Zen Garden allowed, breaks the first time the markup changes. Tokens
are also something a test can check: a design can be proven readable before anyone looks at it.

**What it costs.** A variation cannot change the shape of a thing, only its values. Two designs can
look more alike than their authors would like.

**Revisit when** designs keep asking for what tokens cannot say. First answer is a new token.
Second, if that is not enough, a marked second kind of design that may restyle components and
accepts that it may break.

## A class on a native element, a custom element for the rest

**Decision.** A button is `<button class="button">`. A text field is `<input class="input">`.
Anything HTML has no element for is a custom element with an `o-` name. A native element is never
wrapped or rebuilt.

**Why.** The browser's own elements come with the keyboard, the screen reader, forms, focus, and
touch already working, in every browser, tested by more people than will ever test this. A rebuilt
button has to earn all of that again and usually does not. Custom elements, for their part, make
the structure of a page readable in the tag names, to a person and to a model.

**What it costs.** Two ways to say "this is a component", which has to be learned. And the native
controls look the way the browser allows: the list a `<select>` opens is not ours to style.

**Revisit** per control, when the browser's version cannot do what a page needs. Then build that
one, with its keyboard and its tests, and say in the guide what it gives up.

## No shadow DOM

**Decision.** Custom elements keep their content in the page itself. The few with script enhance
the markup that is already there.

**Why.** The content can be read without the script: by a reader with scripts off, by a search
engine, and by an agent that fetches the page and never runs it. The page's own styles reach
everything, so a project can adjust a component without a special API. And the markup an agent
writes is the markup that exists.

**What it costs.** Nothing is sealed. A page's styles can break a component, and a component cannot
hide its parts.

**Revisit when** a component needs parts that must not be touched, such as a media player. Use a
shadow root for that one and document its parts.

## No framework, no build step, no dependencies

**Decision.** Plain HTML, CSS, and JavaScript, served as written.

**Why.** It will run in ten years. There is nothing to install, nothing to upgrade, and nothing that
can be abandoned upstream. Anyone can read a file and see everything that happens, which is also
what makes it something to learn from. And an agent can use it in any project, whatever that
project is built with.

**What it costs.** Things are repeated by hand: the site's header in every page, the list of
components in four places. Tests hold the copies to one another, in place of a build. The
stylesheet arrives as many small files.

**Revisit when** the hand-kept copies cost more than the tests save, or when a project needs one
bundled file. A build for the site is a smaller question than a build for the system; the system
should stay usable without one.

## Take a copy, do not link

**Decision.** A project installs the files into its own folder. Nothing in them points back at
oinam.dev.

**Why.** A project should not stop working, or change its look, because another site did. A copy
can be read, pinned, and changed. A page that loads from one place is also faster and more private.

**What it costs.** Copies go stale. Upgrading is a step someone has to take, and a project that
edited its copy has a merge to do.

**Revisit** if upgrades are being skipped. The answer is to make upgrading easier, not to link.

## Link a release, never the newest

**Decision.** Some people will link the files from oinam.dev rather than take them, to try the
system or for a page they will not maintain. They are served for it: every file under `/ui/` may be
loaded from any site, and each version from 0.5.0 on is also kept, frozen, at
`/ui/releases/<version>/`. A release holds only what a page loads: the stylesheets, the scripts,
and the fonts. A release once out is never changed; a fix is a new version.

**Why.** Linking cannot be stopped, since the files are public, so it should at least be safe. A
page linked to `/ui/ui.css` takes every new version the moment it ships, and a renamed class or
token breaks it without a word. A page linked to a release keeps the look it was built with, the
same promise a copy makes. Serving the files costs nothing worth counting: they are small static
files on Cloudflare Pages, cached near each reader, and a release is cached for a year. A shared
host for other people's files was never wanted; this is the system's own site, serving its own
files.

**What it costs.** Each version adds a folder that must never be edited, and the tests and
linters step around it. Git stores a file that did not change between versions only once.

**Revisit** if a release is ever needed that a frozen folder cannot be, or if linking becomes the
way most sites use the system; then upgrading a linked page wants its own guide.

## Script is the exception

**Decision.** A component uses the browser's own `popover`, `<dialog>`, `<details>`, and form
controls before any script is written. Where script is needed, the page still reads correctly
without it.

**Why.** Script is where components break: on a slow connection, in an old browser, when one file
fails to load. What the browser does itself keeps working. Less script is also less to test, and
less for an agent to get wrong.

**What it costs.** Behavior is limited to what the browser offers. The menu has no submenus, and a
tooltip cannot be dismissed with Escape.

**Revisit** per component, when what it lacks is something people need, not something another
library happens to have.

## No card that opens on hover

**Decision.** Extra detail opens on a press, in a popover. A tooltip holds a hint and nothing a
person must read.

**Why.** A finger cannot hover, and neither can a keyboard. Anything shown only on hover is hidden
from a large share of readers.

**What it costs.** One more press on a desktop.

**Revisit** never for content. For a pointer-only convenience on top of something that also works
by press, it is fine.

## The reader's own fonts by default

**Decision.** Base uses the fonts already on the device. Open fonts are carried in the system, to
opt into, and are always served from the project's own copy.

**Why.** No font is the fastest font, and it never fails to load. Fonts fetched from another site
tell that site who is reading.

**What it costs.** Base looks a little different on each platform: its headings are Iowan Old Style
on a Mac and Times New Roman on Windows.

**Revisit** per project. A project that needs one look everywhere links a font in its variation.

## Sentence case, and no decoration that says nothing

**Decision.** Headings and labels are written like sentences. No label in capitals above a heading,
no numbers on sections, no badge on ordinary text, no icon that is only an ornament.

**Why.** These are the marks of a page laid out by habit. Each one adds something to look at and
nothing to know. Taking them away leaves the content to do the work, and shows at once when there
is not enough of it.

**What it costs.** A page can look plain, and a weak headline has nowhere to hide.

**Revisit when** a label carries real information: a date, a status, a category the reader filters
by.

## A short guide in plain text, and a page for each component

**Decision.** `guide.md` is the core: how to take the system, the rules, the judgment, and the list
of components. Each component has a page of its own, read when it is used. An owner hands an agent
one address, the front page, and the front page sends it on.

**Why.** An agent follows what it has read, and it reads plain text best. The rules are read every
time, so they are kept short; a component's markup is needed only when that component is. One
address is one thing for a person to remember, and one thing that cannot go out of date in a
hundred prompts.

**What it costs.** An agent has to fetch a second page before it uses a component, and one that
does not will guess. The linter is there to catch the guess.

**Revisit when** the evals show agents guessing at markup they did not read. Then put the most used
components back in the core.

## Tests in place of trust

**Decision.** Every rule that can be checked by a program is. Tests hold the files, the registry,
the guide, the components page, the tokens, and the version to one another, and gate what others
send.

**Why.** The system is kept by hand and extended by agents, and both forget. A rule in a document
is followed until it is not; a failing test is noticed. It is also what lets a stranger's design
be accepted without a long review.

**What it costs.** Adding a component means touching several places, and the tests insist on all of
them.

**Revisit** never, but keep adding to them. A rule that is only written down is on the list to be
turned into a check.
