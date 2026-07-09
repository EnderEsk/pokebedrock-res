import fs from "fs-extra";
import { Logger } from "./utils";

// Synchronizes every supported language file against `texts/en_US.lang`,
// which is the single source of truth for keys, ordering, and comments.
//
// For each target language this script rebuilds the file in en_US order:
// - keys present in the target keep their translated value
// - keys missing from the target are filled with the English value
//   (Bedrock would fall back to en_US anyway; this keeps files diffable)
// - keys no longer in en_US are dropped (stale)
// - comments and blank lines are copied from en_US
//
// Usage:
//   npm run syncLangFiles          -- rewrite all language files
//   npm run syncLangFiles -- --check  -- CI mode: exit 1 if any file is out of sync

/** Languages shipped by the pack, excluding the en_US source of truth. */
const TARGET_LANGS = [
  "cs_CZ",
  "de_DE",
  "es_ES",
  "pt_BR",
  "ru_RU",
  "zh_CN",
] as const;

/**
 * Parses a `.lang` file into a key → value map (comments stripped).
 *
 * @param file Path to the `.lang` file.
 * @returns map of translation key to value.
 */
function parseLang(file: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    map.set(trimmed.slice(0, eq).trim(), trimmed.slice(eq + 1));
  }
  return map;
}

/**
 * Rebuilds a target language file in en_US order.
 *
 * @param enLines The raw lines of en_US.lang.
 * @param target The target language's existing key → value map.
 * @returns the rebuilt file content and sync stats.
 */
function rebuild(
  enLines: string[],
  target: Map<string, string>,
): { content: string; filled: number; dropped: number } {
  const out: string[] = [];
  const enKeys = new Set<string>();
  let filled = 0;

  for (const line of enLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      out.push(line);
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      out.push(line);
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    enKeys.add(key);
    const existing = target.get(key);
    if (existing === undefined) filled++;
    out.push(`${key}=${existing ?? trimmed.slice(eq + 1)}`);
  }

  const dropped = [...target.keys()].filter((k) => !enKeys.has(k)).length;
  return { content: out.join("\n"), filled, dropped };
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const enLines = fs.readFileSync("texts/en_US.lang", "utf8").split(/\r?\n/);

  let outOfSync = 0;
  for (const lang of TARGET_LANGS) {
    const file = `texts/${lang}.lang`;
    const target = parseLang(file);
    const { content, filled, dropped } = rebuild(enLines, target);
    const current = fs.readFileSync(file, "utf8");

    if (current === content) {
      Logger.info(`${lang}: in sync (${target.size} keys)`);
      continue;
    }

    outOfSync++;
    if (checkOnly) {
      Logger.warn(
        `${lang}: OUT OF SYNC (${filled} missing keys, ${dropped} stale keys). Run 'npm run syncLangFiles' to fix.`,
      );
      continue;
    }
    fs.writeFileSync(file, content);
    Logger.info(
      `${lang}: rewrote (${filled} missing keys filled with English, ${dropped} stale keys dropped)`,
    );
  }

  if (checkOnly && outOfSync > 0) {
    Logger.critical(
      `${outOfSync} language file(s) out of sync with en_US.lang`,
    );
    process.exit(1);
  }
}

main();
