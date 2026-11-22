/*
 * Freeze the current version of the components at an address of its own:
 *
 *   mise run release
 *
 * It copies the files a page links (the stylesheets, the scripts, and the fonts
 * with their licenses) into public/ui/releases/<version>/, where they are served
 * for a year as unchangeable. A site that links there instead of to /ui/ keeps
 * the look it was built with when a later version renames a class or a token.
 *
 * The guide, the tools, and the patterns are left out. They are read, not
 * linked, and git keeps every version of them.
 *
 * A folder once released is never written again, because pages out in the
 * world depend on it staying as it is. Run this after the version is named
 * everywhere the tests ask, and commit the folder with the release.
 */

import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The files of a version that a page may link, from that version's registry. */
export function linked(registry) {
  return [
    ...new Set([
      registry.all.css,
      registry.all.js,
      registry.all.head,
      ...registry.foundation,
      ...registry.components.flatMap((component) => component.files),
      ...registry.fonts.flatMap((font) => font.files),
    ]),
  ].sort();
}

/**
 * Copy the linked files of the system in `ui` into `ui/releases/<version>/`.
 * Returns the folder and the files. Throws if that version was released already.
 */
export function release(ui) {
  const registry = JSON.parse(readFileSync(join(ui, "registry.json"), "utf8"));
  const folder = join(ui, "releases", registry.version);

  if (existsSync(folder)) {
    throw new Error(
      `${registry.version} is released already, and a release is never changed. ` +
        "Name a new version, then run this again.",
    );
  }

  const files = linked(registry);
  for (const file of files) {
    mkdirSync(dirname(join(folder, file)), { recursive: true });
    cpSync(join(ui, file), join(folder, file));
  }
  return { version: registry.version, folder, files };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ui = fileURLToPath(new URL("../public/ui/", import.meta.url));
  try {
    const { version, files } = release(ui);
    console.log(`Released ${version}: ${files.length} files in public/ui/releases/${version}/`);
    console.log(`Linked as https://oinam.dev/ui/releases/${version}/ui.css`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
