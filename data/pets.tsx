export interface Pet {
  id: string;
  emoji: string;
  name: string;
  enemyEmoji?: string;
}

export const DEATH_EMOJI = '💀';

export const pets: Pet[] = [
  {
    id: 'hamster',
    emoji: '🐹',
    name: 'Fjutten',
    enemyEmoji: '🐈'
  },
  {
    id: 'mouse',
    emoji: '🐭',
    name: 'Bengt',
    enemyEmoji: '🦅'
  },
  {
    id: 'rabbit',
    emoji: '🐰',
    name: 'Hopplös',
    enemyEmoji: '🐢'
  },
  {
    id: 'cat',
    emoji: '🐱',
    name: 'Mördarkatten',
    enemyEmoji: '🐕'
  },
  {
    id: 'dog',
    emoji: '🐶',
    name: 'Fluff',
    enemyEmoji: '🍫'
  },
  {
    id: 'frog',
    emoji: '🐸',
    name: 'Boll',
    enemyEmoji: '🐍'
  },
  {
    id: 'pig',
    emoji: '🐷',
    name: 'Fläsk',
    enemyEmoji: '🥓'
  },
  {
    id: 'chick',
    emoji: '🐥',
    name: 'Nugget',
    enemyEmoji: '🐍'
  },
  {
    id: 'crocodile',
    emoji: '🐊',
    name: 'Schnappi',
    enemyEmoji: '👜'
  },
  {
    id: 'goat',
    emoji: '🐐',
    name: 'Bosse',
    enemyEmoji: '🦖'
  }
];

export const getDefaultPet = (): Pet => pets[0];

export const getPetById = (id: string): Pet => {
  return pets.find(pet => pet.id === id) || getDefaultPet();
};