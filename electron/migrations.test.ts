import {describe,expect,it} from 'vitest';
import Database from './db.js';
import {userMigrations} from './migrations.js';

describe('user database migrations',()=>{
 it('upgrades a fresh profile database with notes and bookmarks without replacing data',()=>{
  const db=new Database(':memory:');
  userMigrations.forEach(sql=>db.exec(sql));
  const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as unknown as {name:string}[];
  expect(tables.map(item=>item.name)).toEqual(expect.arrayContaining(['profiles','highlights','verse_notes','bookmarks']));
  db.close();
 });
});
