/*
 * Color, enough of it to measure what a reader will see: the mixing the
 * browser does in Oklab, and contrast as WCAG counts it. The tests use it, and
 * so does scripts/colors.js, to print the shades on the color pages.
 *
 * A color here is three numbers, linear red, green, and blue, from 0 to 1.
 */

const linear = (channel) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const gamma = (channel) =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

/** @param {string} hex "#rrggbb" or "#rgb" @returns {number[]} */
export function rgb(hex) {
  const long = hex.length === 4 ? hex.replace(/[0-9a-f]/g, "$&$&") : hex;
  return [1, 3, 5].map((at) => linear(parseInt(long.slice(at, at + 2), 16) / 255));
}

/** @param {number[]} color @returns {number[]} What a screen shows: three whole numbers to 255. */
export const bytes = (color) =>
  color.map((channel) => Math.round(Math.min(Math.max(gamma(channel), 0), 1) * 255));

/** @param {number[]} color @returns {string} "#rrggbb" */
export const hex = (color) =>
  `#${bytes(color)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;

function toOklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** `share` of one color mixed into another, as color-mix(in oklab) does it. */
export function mix(one, other, share) {
  const [a, b] = [toOklab(one), toOklab(other)];
  return fromOklab(a.map((value, at) => value * share + b[at] * (1 - share)));
}

/** The contrast between two colors, as WCAG counts it, after rounding to what a screen shows. */
export function contrast(one, other) {
  const luminance = (color) => {
    const [r, g, b] = bytes(color).map((byte) => linear(byte / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(one), luminance(other)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}
