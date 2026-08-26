export type Medal = 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';
export type QuizMode = 'full' | 'practice' | 'daily';
export interface Profile { id:number; name:string; avatarId:string; xp:number; currentStreak:number; longestStreak:number; lastActiveDate:string|null; selectedBanner:string|null }
export interface Question { id:string; bookId:string; bookName:string; chapter:number; verseStart:number; verseEnd:number; text:string; choices:string[] }
export interface QuizState { sessionId:number; mode:QuizMode; bookId:string|null; title:string; currentIndex:number; total:number; answered:number; correct:number; completed:boolean; current:Question|null; selectedIndex:number|null; correctIndex:number|null; isCorrect:boolean|null }
export interface Book { id:string; name:string; testament:'OT'|'NT'; order:number; chapters:number }
export interface Verse { verse:number; text:string; highlightColor?:string; temporary?:boolean }
export interface VerseSearchResult { bookId:string; bookName:string; chapter:number; verse:number; text:string }
export interface Bootstrap { profiles:Profile[]; activeProfile:Profile|null; books:Book[]; animals:{id:string;name:string;emoji:string;unlockLevel:number}[]; appVersion:string; bankVersion:string }
