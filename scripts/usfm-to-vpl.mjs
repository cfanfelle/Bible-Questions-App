import fs from 'node:fs';
import path from 'node:path';

const [sourceDir, outputFile] = process.argv.slice(2);
if (!sourceDir || !outputFile) {
  throw new Error('Usage: node scripts/usfm-to-vpl.mjs <USFM directory> <output file>');
}

const clean = value => value
  .replace(/\\f\s[\s\S]*?\\f\*/g, '')
  .replace(/\\x\s[\s\S]*?\\x\*/g, '')
  .replace(/\\w\s+([^|\\]+?)(?:\|[^\\]*)?\\w\*/g, '$1')
  .replace(/\\(?:add|bd|bdit|bk|dc|em|it|k|nd|no|ord|pn|qt|sc|sig|sls|tl|wj)\s+([\s\S]*?)\\\1\*/g, '$2')
  .replace(/\\zaln-[se]\s+[^\\]*/g, '')
  .replace(/\\\+?\w+(?:-\w+)?\*?/g, '')
  .replace(/\|(?:strong|lemma)="[^"]*"/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const records = [];
for (const file of fs.readdirSync(sourceDir).filter(name => name.endsWith('.usfm')).sort()) {
  const source = fs.readFileSync(path.join(sourceDir, file), 'utf8');
  const book = /^\\id\s+(\S+)/m.exec(source)?.[1];
  const canonical = new Set(['GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH','EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV']);
  if (!book || !canonical.has(book)) continue;
  let chapter = 0;
  let current = null;
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const chapterMatch = /^\\c\s+(\d+)/.exec(line);
    if (chapterMatch) {
      chapter = Number(chapterMatch[1]);
      current = null;
      continue;
    }
    const verseMatch = /^\\v\s+(\d+)(?:-\d+)?\s*(.*)$/.exec(line);
    if (verseMatch) {
      current = { book, chapter, verse: Number(verseMatch[1]), text: clean(verseMatch[2]) };
      records.push(current);
      continue;
    }
    const continuation = /^\\(?:p|m|mi|nb|pc|pmo|pm|pmc|pmr|pi\d*|q\d*|qr|qc|qm\d*|li\d*)\s+(.+)$/.exec(line);
    if (current && continuation) {
      const text = clean(continuation[1]);
      if (text) current.text = `${current.text} ${text}`.trim();
    }
  }
}

if (records.some(record => !record.chapter || !record.text)) {
  throw new Error('Parsed records include a missing chapter or empty verse.');
}
fs.writeFileSync(outputFile, `${records.map(({book, chapter, verse, text}) => `${book} ${chapter}:${verse} ${text}`).join('\n')}\n`, 'utf8');
console.log(`Wrote ${records.length.toLocaleString()} verses to ${outputFile}`);
