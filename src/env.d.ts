/// <reference types="vite/client" />
import type { Bootstrap, Profile, QuizState, Verse } from '../shared/types';
declare global { interface Window { selah: { invoke<T=unknown>(channel:string,payload?:unknown):Promise<T>; activity():void } } }
export {};
