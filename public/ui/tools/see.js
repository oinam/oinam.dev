#!/usr/bin/env node
/*
 * Oinam UI: see a page.
 *
 *   node ui/tools/see.js http://localhost:8788/pricing/
 *   node ui/tools/see.js --root site pricing/index.html
 *   node ui/tools/see.js --out shots --widths 320,1440 --themes light <page>
 *
 * It opens the page in a browser that is already on the machine, at each of
 * several widths, in light and in dark, and saves a picture of the whole page
 * each time. By default: 320, 768, and 1440 wide, both themes, into ./seen/.
 *
 * It also reports what a picture can hide: a page that runs off the side at
 * some width, and any error the page threw. It exits with 1 if it found one.
 *
 * If you are an agent: the guide says to look at the page before you hand it
 * back. This is how. Run it, then open the pictures and read them the way the
 * owner will.
 *
 * Give it an address, or a file with --root, which serves that folder for as
 * long as the pictures take, so that paths like /ui/ui.css resolve.
 *
 * It needs Node 22 or later, and Chrome, Chromium, Edge, or Brave. It installs
 * nothing: it finds the browser, or takes the path from CHROME_PATH.
 */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTHS = [320, 768, 1440];
const THEMES = ["light", "dark"];

/** Where a browser this can drive is likely to be. */
const BROWSERS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
  "microsoft-edge",
  "brave-browser",
];

/** @returns {string | null} The path of a browser, or null if there is none. */
export function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const candidate of BROWSERS) {
    if (candidate.startsWith("/")) {
      if (existsSync(candidate)) return candidate;
    } else {
      const found = spawnSync("which", [candidate], { encoding: "utf8" });
      if (found.status === 0) return found.stdout.trim();
    }
  }
  return null;
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".md": "text/markdown; charset=utf-8",
};

/**
 * Serve a folder on this machine only, on a port the system picks.
 *
 * @param {string} root
 * @returns {Promise<{ url: string, close: () => void }>}
 */
export function serve(root) {
  const base = resolve(root);
  const server = createServer((request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, "http://x").pathname));
    let file = join(base, path);
    // Nothing outside the folder, whatever the address says.
    if (!file.startsWith(base)) return response.writeHead(403).end();
    if (path.endsWith("/")) file = join(file, "index.html");
    try {
      const body = readFileSync(file);
      response
        .writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" })
        .end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  return new Promise((done) => {
    server.listen(0, "127.0.0.1", () =>
      done({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }),
    );
  });
}

/**
 * Start the browser with nothing showing, and talk to it over its debugging
 * protocol. Returns a way to send it commands and to hear what it reports.
 */
async function drive(browser) {
  const profile = mkdtempSync(join(tmpdir(), "oinam-see-"));
  const flags = [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--disable-gpu",
    // A container, such as a CI runner, cannot give the browser its own sandbox.
    ...(process.env.CI ? ["--no-sandbox"] : []),
    "about:blank",
  ];
  const child = spawn(browser, flags, { stdio: ["ignore", "ignore", "pipe"] });

  const address = await new Promise((found, failed) => {
    let said = "";
    const timer = setTimeout(
      () => failed(new Error("The browser did not start within 20 seconds.")),
      20_000,
    );
    child.stderr.on("data", (chunk) => {
      said += chunk;
      const [, url] = said.match(/DevTools listening on (ws:\/\/\S+)/) ?? [];
      if (url) {
        clearTimeout(timer);
        found(url);
      }
    });
    child.once("exit", () =>
      failed(new Error(`The browser stopped before it was ready.\n${said}`)),
    );
  });

  const socket = new WebSocket(address);
  await new Promise((opened, failed) => {
    socket.addEventListener("open", opened, { once: true });
    socket.addEventListener("error", () => failed(new Error("Could not reach the browser.")), {
      once: true,
    });
  });

  let sent = 0;
  const waiting = new Map();
  const listeners = new Set();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && waiting.has(message.id)) {
      const { done, failed } = waiting.get(message.id);
      waiting.delete(message.id);
      if (message.error) failed(new Error(message.error.message));
      else done(message.result);
    } else {
      for (const listener of listeners) listener(message);
    }
  });

  /** Send one command, to the browser or to a page in it, and wait for the answer. */
  const send = (method, params = {}, sessionId) =>
    new Promise((done, failed) => {
      const id = ++sent;
      waiting.set(id, { done, failed });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });

  /** Wait for the browser to report an event. */
  const next = (method, timeout = 30_000) =>
    new Promise((heard, failed) => {
      const timer = setTimeout(() => {
        listeners.delete(listener);
        failed(new Error(`The page did not finish loading within ${timeout / 1000} seconds.`));
      }, timeout);
      const listener = (message) => {
        if (message.method !== method) return;
        clearTimeout(timer);
        listeners.delete(listener);
        heard(message.params);
      };
      listeners.add(listener);
    });

  const close = async () => {
    socket.close();
    const gone = new Promise((exited) => child.once("exit", exited));
    child.kill();
    await gone;
    try {
      rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    } catch {
      // The browser can still be letting go of its files. They are in the temporary folder.
    }
  };

  return { send, next, listen: (listener) => listeners.add(listener), close };
}

/**
 * @typedef {object} Seen
 * @property {number} width
 * @property {string} theme
 * @property {string} file Where the picture was saved.
 * @property {number} height How tall the page is at this width.
 * @property {number} overflow How far the page runs off the side, in pixels. Zero is right.
 * @property {string[]} errors What the page threw, or failed to load.
 */

/**
 * Take a picture of a page at each width, in each theme.
 *
 * @param {string} url
 * @param {{ out?: string, widths?: number[], themes?: string[], browser?: string }} [options]
 * @returns {Promise<Seen[]>}
 */
export async function see(
  url,
  { out = "seen", widths = WIDTHS, themes = THEMES, browser = findBrowser() } = {},
) {
  if (!browser) {
    throw new Error("No browser found. Install Chrome or Chromium, or set CHROME_PATH to one.");
  }
  mkdirSync(out, { recursive: true });

  // A name for the pictures, from the address: /pricing/ becomes "pricing".
  const { pathname } = new URL(url);
  const name =
    pathname
      .replace(/\/index\.html$|\.html$/, "")
      .replace(/^\/|\/$/g, "")
      .replaceAll("/", "-") || "home";

  const { send, next, listen, close } = await drive(browser);
  /** @type {Seen[]} */
  const seen = [];

  try {
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const page = (method, params) => send(method, params, sessionId);

    let errors = [];
    listen(({ method, params, sessionId: from }) => {
      if (from !== sessionId) return;
      if (method === "Runtime.exceptionThrown") {
        errors.push(params.exceptionDetails.exception?.description ?? params.exceptionDetails.text);
      } else if (method === "Log.entryAdded" && params.entry.level === "error") {
        // A browser asks for /favicon.ico unbidden. A page without one is not broken.
        if (params.entry.url?.endsWith("/favicon.ico")) return;
        errors.push(`${params.entry.text}${params.entry.url ? ` (${params.entry.url})` : ""}`);
      }
    });
    await page("Page.enable");
    await page("Runtime.enable");
    await page("Log.enable");

    for (const theme of themes) {
      await page("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-color-scheme", value: theme }],
      });
      for (const width of widths) {
        errors = [];
        await page("Emulation.setDeviceMetricsOverride", {
          width,
          height: 900,
          deviceScaleFactor: 1,
          mobile: false,
        });

        const loaded = next("Page.loadEventFired");
        await page("Page.navigate", { url });
        await loaded;
        // Fonts, and anything a script does on arrival, get a moment to settle.
        await page("Runtime.evaluate", {
          expression:
            "document.fonts.ready.then(() => new Promise((done) => setTimeout(done, 250)))",
          awaitPromise: true,
        });

        const { result } = await page("Runtime.evaluate", {
          expression:
            "JSON.stringify([document.documentElement.scrollWidth, document.documentElement.scrollHeight])",
          returnByValue: true,
        });
        const [scrollWidth, height] = JSON.parse(result.value);

        const { data } = await page("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width, height, scale: 1 },
        });
        const file = join(out, `${name}-${width}-${theme}.png`);
        writeFileSync(file, Buffer.from(data, "base64"));

        seen.push({
          width,
          theme,
          file,
          height,
          overflow: Math.max(scrollWidth - width, 0),
          errors,
        });
      }
    }
  } finally {
    await close();
  }
  return seen;
}

/* The command line. */

async function main(args) {
  const option = (name, fallback) => {
    const at = args.indexOf(`--${name}`);
    return at === -1 ? fallback : args.splice(at, 2)[1];
  };
  const out = option("out", "seen");
  const widths = option("widths", WIDTHS.join(",")).split(",").map(Number);
  const themes = option("themes", THEMES.join(",")).split(",");
  const root = option("root");
  const [target] = args;

  if (!target || widths.some(Number.isNaN)) {
    console.error(
      "Usage: node see.js [--out folder] [--widths 320,768,1440] [--themes light,dark] <address>\n       node see.js --root <folder> <file in it>",
    );
    return 2;
  }

  const server = root ? await serve(root) : null;
  const url = server ? `${server.url}/${target.replace(/^\//, "")}` : target;

  try {
    const seen = await see(url, { out, widths, themes });
    let wrong = 0;
    for (const { file, width, theme, height, overflow, errors } of seen) {
      console.log(`${file}  ${width} wide, ${height} tall, ${theme}`);
      if (overflow > 0) {
        wrong++;
        console.log(
          `  Runs ${overflow}px off the side at ${width} wide. Something is wider than the screen.`,
        );
      }
      for (const error of new Set(errors)) {
        wrong++;
        console.log(`  Error on the page: ${error}`);
      }
    }
    console.log(
      wrong === 0
        ? `\n${seen.length} pictures in ${out}/. Open them and look.`
        : `\n${wrong} to mend. The pictures are in ${out}/.`,
    );
    return wrong === 0 ? 0 : 1;
  } catch (error) {
    console.error(error.message);
    return 2;
  } finally {
    server?.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = await main(process.argv.slice(2));
}
