import { describe, expect, it } from 'vitest';
import { ensureContent } from './content.js';
import path from 'node:path';

describe('content database seeding', () => {
  it('creates the curated question bank with all Genesis questions', () => {
    const db = ensureContent(':memory:');
    expect((db.prepare('SELECT COUNT(*) count FROM questions').get() as {count:number}).count).toBe(11);
    expect((db.prepare("SELECT COUNT(*) count FROM questions WHERE book_id='GEN'").get() as {count:number}).count).toBe(11);
    expect((db.prepare("SELECT COUNT(*) count FROM questions WHERE book_id<>'GEN'").get() as {count:number}).count).toBe(0);
    expect((db.prepare("SELECT answer_b,correct_index FROM questions WHERE id='GEN-000001'").get() as {answer_b:string;correct_index:number})).toEqual({answer_b:'Land and seas',correct_index:1});
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
