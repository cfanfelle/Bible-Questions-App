import {describe,it,expect} from 'vitest'; import {fullQuizQuestions,levelFromXp,medalFor,streak,shuffled} from './domain.js';
describe('critical rules',()=>{
 it('has unlimited levels and keeps decimal precision',()=>{expect(levelFromXp(0).level).toBe(1);expect(levelFromXp(25).level).toBe(2);expect(levelFromXp(1_000_000).level).toBeGreaterThan(1000)});
 it('uses exact medal boundaries',()=>{expect(medalFor(69.999)).toBe('none');expect(medalFor(70)).toBe('bronze');expect(medalFor(80)).toBe('silver');expect(medalFor(90)).toBe('gold');expect(medalFor(100)).toBe('diamond')});
 it('updates local-date streaks once per day',()=>{expect(streak('2026-08-25',4,8,'2026-08-26')).toEqual({current:5,longest:8});expect(streak('2026-08-26',5,8,'2026-08-26')).toEqual({current:5,longest:8});expect(streak('2026-08-20',5,8,'2026-08-26')).toEqual({current:1,longest:8})});
 it('shuffles without losing values',()=>{const result=shuffled([0,1,2,3],()=>0);expect(result).toEqual([1,2,3,0]);expect([...result].sort()).toEqual([0,1,2,3])});
 it('limits full quizzes to 15 randomly ordered questions',()=>{const bank=Array.from({length:30},(_,i)=>i);const result=fullQuizQuestions(bank,()=>0);expect(result).toHaveLength(15);expect(new Set(result).size).toBe(15);expect(result.every(id=>bank.includes(id))).toBe(true)});
 it('uses the entire book bank when fewer than 15 questions exist',()=>{const bank=[1,2,3,4,5];const result=fullQuizQuestions(bank,()=>0);expect(result).toHaveLength(5);expect([...result].sort()).toEqual(bank)});
});
