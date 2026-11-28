/*
 * Bring Phosphor's icons into the system, from a copy of its package:
 *
 *   npm pack @phosphor-icons/core@2.1.1
 *   tar -xzf phosphor-icons-core-2.1.1.tgz
 *   mise run icons -- ./package
 *   mise run format
 *
 * It copies the weights the system uses, exactly as Phosphor draws them, into
 * public/ui/icons/phosphor/<weight>/, puts Phosphor's license beside them, and
 * writes public/ui/icons/icons.json: every icon's name, categories, and tags,
 * so an agent can look one up by what it means rather than by its file name.
 *
 * Nothing in the copied files is changed, so a new release of Phosphor is this
 * script run again. Oinam's own icons live in public/ui/icons/oinam/ and are
 * never touched here.
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The weights kept: regular for screens, bold and fill for assets, duotone for large art. */
export const WEIGHTS = ["regular", "bold", "fill", "duotone"];

/**
 * Copy the kept weights of the Phosphor package at `from` into `icons`.
 * Returns the version and the number of icons.
 */
export async function bring(from, icons) {
  const pkg = JSON.parse(readFileSync(join(from, "package.json"), "utf8"));
  if (pkg.name !== "@phosphor-icons/core") {
    throw new Error(`${from} is ${pkg.name ?? "not a package"}, not @phosphor-icons/core.`);
  }

  const { icons: list } = await import(pathToFileURL(join(from, "dist", "index.mjs")).href);
  const target = join(icons, "phosphor");
  rmSync(target, { recursive: true, force: true });

  for (const weight of WEIGHTS) {
    const source = join(from, "assets", weight);
    const files = readdirSync(source).filter((name) => name.endsWith(".svg"));
    if (files.length !== list.length) {
      throw new Error(`${weight} has ${files.length} files, but the list names ${list.length}.`);
    }
    mkdirSync(join(target, weight), { recursive: true });
    for (const file of files) cpSync(join(source, file), join(target, weight, file));
  }
  cpSync(join(from, "LICENSE"), join(target, "LICENSE.txt"));

  const manifest = {
    set: "Phosphor",
    version: pkg.version,
    license: pkg.license,
    source: "https://github.com/phosphor-icons/core",
    weights: WEIGHTS,
    file: "phosphor/<weight>/<name>.svg, with -<weight> before .svg for every weight but regular",
    icons: list
      .map(({ name, categories, tags }) => ({
        name,
        categories,
        tags: tags.filter((tag) => !tag.startsWith("*")),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
  writeFileSync(join(icons, "icons.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  return { version: pkg.version, count: list.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const from = process.argv[2] ? resolve(process.argv[2]) : undefined;
  if (!from || !existsSync(join(from, "package.json"))) {
    console.error(
      "Give the folder of an unpacked @phosphor-icons/core package, as the header says.",
    );
    process.exit(1);
  }
  const icons = fileURLToPath(new URL("../public/ui/icons/", import.meta.url));
  const { version, count } = await bring(from, icons);
  console.log(
    `Phosphor ${version}: ${count} icons in ${WEIGHTS.length} weights, in public/ui/icons/`,
  );
}
