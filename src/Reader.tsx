import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Minus, Plus, Search, X } from 'lucide-react';
import type { Book, Verse, VerseSearchResult } from '../shared/types';
import './reader.css';

const api=<T,>(channel:string,payload?:unknown)=>window.selah.invoke<T>(channel,payload);
const colors=['yellow','green','blue','pink','purple'] as const;
type ReaderTheme='paper'|'sepia'|'night';

export default function Reader({books,initial,back}:{books:Book[];initial?:{bookId:string;chapter:number;from:number;to:number};back?:()=>void}){
 const saved=(()=>{try{return JSON.parse(localStorage.getItem('bible-reader-preferences')??'{}')}catch{return{}}})();
 const [bookId,setBookId]=useState(initial?.bookId??'GEN');
 const [chapter,setChapter]=useState(initial?.chapter??1);
 const [verses,setVerses]=useState<Verse[]>([]);
 const [fontSize,setFontSize]=useState<number>(saved.fontSize??21);
 const [lineHeight,setLineHeight]=useState<number>(saved.lineHeight??1.9);
 const [theme,setTheme]=useState<ReaderTheme>(saved.theme??'paper');
 const [query,setQuery]=useState('');
 const [results,setResults]=useState<VerseSearchResult[]>([]);
 const [searching,setSearching]=useState(false);
 const book=useMemo(()=>books.find(item=>item.id===bookId)??books[0],[books,bookId]);
 const load=()=>api<Verse[]>('bible:chapter',{bookId,chapter}).then(setVerses);
 useEffect(()=>{void load()},[bookId,chapter]);
 useEffect(()=>{localStorage.setItem('bible-reader-preferences',JSON.stringify({fontSize,lineHeight,theme}))},[fontSize,lineHeight,theme]);
 useEffect(()=>{if(!query.trim()){setResults([]);return}const timer=setTimeout(()=>{setSearching(true);api<VerseSearchResult[]>('bible:search',query).then(setResults).finally(()=>setSearching(false))},250);return()=>clearTimeout(timer)},[query]);
 useEffect(()=>{const keys=(event:KeyboardEvent)=>{if((event.target as HTMLElement)?.matches('input,select'))return;if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)};window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys)});
 function openLocation(nextBook:string,nextChapter:number){setBookId(nextBook);setChapter(nextChapter);setQuery('');setResults([]);window.scrollTo({top:0,behavior:'smooth'})}
 function move(direction:number){let nextChapter=chapter+direction,nextBook=book;if(nextChapter<1){const previous=books[book.order-2];if(!previous)return;nextBook=previous;nextChapter=previous.chapters}else if(nextChapter>book.chapters){const following=books[book.order];if(!following)return;nextBook=following;nextChapter=1}openLocation(nextBook.id,nextChapter)}
 function highlight(verse:number,color:string|null){void api('highlight:set',{bookId,chapter,verse,color}).then(load)}
 return <section className={`reader reader-${theme}`}>
  {back&&<button className="back" onClick={back}><ChevronLeft/> Back to quiz</button>}
  <div className="reader-head"><div><span className="eyebrow">WORLD ENGLISH BIBLE · 66 BOOKS · OFFLINE</span><h1>{book.name} {chapter}</h1></div><div className="reader-selectors"><select aria-label="Bible book" value={bookId} onChange={event=>openLocation(event.target.value,1)}>{books.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select><select aria-label="Chapter" value={chapter} onChange={event=>setChapter(Number(event.target.value))}>{Array.from({length:book.chapters},(_,index)=><option value={index+1} key={index+1}>Chapter {index+1}</option>)}</select></div></div>
  <div className="reader-tools card"><label className="bible-search"><Search size={17}/><input aria-label="Search the Bible" placeholder="Search all 31,103 verses" value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button aria-label="Clear search" onClick={()=>setQuery('')}><X size={16}/></button>}</label><div className="text-controls"><button aria-label="Decrease text size" onClick={()=>setFontSize(Math.max(16,fontSize-1))}><Minus size={16}/></button><span>Text</span><button aria-label="Increase text size" onClick={()=>setFontSize(Math.min(32,fontSize+1))}><Plus size={16}/></button><select aria-label="Line spacing" value={lineHeight} onChange={event=>setLineHeight(Number(event.target.value))}><option value="1.6">Compact</option><option value="1.9">Comfortable</option><option value="2.2">Spacious</option></select><select aria-label="Reading theme" value={theme} onChange={event=>setTheme(event.target.value as ReaderTheme)}><option value="paper">Paper</option><option value="sepia">Sepia</option><option value="night">Night</option></select></div></div>
  {query?<div className="search-results card"><b>{searching?'Searching…':`${results.length}${results.length===100?'+' : ''} results`}</b>{!searching&&results.length===0&&<p>No verses found. Try another word or phrase.</p>}{results.map(result=><button key={`${result.bookId}-${result.chapter}-${result.verse}`} onClick={()=>openLocation(result.bookId,result.chapter)}><strong>{result.bookName} {result.chapter}:{result.verse}</strong><span>{result.text}</span></button>)}</div>:verses.length?<article className="scripture" style={{fontSize,lineHeight}}>{verses.map(item=><p className={initial&&item.verse>=initial.from&&item.verse<=initial.to?'temporary':''} style={item.highlightColor?{background:`var(--highlight-${item.highlightColor})`}:undefined} key={item.verse}><sup>{item.verse}</sup>{item.text}<span className="highlights">{colors.map(color=><button aria-label={`Highlight verse ${item.verse} ${color}`} title={color} className={`swatch swatch-${color}`} onClick={()=>highlight(item.verse,color)} key={color}/>)}<button aria-label={`Remove highlight from verse ${item.verse}`} title="Remove highlight" onClick={()=>highlight(item.verse,null)}>×</button></span></p>)}</article>:<div className="empty card"><BookOpen/><h3>Chapter unavailable</h3><p>The local Bible content could not provide this chapter.</p></div>}
  {!query&&<div className="chapter-nav"><button onClick={()=>move(-1)}><ChevronLeft/> Previous chapter</button><span>{book.name} {chapter} of {book.chapters}</span><button onClick={()=>move(1)}>Next chapter <ChevronRight/></button></div>}
  <p className="translation-note">World English Bible, Public Domain. Bible text is stored locally and works without an internet connection.</p>
 </section>
}
