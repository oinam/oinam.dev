/*
 * Search ranking, kept free of the DOM so it can be tested on its own.
 */

/**
 * One searchable page.
 *
 * @typedef {object} Entry
 * @property {string} title
 * @property {string} url
 * @property {string} text One line saying what the page holds.
 */

/* A term found in a title outweighs any number found in the text. */
const TITLE_START = 100;
const TITLE = 10;
const TEXT = 1;

/**
 * Rank entries against a query, best first.
 *
 * Every word of the query must appear in an entry's title or text, in any
 * order and any case. Entries that tie keep the order they came in, and an
 * empty query returns them all, so the list can double as a menu.
 *
 * @param {Entry[]} entries
 * @param {string} query
 * @returns {Entry[]}
 */
export function rank(entries, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...entries];

  return entries
    .map((entry, index) => ({ entry, index, score: score(entry, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ entry }) => entry);
}

/**
 * @param {Entry} entry
 * @param {string[]} terms Lowercase words.
 * @returns {number} Zero when any term is missing.
 */
function score(entry, terms) {
  const title = entry.title.toLowerCase();
  const text = entry.text.toLowerCase();

  let total = 0;
  for (const term of terms) {
    if (title.startsWith(term)) total += TITLE_START;
    else if (title.includes(term)) total += TITLE;
    else if (text.includes(term)) total += TEXT;
    else return 0;
  }
  return total;
}
