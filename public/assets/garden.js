/*
 * oinam.dev/garden/
 *
 * One page, many designs. The address says which: /garden/?design=paper. This
 * script links that design's stylesheet and the fonts it asks for, and marks
 * it in the list. Without the script, the page is Base.
 *
 * Only a design the page itself lists can be chosen, so the address cannot be
 * used to load a stylesheet from anywhere else.
 */

const chosen = new URLSearchParams(location.search).get("design") ?? "base";
const entry =
  document.querySelector(`[data-design="${CSS.escape(chosen)}"]`) ??
  document.querySelector('[data-design="base"]');

/** @param {string} href */
function link(href) {
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = href;
  document.head.append(sheet);
}

// Fonts first, then the design, the order a project would link them in.
for (const font of entry.dataset.fonts.split(" ").filter(Boolean)) link(`/ui/fonts/${font}`);
if (entry.dataset.file) link(`/garden/${entry.dataset.file}`);

entry.setAttribute("aria-current", "true");
document.querySelector("[data-garden-showing]").textContent = entry.textContent.trim();
