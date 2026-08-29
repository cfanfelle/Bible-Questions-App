import {describe,expect,it} from 'vitest';
import path from 'node:path';
import Database from './db.js';
import {ensureContent} from './content.js';
import {readChapter,searchVerses} from './bible.js';

describe('Bible reader data service',()=>{
 it('reads Romans 1 while merging profile highlights from the separate user database',()=>{
  const content=ensureContent(':memory:',[{translationId:'WEB',file:path.join(process.cwd(),'content','engwebp_vpl.txt')}]);
  const user=new Database(':memory:');
  user.exec('CREATE TABLE highlights(profile_id INTEGER,book_id TEXT,chapter INTEGER,verse INTEGER,color TEXT)');
  user.exec('CREATE TABLE verse_notes(profile_id INTEGER,book_id TEXT,chapter INTEGER,verse INTEGER,note TEXT)');
  user.exec('CREATE TABLE bookmarks(profile_id INTEGER,book_id TEXT,chapter INTEGER,verse INTEGER)');
  user.prepare('INSERT INTO highlights VALUES(?,?,?,?,?)').run(7,'ROM',1,1,'yellow');
  user.prepare('INSERT INTO verse_notes VALUES(?,?,?,?,?)').run(7,'ROM',1,1,'Remember the introduction');
  user.prepare('INSERT INTO bookmarks VALUES(?,?,?,?)').run(7,'ROM',1,1);
  const verses=readChapter(content,user,7,'WEB','ROM',1);
  expect(verses).toHaveLength(32);
  expect(verses[0]).toMatchObject({verse:1,highlightColor:'yellow',note:'Remember the introduction',bookmarked:true});
  expect(verses[0].text).toContain('Paul');
  content.close();user.close();
 });
 it('searches verse text by a word or exact multi-word phrase',()=>{
  const content=ensureContent(':memory:',[{translationId:'BSB',file:path.join(process.cwd(),'content','engbsb_vpl.txt')}]);
  const love=searchVerses(content,'BSB','love');
  expect(love.length).toBeGreaterThan(0);
  expect(love.some(result=>result.text.toLowerCase().includes('love'))).toBe(true);
  expect(searchVerses(content,'BSB','shield around me')).toEqual(expect.arrayContaining([expect.objectContaining({bookId:'PSA',chapter:3,verse:3})]));
  content.close();
 });
 it('finds a direct Scripture reference using a book name or abbreviation',()=>{
  const content=ensureContent(':memory:',[{translationId:'BSB',file:path.join(process.cwd(),'content','engbsb_vpl.txt')}]);
  expect(searchVerses(content,'BSB','Psalms 3:3')).toEqual([expect.objectContaining({bookId:'PSA',bookName:'Psalms',chapter:3,verse:3})]);
  expect(searchVerses(content,'BSB','PSA 3:3')).toEqual([expect.objectContaining({bookId:'PSA',chapter:3,verse:3})]);
  content.close();
 });
});
