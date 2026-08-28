import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookOpen, ChevronLeft, ChevronRight, Minus, Plus, Search, StickyNote, X } from 'lucide-react';
import type { BibleTranslation, Book, Verse, VerseSearchResult } from '../shared/types';
import './reader.css';
import './annotations.css';
import './highlight-text.css';

const api=<T,>(channel:string,payload?:unknown)=>window.selah.invoke<T>(channel,payload);
const colors=['yellow','green','blue','pink','purple'] as const;
type ReaderTheme='paper'|'sepia'|'night';

export default function Reader({books,initial,back}:{books:Book[];initial?:{bookId:string;chapter:number;from:number;to:number};back?:()=>void}){
 const readerRef=useRef<HTMLElement>(null);
 const saved=(()=>{try{return JSON.parse(localStorage.getItem('bible-reader-preferences')??'{}')}catch{return{}}})();
 const [bookId,setBookId]=useState(initial?.bookId??'GEN');
 const [chapter,setChapter]=useState(initial?.chapter??1);
 const [translationId,setTranslationId]=useState<string>(saved.translationId??'BSB');
 const [translations,setTranslations]=useState<BibleTranslation[]>([]);
 const [verses,setVerses]=useState<Verse[]>([]);
 const [loadError,setLoadError]=useState('');
 const [fontSize,setFontSize]=useState<number>(saved.fontSize??21);
 const [lineHeight,setLineHeight]=useState<number>(saved.lineHeight??1.9);
 const [theme,setTheme]=useState<ReaderTheme>(saved.theme??'paper');
 const [query,setQuery]=useState('');
 const [results,setResults]=useState<VerseSearchResult[]>([]);
 const [searching,setSearching]=useState(false);
 const [editingVerse,setEditingVerse]=useState<number|null>(null);
 const [noteDraft,setNoteDraft]=useState('');
 const isQuizPassage=Boolean(initial&&back);
 const book=useMemo(()=>books.find(item=>item.id===bookId)??books[0],[books,bookId]);
 const translation=translations.find(item=>item.id===translationId);
 const load=()=>{setLoadError('');return api<Verse[]>('bible:chapter',{translationId,bookId,chapter}).then(setVerses).catch(error=>{setVerses([]);setLoadError(error instanceof Error?error.message:String(error))})};
 useEffect(()=>{void api<BibleTranslation[]>('bible:translations').then(setTranslations)},[]);
 useEffect(()=>{void load()},[translationId,bookId,chapter]);
 useEffect(()=>{if(!initial||!verses.length)return;const frame=requestAnimationFrame(()=>readerRef.current?.querySelector(`[data-verse="${initial.from}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}));return()=>cancelAnimationFrame(frame)},[initial,verses]);
 useEffect(()=>{localStorage.setItem('bible-reader-preferences',JSON.stringify({fontSize,lineHeight,theme,translationId}))},[fontSize,lineHeight,theme,translationId]);
 useEffect(()=>{if(!query.trim()){setResults([]);return}const timer=setTimeout(()=>{setSearching(true);api<VerseSearchResult[]>('bible:search',{query,translationId}).then(setResults).finally(()=>setSearching(false))},250);return()=>clearTimeout(timer)},[query,translationId]);
 useEffect(()=>{const keys=(event:KeyboardEvent)=>{if((event.target as HTMLElement)?.matches('input,select'))return;if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)};window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys)});
 function openLocation(nextBook:string,nextChapter:number){setBookId(nextBook);setChapter(nextChapter);setQuery('');setResults([]);window.scrollTo({top:0,behavior:'smooth'})}
 function move(direction:number){let nextChapter=chapter+direction,nextBook=book;if(nextChapter<1){const previous=books[book.order-2];if(!previous)return;nextBook=previous;nextChapter=previous.chapters}else if(nextChapter>book.chapters){const following=books[book.order];if(!following)return;nextBook=following;nextChapter=1}openLocation(nextBook.id,nextChapter)}
 function highlight(verse:number,color:string|null){void api('highlight:set',{bookId,chapter,verse,color}).then(load)}
 function editNote(item:Verse){setEditingVerse(item.verse);setNoteDraft(item.note??'')}
 function saveNote(){if(editingVerse===null)return;void api('note:set',{bookId,chapter,verse:editingVerse,note:noteDraft}).then(()=>{setEditingVerse(null);void load()})}
 function toggleBookmark(verse:number){void api('bookmark:toggle',{bookId,chapter,verse}).then(load)}
 return <section ref={readerRef} className={`reader reader-${theme}`}>
  {back&&<button className="back" onClick={back}><ChevronLeft/> Back to quiz</button>}
  <div className="reader-head"><div><span className="eyebrow">{isQuizPassage?'QUIZ SOURCE PASSAGE':`${translation?.name??'BEREAN STANDARD BIBLE'} · 66 BOOKS · OFFLINE`}</span><h1>{book.name} {chapter}{isQuizPassage&&initial?`:${initial.from}${initial.to!==initial.from?`–${initial.to}`:''}`:''}</h1></div>{!isQuizPassage&&<div className="reader-selectors"><select aria-label="Bible translation" value={translationId} onChange={event=>{setTranslationId(event.target.value);setQuery('');setResults([])}}>{translations.map(item=><option value={item.id} key={item.id}>{item.abbreviation} — {item.description}</option>)}</select><select aria-label="Bible book" value={bookId} onChange={event=>openLocation(event.target.value,1)}>{books.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select><select aria-label="Chapter" value={chapter} onChange={event=>setChapter(Number(event.target.value))}>{Array.from({length:book.chapters},(_,index)=><option value={index+1} key={index+1}>Chapter {index+1}</option>)}</select></div>}</div>
  {!isQuizPassage&&<div className="reader-tools card"><label className="bible-search"><Search size={17}/><input aria-label="Search the Bible" placeholder="Search all 31,103 verses" value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button aria-label="Clear search" onClick={()=>setQuery('')}><X size={16}/></button>}</label><div className="text-controls"><button aria-label="Decrease text size" onClick={()=>setFontSize(Math.max(16,fontSize-1))}><Minus size={16}/></button><span>Text</span><button aria-label="Increase text size" onClick={()=>setFontSize(Math.min(32,fontSize+1))}><Plus size={16}/></button><select aria-label="Line spacing" value={lineHeight} onChange={event=>setLineHeight(Number(event.target.value))}><option value="1.6">Compact</option><option value="1.9">Comfortable</option><option value="2.2">Spacious</option></select><select aria-label="Reading theme" value={theme} onChange={event=>setTheme(event.target.value as ReaderTheme)}><option value="paper">Paper</option><option value="sepia">Sepia</option><option value="night">Night</option></select></div></div>}
  {query?<div className="search-results card"><b>{searching?'Searching…':`${results.length}${results.length===100?'+' : ''} results`}</b>{!searching&&results.length===0&&<p>No verses found. Try another word or phrase.</p>}{results.map(result=><button key={`${result.bookId}-${result.chapter}-${result.verse}`} onClick={()=>openLocation(result.bookId,result.chapter)}><strong>{result.bookName} {result.chapter}:{result.verse}</strong><span>{result.text}</span></button>)}</div>:verses.length?<article className="scripture" style={{fontSize,lineHeight}}>{verses.map(item=><p data-verse={item.verse} className={initial&&item.verse>=initial.from&&item.verse<=initial.to?'temporary':''} key={item.verse}><sup>{item.verse}</sup><span className="verse-text" style={item.highlightColor?{background:`var(--highlight-${item.highlightColor})`}:undefined}>{item.text}</span>{!isQuizPassage&&item.note&&<small className="verse-note"><StickyNote size={13}/> {item.note}</small>}{!isQuizPassage&&<span className="highlights">{colors.map(color=><button aria-label={`Highlight verse ${item.verse} ${color}`} title={color} className={`swatch swatch-${color}`} onClick={()=>highlight(item.verse,color)} key={color}/>)}<button aria-label={`Remove highlight from verse ${item.verse}`} title="Remove highlight" onClick={()=>highlight(item.verse,null)}>×</button><button className={item.bookmarked?'annotation-active':''} aria-label={`Bookmark verse ${item.verse}`} title="Bookmark" onClick={()=>toggleBookmark(item.verse)}><Bookmark size={15}/></button><button aria-label={`Add note to verse ${item.verse}`} title="Personal note" onClick={()=>editNote(item)}><StickyNote size={15}/></button></span>}</p>)}</article>:<div className="empty card"><BookOpen/><h3>Chapter unavailable</h3><p>{loadError||'The local Bible content could not provide this chapter.'}</p></div>}
  {editingVerse!==null&&!isQuizPassage&&<div className="note-editor card"><b>Personal note · {book.name} {chapter}:{editingVerse}</b><textarea autoFocus value={noteDraft} onChange={event=>setNoteDraft(event.target.value)} placeholder="Write a private note saved only to this profile…"/><div><button className="secondary" onClick={()=>setEditingVerse(null)}>Cancel</button><button className="secondary" onClick={()=>setNoteDraft('')}>Clear</button><button className="primary" onClick={saveNote}>Save note</button></div></div>}
  {!query&&!isQuizPassage&&<div className="chapter-nav"><button onClick={()=>move(-1)}><ChevronLeft/> Previous chapter</button><span>{book.name} {chapter} of {book.chapters}</span><button onClick={()=>move(1)}>Next chapter <ChevronRight/></button></div>}
  <p className="translation-note">{translation?.name??'Berean Standard Bible'}, {translation?.license??'Public Domain'}. Bible text is stored locally and works without an internet connection.</p>
 </section>
}
