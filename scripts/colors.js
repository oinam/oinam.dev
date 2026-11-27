/*
 * Write the color pages from the list of colors:
 *
 *   mise run colors
 *
 * The list, public/colors/colors.json, is kept by hand. Each color is three
 * tokens, ink, cloud, and milk, in light and in dark, and every other shade is
 * mixed from them the way tokens.css mixes them. Writing the pages by hand
 * would mean working out every shade and every ratio by hand too, and getting
 * some of them wrong, so this script does it and the pages are committed as it
 * writes them. tests/colors.test.js fails when a page and the list disagree.
 *
 * It writes:
 *
 *   public/colors/index.html      every color, side by side, in light and dark
 *   public/colors/<id>/index.html one color: its values, its shades, its contrast
 *   public/colors/<id>.css        the color to take away, three tokens
 *   public/colors/colors.css      every color, scoped, for the list to show
 *
 * The header and footer are taken from the garden page, so they stay the same
 * as on every other page. After changing them, run this again.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import * as prettier from "prettier";

import { contrast, hex, mix, oklch, parse, toOklab, toOklch } from "./color.js";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");

/** The shades tokens.css mixes from ink and cloud, with how much ink is in each. */
export const SHADES = [
  {
    token: "--color-ink-soft",
    name: "Soft",
    chip: "soft",
    share: 0.68,
    use: "Running text in prose, and the lede.",
  },
  {
    token: "--color-ink-faint",
    name: "Faint",
    chip: "faint",
    share: 0.58,
    use: "Hints, captions, and the quietest text.",
  },
  {
    token: "--color-line-strong",
    name: "Strong line",
    chip: "line-strong",
    share: 0.24,
    use: "The edges of fields and outlined buttons.",
  },
  {
    token: "--color-line",
    name: "Line",
    chip: "line",
    share: 0.12,
    use: "Rules, and the edges of cards and tables.",
  },
  // The wash is ink mixed into nothing, so it shows the cloud through it; on cloud it is this.
  {
    token: "--color-wash",
    name: "Wash",
    chip: "wash",
    share: 0.06,
    use: "A tint behind code, and under a row as the pointer passes.",
  },
];

const THREE = [
  { key: "ink", token: "--color-ink", name: "Ink", use: "Text, icons, and the solid buttons." },
  { key: "cloud", token: "--color-cloud", name: "Cloud", use: "The page." },
  {
    key: "milk",
    token: "--color-milk",
    name: "Milk",
    use: "Cards, fields, and anything raised above the page.",
  },
];

const THEMES = ["light", "dark"];

/**
 * A shade in OKLCH, rounded evenly for reading. A shade is worked out by the browser and written
 * nowhere, so it needs no more places than a person reads; the hex beside it is exact.
 */
function rounded(color) {
  const [L, a, b] = toOklab(color);
  const C = Math.hypot(a, b);
  const H = C < 0.0005 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  const trim = (value, places) => String(Number(value.toFixed(places)));
  return `oklch(${trim(L * 100, 1)}% ${trim(C, 3)} ${trim(H, 1)}deg)`;
}

/** A color from its lightness, chroma, and hue, its chroma cut until a screen can show it. */
function shown(L, C, H) {
  for (let chroma = C; chroma > 0.002; chroma -= 0.002) {
    const color = oklch(`oklch(${L.toFixed(3)} ${chroma.toFixed(3)} ${H.toFixed(1)})`);
    if (color.every((value) => value >= 0 && value <= 1)) return color;
  }
  return oklch(`oklch(${L.toFixed(3)} 0 0)`);
}

/*
 * The accent, the fill of the one main action, and the label on it. A color may set its own in the
 * list. One that does not takes it from its inks: the hue of whichever ink has more color, in both
 * themes, so the accent is one color by day and by night, with the chroma of a color meant to be
 * seen, as light as it can be by day and as deep as it can be by night while its label reaches 7
 * to 1. A pair whose inks are grey has no color to lend, and a lighter grey reads as a button that
 * is turned off, so there the accent is the ink, as the solid button is. By day the label is white; by night it is the page's
 * own cloud. The fill stands at 3 to 1 or better against cloud and milk either way.
 */
const ACCENT_CHROMA = 0.15;
const ACCENT_LABEL = 7;

function accentOf(color) {
  if (color.accent) return { accent: color.accent, accentText: color.accentText };
  const accent = [];
  const accentText = [];
  const [inkChroma, hue] = color.ink
    .map((ink) => toOklab(parse(ink)))
    .map(([, a, b]) => [Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360])
    .reduce((more, other) => (other[0] > more[0] ? other : more));
  if (inkChroma < 0.03) return { accent: color.ink, accentText: color.cloud };
  const chroma = Math.max(inkChroma, ACCENT_CHROMA);
  for (const at of [0, 1]) {
    const [cloud, milk] = [color.cloud[at], color.milk[at]].map(parse);
    const label = at === 0 ? [1, 1, 1] : cloud;
    // By day, from light to dark; by night, from dark to light. The first that passes is the one.
    const steps = Array.from({ length: 160 }, (_, step) => 0.98 - step * 0.005);
    if (at === 1) steps.reverse();
    const fill = steps
      .map((L) => shown(L, chroma, hue))
      .map((candidate) => parse(toOklch(candidate)))
      .find(
        (candidate) =>
          contrast(label, candidate) >= ACCENT_LABEL &&
          contrast(candidate, cloud) >= 3 &&
          contrast(candidate, milk) >= 3,
      );
    accent.push(toOklch(fill));
    accentText.push(toOklch(label));
  }
  return { accent, accentText };
}

/** Every color in the list, with its shades and its contrast worked out, in light then dark. */
export function colors(list = JSON.parse(read("public/colors/colors.json")).colors) {
  return list.map((given) => {
    const color = { ...given, ...accentOf(given), given: Boolean(given.accent) };
    const themes = THEMES.map((theme, at) => {
      const [ink, cloud, milk] = [color.ink[at], color.cloud[at], color.milk[at]].map(parse);
      const shades = Object.fromEntries(
        SHADES.map((shade) => [shade.chip, mix(ink, cloud, shade.share)]),
      );
      const texts = { Ink: ink, Soft: shades.soft, Faint: shades.faint };
      const ratios = Object.fromEntries(
        Object.entries(texts).map(([name, text]) => [
          name,
          { cloud: contrast(text, cloud), milk: contrast(text, milk) },
        ]),
      );
      return {
        theme,
        values: Object.fromEntries(
          ["ink", "cloud", "milk", "accent", "accentText"].map((key) => [
            key,
            { oklch: color[key][at], hex: hex(parse(color[key][at])) },
          ]),
        ),
        shades: Object.fromEntries(
          Object.entries(shades).map(([key, value]) => [
            key,
            { oklch: rounded(value), hex: hex(value) },
          ]),
        ),
        ratios,
        accent: {
          label: contrast(parse(color.accentText[at]), parse(color.accent[at])),
          cloud: contrast(parse(color.accent[at]), cloud),
          milk: contrast(parse(color.accent[at]), milk),
        },
      };
    });
    return { ...color, themes, path: `/colors/${color.id}/${color.name}/` };
  });
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A value as the pages show it: OKLCH, which the stylesheets use, and the same color in hex. */
const both = ({ oklch, hex }) =>
  `<span class="color-value" data-oklch="${oklch}" data-hex="${hex}"><code>${oklch}</code> <span class="color-hex">${hex}</span></span>`;

const ratio = (value) => value.toFixed(1);

/** The garden page's header and footer, for every color page to share. */
function chrome() {
  const garden = read("public/garden/index.html");
  const top = garden.slice(garden.indexOf("  <body>"), garden.indexOf('    <main id="main">'));
  const bottom = garden.slice(garden.indexOf("    </main>") + "    </main>\n".length);
  // Every color page is under Colors, so that link is the current one.
  return {
    top: top
      .replace(' aria-current="page"', "")
      .replace('href="/colors/">Colors', 'href="/colors/" aria-current="page">Colors'),
    bottom,
  };
}

function head({ title, description, url, styles }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />

    <title>${escape(title)} - Oinam.DEV</title>
    <meta name="description" content="${escape(description)}" />
    <link rel="canonical" href="${url}" />
    <!-- What a link to this page shows when it is shared. -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Oinam.DEV" />
    <meta property="og:title" content="${escape(title)} - Oinam.DEV" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://oinam.dev/assets/www.oinam.dev.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Oinam.DEV: Written for agents. Kept by hand." />
    <meta name="twitter:card" content="summary_large_image" />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/ui/ui.css" />
    <link rel="stylesheet" href="/assets/site.css" />
    <link rel="preload" href="/assets/fonts/fraunces/fraunces.woff2" as="font" type="font/woff2" crossorigin />
${styles.map((href) => `    <link rel="stylesheet" href="${href}" />`).join("\n")}
    <script src="/ui/theme-init.js"></script>
    <script type="module" src="/ui/ui.js"></script>
    <script type="module" src="/assets/site.js"></script>
    <script type="module" src="/assets/colors.js"></script>
  </head>
`;
}

/** How each source's steps become ink, cloud, and milk. */
const MAPPING = {
  "Radix Colors":
    "its step 12 is the ink, and its steps 2 and 1 are the cloud and the milk; the same steps of its dark scale make the night side",
  "Tailwind CSS":
    "its 950 is the ink and its 50 the cloud by day, and the other way round by night; the milk is white by day, and a step lighter than the ground by night",
};

/** A few words on the list saying where a color comes from. */
const credit = (color) =>
  color.from ? ` From <a href="${color.from.url}">${escape(color.from.name)}</a>.` : "";

/** A section on a color's page saying where it comes from, and what was changed. */
function origin(color) {
  if (!color.from) return "";
  const { name, url, license, scale, deepened = [] } = color.from;
  const sides =
    deepened.length === 2 ? "on both sides" : `by ${deepened[0] === "light" ? "day" : "night"}`;
  const change = deepened.length
    ? ` The ink is deeper here than there ${sides}, with the same hue and chroma, so that the faint text reaches 4.5 to 1 when it is mixed the way these components mix it.`
    : " The values are as they are there.";
  return `          <section aria-labelledby="from">
            <onm-stack gap="4">
              <h2 id="from">Where it comes from</h2>
              <p>
                The ${escape(scale)} scale of <a href="${url}">${escape(name)}</a>, under the ${license}
                license: ${MAPPING[name]}.${change}
              </p>
            </onm-stack>
          </section>
`;
}

const chip = (key) => `<span class="color-chip" data-chip="${key}" aria-hidden="true"></span>`;

/** The list: every color, in light and in dark, each a row of chips. */
function listPage(all) {
  const { top, bottom } = chrome();
  const description =
    "Pairs of colors for Oinam UI, side by side in light and dark. Each is three tokens, and every other shade is mixed from them.";
  const entries = all
    .map((color) => {
      const strips = color.themes
        .map(({ theme, values, shades }) => {
          const chips = [
            ["cloud", "Cloud", values.cloud],
            ["milk", "Milk", values.milk],
            ["line", "Line", shades.line],
            ["line-strong", "Strong line", shades["line-strong"]],
            ["faint", "Faint", shades.faint],
            ["soft", "Soft", shades.soft],
            ["ink", "Ink", values.ink],
          ]
            .map(
              ([key, name, value]) =>
                `<li><span class="color-chip" data-chip="${key}" data-oklch="${value.oklch}" data-hex="${value.hex}" role="img" aria-label="${name}, ${value.oklch}"></span></li>`,
            )
            .join("\n");
          return `<div class="color-strip" data-colors="${color.id}" data-scheme="${theme}" role="group" aria-label="${escape(color.title)}, ${theme}">
  <ul class="color-strip-chips">
${chips}
  </ul>
</div>`;
        })
        .join("\n");
      return `<section class="color-entry" aria-labelledby="color-${color.id}">
  <div>
    <h2 id="color-${color.id}"><a href="${color.path}">${escape(color.title)}</a> <code>${color.id}</code></h2>
    <p class="color-entry-about">${escape(color.description)}${credit(color)}</p>
  </div>
  <div class="color-entry-strips">
${strips}
  </div>
</section>`;
    })
    .join("\n");

  return `${head({ title: "Colors", description, url: "https://oinam.dev/colors/", styles: ["/colors/colors.css"] })}${top}    <main id="main">
      <onm-wrap>
        <onm-stack class="page" gap="4" align="start">
          <h1>Colors</h1>
          <p class="onm-lede">
            Pairs of colors for the components. Each is three tokens, and every other shade is mixed
            from them, in light and in dark.
          </p>
          <p>
            A color has a number, which is its address, and a name, which is only for reading:
            <a href="/colors/2/navy/">/colors/2/navy/</a> and <a href="/colors/2/">/colors/2/</a> are
            the same page. So a color can be renamed, and every link to it still works. The same list
            is in <a href="/colors/colors.json">colors.json</a>, as data. Every text shade in every color
            reaches 4.5 to 1, in both themes; a test holds them there.
          </p>
          <p>
            Colors are written in OKLCH: lightness, chroma, and hue, in that order. Two colors with the
            same hue are the same color at another depth, and it shows in the numbers. Each color's own
            page has its values, and the same colors in hex for a tool that wants them. Here, each row
            is a color by day and by night, from the page to the text: cloud, milk, the two lines, and
            the three inks. The wash is left out here, since it is not a color of its own but a
            faint tint of ink over whatever is under it; each color's page has it.
          </p>
          <p>
            Press a chip to copy its color in OKLCH, or hold Shift as you press to copy its hex.
          </p>
        </onm-stack>
        <onm-stack class="color-list" gap="8">
${entries}
        </onm-stack>
      </onm-wrap>
    </main>
${bottom}`;
}

/** One color's page, which wears that color. */
function colorPage(color) {
  const { top, bottom } = chrome();
  const base = color.id === "1";
  const [light, dark] = color.themes;
  const url = `https://oinam.dev/colors/${color.id}/`;

  const three = THREE.map(
    ({ key, token, name, use }) => `<tr>
  <th scope="row">${chip(key)} ${name}</th>
  <td><code>${token}</code></td>
  <td>${both(light.values[key])}</td>
  <td>${both(dark.values[key])}</td>
  <td>${use}</td>
</tr>`,
  ).join("\n");

  const shades = SHADES.map(
    ({ token, name, chip: key, share, use }) => `<tr>
  <th scope="row">${chip(key)} ${name}</th>
  <td><code>${token}</code></td>
  <td>${Math.round(share * 100)}%</td>
  <td>${both(light.shades[key])}</td>
  <td>${both(dark.shades[key])}</td>
  <td>${use}</td>
</tr>`,
  ).join("\n");

  const ratios = ["Ink", "Soft", "Faint"]
    .map(
      (name) => `<tr>
  <th scope="row">${name}</th>
  <td>${ratio(light.ratios[name].cloud)}</td>
  <td>${ratio(light.ratios[name].milk)}</td>
  <td>${ratio(dark.ratios[name].cloud)}</td>
  <td>${ratio(dark.ratios[name].milk)}</td>
</tr>`,
    )
    .join("\n");

  const wears = base
    ? "This is the default, which every page wears unless it links another. Switch the theme to see the other side."
    : "This page wears it. Switch the theme to see the other side.";

  const use = base
    ? `<p>
  Base needs nothing: these are the values in <a href="/ui/tokens.css">tokens.css</a>, which every
  copy of the components already has. It writes them in hex; they are the same colors.
</p>`
    : `<p>
  Take a copy of <a href="/colors/${color.id}.css">${color.id}.css</a>, keep it with the site's own
  styles, outside the components' folder, and link it after them:
</p>
<pre><code>&lt;link rel="stylesheet" href="/ui/ui.css" /&gt;
&lt;link rel="stylesheet" href="/styles/${color.name}.css" /&gt;</code></pre>`;

  return `${head({
    title: `${color.title}, color ${color.id}`,
    description: color.description,
    url,
    styles: base ? [] : [`/colors/${color.id}.css`],
  })}${top}    <main id="main">
      <onm-wrap>
        <onm-stack class="page" gap="4" align="start">
          <p class="onm-eyebrow"><a href="/colors/">Colors</a>, number ${color.id}</p>
          <h1>${escape(color.title)}</h1>
          <p class="onm-lede">${escape(color.description)}</p>
          <p>${wears}</p>
        </onm-stack>
        <onm-stack class="color-page" gap="12">
          <section aria-labelledby="three">
            <onm-stack gap="4">
              <h2 id="three">The three colors</h2>
              <p>
                Ink is the text, and cloud is the page. Milk is a step off cloud, for a surface above
                it. Each is written in OKLCH, with the same color in hex under it. Press a value to copy
                it in OKLCH, or hold Shift as you press to copy the hex.
              </p>
              <onm-table>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Color</th>
                      <th scope="col">Token</th>
                      <th scope="col">Light</th>
                      <th scope="col">Dark</th>
                      <th scope="col">What it is for</th>
                    </tr>
                  </thead>
                  <tbody>
${three}
                  </tbody>
                </table>
              </onm-table>
            </onm-stack>
          </section>
          <section aria-labelledby="shades">
            <onm-stack gap="4">
              <h2 id="shades">The shades between them</h2>
              <p>
                Every other shade is ink mixed into cloud, so each one leans the way the pair leans,
                and each follows the theme. The components work them out; the values below are what a
                screen shows.
              </p>
              <onm-table>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Shade</th>
                      <th scope="col">Token</th>
                      <th scope="col">Ink in it</th>
                      <th scope="col">Light</th>
                      <th scope="col">Dark</th>
                      <th scope="col">What it is for</th>
                    </tr>
                  </thead>
                  <tbody>
${shades}
                  </tbody>
                </table>
              </onm-table>
            </onm-stack>
          </section>
          <section aria-labelledby="contrast">
            <onm-stack gap="4">
              <h2 id="contrast">Contrast</h2>
              <p>
                Every text shade reaches WCAG AA, 4.5 to 1, against the page and against a raised
                surface, in both themes. A test holds it there.
              </p>
              <onm-table>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Text</th>
                      <th scope="col">Light, on cloud</th>
                      <th scope="col">Light, on milk</th>
                      <th scope="col">Dark, on cloud</th>
                      <th scope="col">Dark, on milk</th>
                    </tr>
                  </thead>
                  <tbody>
${ratios}
                  </tbody>
                </table>
              </onm-table>
            </onm-stack>
          </section>
          <section aria-labelledby="accent">
            <onm-stack gap="4">
              <h2 id="accent">The accent</h2>
              <p>
                The one main action of a group may be an accent button, the solid button in color.
                ${color.given ? "This color sets its own." : color.accent === color.ink ? "This color's inks are grey, with no color to lend, so its accent is its ink, as the solid button is." : "This color takes it from its ink: the same hue, with enough color to be seen, and as light by day, or as deep by night, as it can be while its label reads at 7 to 1."}
                Its fill stands at 3 to 1 or better against the page and a raised surface.
              </p>
              <onm-row>
                <button class="onm-button" data-variant="accent" type="button">Send to the skipper</button>
                <button class="onm-button" data-variant="outline" type="button">Save</button>
              </onm-row>
              <onm-table>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Token</th>
                      <th scope="col">Light</th>
                      <th scope="col">Dark</th>
                      <th scope="col">What it is for</th>
                    </tr>
                  </thead>
                  <tbody>
<tr>
  <th scope="row"><code>--color-accent</code></th>
  <td>${both(light.values.accent)}</td>
  <td>${both(dark.values.accent)}</td>
  <td>The fill: ${ratio(Math.min(light.accent.cloud, light.accent.milk))} to 1 against the page by day, ${ratio(Math.min(dark.accent.cloud, dark.accent.milk))} by night.</td>
</tr>
<tr>
  <th scope="row"><code>--color-accent-text</code></th>
  <td>${both(light.values.accentText)}</td>
  <td>${both(dark.values.accentText)}</td>
  <td>The label: ${ratio(light.accent.label)} to 1 on the fill by day, ${ratio(dark.accent.label)} by night.</td>
</tr>
                  </tbody>
                </table>
              </onm-table>
            </onm-stack>
          </section>
${origin(color)}          <section aria-labelledby="use">
            <onm-stack gap="4">
              <h2 id="use">Use it</h2>
${use}
            </onm-stack>
          </section>
        </onm-stack>
      </onm-wrap>
    </main>
${bottom}`;
}

const ACCENT = [
  { key: "accent", token: "--color-accent" },
  { key: "accentText", token: "--color-accent-text" },
];

const tokens = (color, indent) =>
  [...THREE, ...ACCENT]
    .map(({ key, token }) => `${indent}${token}: light-dark(${color[key][0]}, ${color[key][1]});`)
    .join("\n");

/** The stylesheet to take away: three tokens and the accent, nothing else. */
function takeAway(color) {
  return `/*
 * ${color.title}, color ${color.id} of Oinam UI
 * https://oinam.dev/colors/${color.id}/${color.name}/
 *
 * ${color.description}${color.from ? `\n * Adapted from ${color.from.name} (${color.from.license}): ${color.from.url}` : ""}
 *
 * Link it after the components. Every other shade is mixed from the first
 * three; the accent is the fill of the one main action, and its label.
 */

:root {
${tokens(color, "  ")}
}
`;
}

/** Every color scoped to its strip on the list, with the mixes declared again beside it. */
function scoped(all) {
  // A shade declared on :root is worked out there, from the page's own ink and cloud, and a
  // strip that sets other ones would still inherit the page's shades. So each strip mixes its own.
  const mixes = read("public/ui/tokens.css")
    .split("\n")
    .filter((line) => /^\s+--color-(ink-soft|ink-faint|line|line-strong|wash):/.test(line))
    .join("\n");
  const blocks = all
    .map((color) => `.color-strip[data-colors="${color.id}"] {\n${tokens(color, "  ")}\n}`)
    .join("\n\n");
  return `/*
 * Every color, each scoped to its strip on /colors/, so they can be shown side
 * by side. Written by scripts/colors.js from colors.json; do not edit it.
 */

.color-strip {
${mixes}
}

.color-strip[data-scheme="light"] {
  color-scheme: light;
}

.color-strip[data-scheme="dark"] {
  color-scheme: dark;
}

${blocks}
`;
}

/** Every file this writes, by path, formatted as the repository formats it. */
export async function render() {
  const all = colors();
  const files = {
    "public/colors/index.html": listPage(all),
    "public/colors/colors.css": scoped(all),
  };
  for (const color of all) {
    files[`public/colors/${color.id}/index.html`] = colorPage(color);
    if (color.id !== "1") files[`public/colors/${color.id}.css`] = takeAway(color);
  }
  for (const [path, source] of Object.entries(files)) {
    const filepath = fileURLToPath(new URL(path, ROOT));
    const options = await prettier.resolveConfig(filepath);
    files[path] = await prettier.format(source, { ...options, filepath });
  }
  return files;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [path, source] of Object.entries(await render())) {
    const url = new URL(path, ROOT);
    mkdirSync(new URL(".", url), { recursive: true });
    writeFileSync(url, source);
    console.log(path);
  }
}
