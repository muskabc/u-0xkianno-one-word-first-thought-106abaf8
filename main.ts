// One Word, First Thought: the first word that comes to mind, no second
// draft. It sits in word.txt; this script validates one word of 1-24
// characters and writes it, and only it, to /output/entry.txt.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX = 24;
const SOURCE = join(import.meta.dirname, "word.txt");
const OUTPUT_NAME = "entry.txt";

const graphemes = new Intl.Segmenter("en", { granularity: "grapheme" });

function loadWord(): string {
  if (!existsSync(SOURCE)) {
    throw new Error("word.txt is missing next to main.ts");
  }
  const raw = readFileSync(SOURCE, "utf8");
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const kept = lines.filter((part) => part.trim().length > 0);
  if (kept.length === 0) {
    throw new Error("the word must not be empty");
  }
  if (kept.length > 1) {
    throw new Error("the entry must be exactly one word");
  }
  return kept[0].trim().normalize("NFC");
}

function validateWord(word: string): void {
  const count = [...graphemes.segment(word)].length;
  if (count === 0 || count > MAX) {
    throw new Error(`word must be 1-${MAX} characters, got ${count}`);
  }
  const runs = word.match(/\S+/gu) ?? [];
  if (runs.length !== 1 || runs[0] !== word) {
    throw new Error("the entry must be exactly one word");
  }
  for (const ch of word) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("the word must not contain control characters");
    }
  }
}

function deliver(word: string): string {
  const dest = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(dest, { recursive: true });
  const path = join(dest, OUTPUT_NAME);
  writeFileSync(path, word, "utf8");
  return path;
}

function main(): void {
  const word = loadWord();
  validateWord(word);
  const path = deliver(word);
  const count = [...graphemes.segment(word)].length;
  console.log(`wrote ${count}-character word to ${path}`);
}

main();
