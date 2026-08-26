import {describe,it,expect} from 'vitest'; import {levelFromXp,medalFor,streak,shuffled} from './domain.js';
describe('critical rules',()=>{
 it('has unlimited levels and keeps decimal precision',()=>{expect(levelFromXp(0).level).toBe(1);expect(levelFromXp(25).level).toBe(2);expect(levelFromXp(1_000_000).level).toBeGreaterThan(1000)});
 it('uses exact medal boundaries',()=>{expect(medalFor(69.999)).toBe('none');expect(medalFor(70)).toBe('bronze');expect(medalFor(80)).toBe('silver');expect(medalFor(90)).toBe('gold');expect(medalFor(100)).toBe('diamond')});
 it('updates local-date streaks once per day',()=>{expect(streak('2026-08-25',4,8,'2026-08-26')).toEqual({current:5,longest:8});expect(streak('2026-08-26',5,8,'2026-08-26')).toEqual({current:5,longest:8});expect(streak('2026-08-20',5,8,'2026-08-26')).toEqual({current:1,longest:8})});
 it('shuffles without losing values',()=>expect(shuffled([0,1,2,3],()=>0)).toHaveLength(4));
});
