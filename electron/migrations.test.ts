import {describe,expect,it} from 'vitest';
import Database from './db.js';
import {userMigrations} from './migrations.js';

describe('user database migrations',()=>{
 it('upgrades a fresh profile database with notes and five chapter bookmark slots',()=>{
  const db=new Database(':memory:');
  userMigrations.forEach(sql=>db.exec(sql));
  const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as unknown as {name:string}[];
  expect(tables.map(item=>item.name)).toEqual(expect.arrayContaining(['profiles','highlights','verse_notes','bookmarks','chapter_bookmarks']));
  const bookStatColumns=db.prepare('PRAGMA table_info(book_stats)').all() as unknown as {name:string}[];
  expect(bookStatColumns.map(column=>column.name)).toContain('last_question_count');
  const profile=Number(db.prepare("INSERT INTO profiles(name,avatar_id,created_at) VALUES('Reader','lamb','now')").run().lastInsertRowid);
  db.prepare("INSERT INTO chapter_bookmarks VALUES(?,?,?,?,?)").run(profile,'red','GEN',1,'first');
  db.prepare("INSERT INTO chapter_bookmarks VALUES(?,?,?,?,?) ON CONFLICT(profile_id,color) DO UPDATE SET book_id=excluded.book_id,chapter=excluded.chapter,updated_at=excluded.updated_at").run(profile,'red','JHN',3,'second');
  expect(db.prepare('SELECT color,book_id bookId,chapter FROM chapter_bookmarks').all()).toEqual([{color:'red',bookId:'JHN',chapter:3}]);
  db.close();
 });
});
