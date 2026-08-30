import {describe,expect,it} from 'vitest';
import {timedQuestionPoints} from './multiplayer.js';

describe('multiplayer timed scoring',()=>{
  it('awards 1000 immediately and 300 when time expires',()=>{
    expect(timedQuestionPoints(0,20)).toBe(1000);
    expect(timedQuestionPoints(20_000,20)).toBe(300);
  });
  it('decreases linearly for any configured question time',()=>{
    expect(timedQuestionPoints(10_000,20)).toBe(650);
    expect(timedQuestionPoints(15_000,30)).toBe(650);
    expect(timedQuestionPoints(99_000,20)).toBe(300);
  });
});
