/*
 * Turns the choices made on the Play page into a variation: the font files to
 * link and the tokens to change. Kept free of the DOM so it can be tested on
 * its own.
 */

/**
 * What can be chosen, and what each choice changes. The first option of each
 * is Base, and changes nothing.
 *
 * `font` is a stylesheet in /ui/fonts/ to link. `tokens` are values to set.
 */
export const OPTIONS = {
  text: {
    label: "Text",
    choices: {
      system: { label: "System sans" },
      geist: { label: "Geist", font: "geist.css" },
      inter: { label: "Inter", font: "inter.css" },
    },
  },
  headings: {
    label: "Headings",
    choices: {
      system: { label: "System serif" },
      "source-serif": { label: "Source Serif 4", font: "source-serif.css" },
      text: { label: "Same as the text", tokens: { "--font-heading": "var(--font-sans)" } },
    },
  },
  code: {
    label: "Code",
    choices: {
      system: { label: "System mono" },
      "geist-mono": { label: "Geist Mono", font: "geist-mono.css" },
    },
  },
  corners: {
    label: "Corners",
    choices: {
      base: { label: "Base" },
      sharp: {
        label: "Sharp",
        tokens: { "--radius-sm": "0", "--radius-md": "0", "--radius-lg": "0" },
      },
      round: {
        label: "Round",
        tokens: { "--radius-sm": "10px", "--radius-md": "16px", "--radius-lg": "24px" },
      },
    },
  },
  colors: {
    label: "Ink and cloud",
    choices: {
      base: { label: "Base" },
      paper: {
        label: "Paper",
        tokens: {
          "--color-ink": "light-dark(#1b1a17, #f2efe8)",
          "--color-cloud": "light-dark(#f7f4ee, #12110f)",
          "--color-milk": "light-dark(#fdfcf9, #1c1a17)",
        },
      },
      carbon: {
        label: "Carbon",
        tokens: {
          "--color-ink": "light-dark(#111111, #ededed)",
          "--color-cloud": "light-dark(#fafafa, #0a0a0a)",
          "--color-milk": "light-dark(#ffffff, #151515)",
        },
      },
    },
  },
};

/**
 * @typedef {object} Variation
 * @property {string[]} fonts Stylesheets in /ui/fonts/ to link, in order.
 * @property {Record<string, string>} tokens Tokens that differ from Base.
 * @property {string} head The lines for the page's <head>.
 * @property {string} css The variation's own stylesheet; empty when no token differs.
 */

/**
 * Work out the variation a set of choices makes.
 *
 * A choice that is missing, or that names nothing on offer, counts as Base.
 *
 * @param {Record<string, string>} choices One choice per option, by key.
 * @returns {Variation}
 */
export function variation(choices) {
  const fonts = [];
  const tokens = {};

  for (const [key, option] of Object.entries(OPTIONS)) {
    const choice = option.choices[choices[key]];
    if (!choice) continue;
    if (choice.font) fonts.push(choice.font);
    Object.assign(tokens, choice.tokens);
  }

  const lines = Object.entries(tokens).map(([name, value]) => `  ${name}: ${value};`);
  const css = lines.length > 0 ? `:root {\n${lines.join("\n")}\n}` : "";

  const head = [
    '<link rel="stylesheet" href="/ui/ui.css" />',
    ...fonts.map((font) => `<link rel="stylesheet" href="/ui/fonts/${font}" />`),
    ...(css ? ['<link rel="stylesheet" href="/variation.css" />'] : []),
  ].join("\n");

  return { fonts, tokens, head, css };
}
