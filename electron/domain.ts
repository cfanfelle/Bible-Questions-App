import type { Medal } from '../shared/types.js';
export const levelRequirement = (level:number) => 25 * Math.pow(1.0003, level - 1);
export function levelFromXp(xp:number) { let level=1, remaining=Math.max(0,xp); while(remaining+1e-9>=levelRequirement(level)){remaining-=levelRequirement(level++);} return {level, into:remaining, needed:levelRequirement(level)}; }
export function medalFor(percent:number):Medal { return percent>=100?'diamond':percent>=90?'gold':percent>=80?'silver':percent>=70?'bronze':'none'; }
export function streak(last:string|null,current:number,longest:number,today:string){ if(last===today)return{current,longest}; if(!last)return{current:1,longest:Math.max(1,longest)}; const a=new Date(last+'T12:00:00'),b=new Date(today+'T12:00:00'); const days=Math.round((b.getTime()-a.getTime())/86400000); const next=days===1?current+1:1; return {current:next,longest:Math.max(longest,next)}; }
export function shuffled<T>(items:T[], random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export const medalRank:Record<Medal,number>={none:0,bronze:1,silver:2,gold:3,diamond:4};
