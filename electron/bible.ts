import Database from './db.js';

export interface VerseSearchResult {bookId:string;bookName:string;chapter:number;verse:number;text:string}

const normalizeBookName=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,'');

export function searchVerses(content:Database,translationId:string,rawQuery:string):VerseSearchResult[]{
 const query=rawQuery.trim();
 if(query.length<2)return [];
 const reference=/^(.+?)\s+(\d+)\s*:\s*(\d+)$/.exec(query);
 if(reference){
  const requestedBook=normalizeBookName(reference[1]);
  const books=content.prepare('SELECT id,name FROM books').all() as unknown as {id:string;name:string}[];
  const book=books.find(item=>{
   const name=normalizeBookName(item.name);
   return requestedBook===name||requestedBook===normalizeBookName(item.id)||requestedBook===`${name}s`||(name==='psalms'&&requestedBook==='psalm');
  });
  if(!book)return [];
  return content.prepare('SELECT v.book_id bookId,b.name bookName,v.chapter,v.verse,v.text FROM verses v JOIN books b ON b.id=v.book_id WHERE v.translation_id=? AND v.book_id=? AND v.chapter=? AND v.verse=?').all(translationId,book.id,Number(reference[2]),Number(reference[3])) as unknown as VerseSearchResult[];
 }
 const literal=query.replace(/\\/g,'\\\\').replace(/%/g,'\\%').replace(/_/g,'\\_');
 return content.prepare("SELECT v.book_id bookId,b.name bookName,v.chapter,v.verse,v.text FROM verses v JOIN books b ON b.id=v.book_id WHERE v.translation_id=? AND v.text LIKE ? ESCAPE '\\' ORDER BY b.book_order,v.chapter,v.verse LIMIT 100").all(translationId,`%${literal}%`) as unknown as VerseSearchResult[];
}

export function readChapter(content:Database,user:Database,profileId:number,translationId:string,bookId:string,chapter:number){
 const verses=content.prepare('SELECT verse,text FROM verses WHERE translation_id=? AND book_id=? AND chapter=? ORDER BY verse').all(translationId,bookId,chapter) as unknown as {verse:number;text:string}[];
 const saved=user.prepare('SELECT verse,color FROM highlights WHERE profile_id=? AND book_id=? AND chapter=?').all(profileId,bookId,chapter) as unknown as {verse:number;color:string}[];
 const notes=user.prepare('SELECT verse,note FROM verse_notes WHERE profile_id=? AND book_id=? AND chapter=?').all(profileId,bookId,chapter) as unknown as {verse:number;note:string}[];
 const bookmarks=user.prepare('SELECT verse FROM bookmarks WHERE profile_id=? AND book_id=? AND chapter=?').all(profileId,bookId,chapter) as unknown as {verse:number}[];
 const colors=new Map(saved.map(item=>[item.verse,item.color]));
 const noteMap=new Map(notes.map(item=>[item.verse,item.note]));
 const marked=new Set(bookmarks.map(item=>item.verse));
 return verses.map(verse=>({...verse,highlightColor:colors.get(verse.verse),note:noteMap.get(verse.verse),bookmarked:marked.has(verse.verse)}));
}
