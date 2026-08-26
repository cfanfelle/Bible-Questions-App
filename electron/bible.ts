import Database from './db.js';

export function readChapter(content:Database,user:Database,profileId:number,bookId:string,chapter:number){
 const verses=content.prepare('SELECT verse,text FROM verses WHERE book_id=? AND chapter=? ORDER BY verse').all(bookId,chapter) as unknown as {verse:number;text:string}[];
 const saved=user.prepare('SELECT verse,color FROM highlights WHERE profile_id=? AND book_id=? AND chapter=?').all(profileId,bookId,chapter) as unknown as {verse:number;color:string}[];
 const notes=user.prepare('SELECT verse,note FROM verse_notes WHERE profile_id=? AND book_id=? AND chapter=?').all(profileId,bookId,chapter) as unknown as {verse:number;note:string}[];
 const bookmarks=user.prepare('SELECT verse FROM bookmarks WHERE profile_id=? AND book_id=? AND chapter=?').all(profileId,bookId,chapter) as unknown as {verse:number}[];
 const colors=new Map(saved.map(item=>[item.verse,item.color]));
 const noteMap=new Map(notes.map(item=>[item.verse,item.note]));
 const marked=new Set(bookmarks.map(item=>item.verse));
 return verses.map(verse=>({...verse,highlightColor:colors.get(verse.verse),note:noteMap.get(verse.verse),bookmarked:marked.has(verse.verse)}));
}
