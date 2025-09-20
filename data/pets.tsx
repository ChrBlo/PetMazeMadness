// src/data/pets.ts
export interface Pet {
  id: string;
  emoji: string;
  defaultName: string;
}

export const DEATH_EMOJI = '💀';

export const PETS: Pet[] = [
  {
    id: 'hamster',
    emoji: '🐹',
    defaultName: 'Fjutten'
  },
  {
    id: 'mouse',
    emoji: '🐭',
    defaultName: 'Bengt'
  },
  {
    id: 'rabbit',
    emoji: '🐰',
    defaultName: 'Hopplös'
  },
  {
    id: 'cat',
    emoji: '🐱',
    defaultName: 'Världserövraren Smulan'
  },
  {
    id: 'dog',
    emoji: '🐶',
    defaultName: 'Get'
  },
  {
    id: 'frog',
    emoji: '🐸',
    defaultName: 'Boll'
  },
  {
    id: 'pig',
    emoji: '🐷',
    defaultName: 'Fläsk'
  },
  {
    id: 'chick',
    emoji: '🐥',
    defaultName: 'Nugget'
  }
];

export const getDefaultPet = (): Pet => PETS[0];

export const getPetById = (id: string): Pet => {
  return PETS.find(pet => pet.id === id) || getDefaultPet();
};