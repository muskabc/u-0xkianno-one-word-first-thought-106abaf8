// One Word, First Thought: the first word that comes to mind, no second
// draft. It sits in word.txt; this script validates one word of 1-24
// characters and writes it, and only it, to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX = 24;
const here = import.meta.dirname;
const word = readFileSync(join(here, "word.txt"), "utf8").trim();

function check(w: string): void {
  if (w.length === 0 || w.length > MAX) {
    throw new Error(`word must be 1-${MAX} characters, got ${w.length}`);
  }
  if (w.includes(" ") || w.includes("\t")) {
    throw new Error("the entry must be exactly one word");
  }
}

check(word);
const dest = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(dest, { recursive: true });
writeFileSync(join(dest, "entry.txt"), word, "utf8");
console.log(`wrote ${word.length}-character word to ${join(dest, "entry.txt")}`);
