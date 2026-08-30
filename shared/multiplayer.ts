export const READING_BUFFER_SECONDS=5;
export const MAX_GAME_PLAYERS=20;
export const MIN_CORRECT_POINTS=300;
export const MAX_CORRECT_POINTS=1000;

export function timedQuestionPoints(elapsedMs:number,answerSeconds:number){
  const duration=Math.max(1,answerSeconds)*1000;
  const remaining=Math.max(0,Math.min(duration,duration-elapsedMs));
  return Math.floor(MIN_CORRECT_POINTS+(MAX_CORRECT_POINTS-MIN_CORRECT_POINTS)*(remaining/duration));
}
