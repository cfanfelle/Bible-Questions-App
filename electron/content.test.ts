import { describe, expect, it } from 'vitest';
import { ensureContent } from './content.js';
import path from 'node:path';

describe('content database seeding', () => {
  it('creates all sample questions and can be run again safely', () => {
    const db = ensureContent(':memory:');
    expect((db.prepare('SELECT COUNT(*) count FROM questions').get() as {count:number}).count).toBe(3);
    db.close();
  });
  it('imports the complete 66-book WEB canon with mapped book identifiers', () => {
    const source=path.join(process.cwd(),'content','engwebp_vpl.txt');
    const db=ensureContent(':memory:',source);
    expect((db.prepare('SELECT COUNT(*) count FROM verses').get() as {count:number}).count).toBe(31103);
    expect((db.prepare("SELECT COUNT(DISTINCT book_id) count FROM verses").get() as {count:number}).count).toBe(66);
    expect((db.prepare("SELECT text FROM verses WHERE book_id='JHN' AND chapter=3 AND verse=16").get() as {text:string}).text).toContain('God so loved the world');
    db.close();
  });
});
