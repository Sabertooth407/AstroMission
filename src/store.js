import { writable } from "svelte/store";

export const hullDamage = writable(0);
export const gameStatus = writable("playing");
export const timeLeft = writable(420);

export const gameConfig = writable({});