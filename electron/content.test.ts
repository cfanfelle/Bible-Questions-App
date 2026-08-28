import { describe, expect, it } from 'vitest';
import { ensureContent } from './content.js';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import Database from './db.js';

describe('content database seeding', () => {
  it('creates the curated question bank with all Genesis questions', () => {
    const db = ensureContent(':memory:');
    expect((db.prepare('SELECT COUNT(*) count FROM questions').get() as {count:number}).count).toBe(21);
    expect((db.prepare("SELECT COUNT(*) count FROM questions WHERE book_id='GEN'").get() as {count:number}).count).toBe(21);
    expect((db.prepare("SELECT COUNT(*) count FROM questions WHERE book_id<>'GEN'").get() as {count:number}).count).toBe(0);
    expect((db.prepare("SELECT answer_b,correct_index FROM questions WHERE id='GEN-000001'").get() as {answer_b:string;correct_index:number})).toEqual({answer_b:'Land and seas',correct_index:1});
    expect((db.prepare("SELECT answer_b,correct_index FROM questions WHERE id='GEN-000021'").get() as {answer_b:string;correct_index:number})).toEqual({answer_b:'An olive leaf',correct_index:1});
    db.close();
  });
  it('imports three complete offline, public-domain Bible translations', () => {
    const contentDir=path.join(process.cwd(),'content');
    const db=ensureContent(':memory:',[
      {translationId:'BSB',file:path.join(contentDir,'engbsb_vpl.txt')},
      {translationId:'WEB',file:path.join(contentDir,'engwebp_vpl.txt')},
      {translationId:'KJV',file:path.join(contentDir,'engkjv_vpl.txt')}
    ]);
    expect(db.prepare('SELECT translation_id,COUNT(*) count FROM verses GROUP BY translation_id ORDER BY translation_id').all()).toEqual([
      {translation_id:'BSB',count:31086},
      {translation_id:'KJV',count:31102},
      {translation_id:'WEB',count:31103}
    ]);
    expect((db.prepare("SELECT COUNT(DISTINCT book_id) count FROM verses WHERE translation_id='BSB'").get() as {count:number}).count).toBe(66);
    expect((db.prepare("SELECT text FROM verses WHERE translation_id='BSB' AND book_id='JHN' AND chapter=3 AND verse=16").get() as {text:string}).text).toContain('God so loved the world');
    db.close();
  });
  it('upgrades an existing single-translation content database without losing its WEB text', () => {
    const directory=fs.mkdtempSync(path.join(os.tmpdir(),'selah-content-'));
    const file=path.join(directory,'content.sqlite');
    const legacy=new Database(file);
    legacy.exec("CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE books(id TEXT PRIMARY KEY,name TEXT NOT NULL,testament TEXT NOT NULL,book_order INTEGER NOT NULL UNIQUE,chapters INTEGER NOT NULL); CREATE TABLE verses(book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse INTEGER NOT NULL,text TEXT NOT NULL,PRIMARY KEY(book_id,chapter,verse)); CREATE TABLE questions(id TEXT PRIMARY KEY,book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse_start INTEGER NOT NULL,verse_end INTEGER NOT NULL,question_text TEXT NOT NULL,answer_a TEXT NOT NULL,answer_b TEXT NOT NULL,answer_c TEXT NOT NULL,answer_d TEXT NOT NULL,correct_index INTEGER NOT NULL); CREATE TABLE animals(id TEXT PRIMARY KEY,name TEXT NOT NULL,emoji TEXT NOT NULL,unlock_level INTEGER NOT NULL,sort_order INTEGER NOT NULL); INSERT INTO metadata VALUES('question_bank_version','legacy'); INSERT INTO books VALUES('GEN','Genesis','OT',1,50); INSERT INTO verses VALUES('GEN',1,1,'Legacy WEB verse');");
    legacy.close();
    const upgraded=ensureContent(file);
    expect((upgraded.prepare("SELECT text FROM verses WHERE translation_id='WEB'").get() as {text:string}).text).toBe('Legacy WEB verse');
    expect((upgraded.prepare('SELECT COUNT(*) count FROM translations').get() as {count:number}).count).toBe(3);
    upgraded.close();
    fs.rmSync(directory,{recursive:true,force:true});
  });
});
