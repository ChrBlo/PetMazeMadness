export interface Pet {
  id: string;
  emoji: string;
  name: string;
}

export const DEATH_EMOJI = '💀';

export const pets: Pet[] = [
  {
    id: 'hamster',
    emoji: '🐹',
    name: 'Fjutten'
  },
  {
    id: 'mouse',
    emoji: '🐭',
    name: 'Bengt'
  },
  {
    id: 'rabbit',
    emoji: '🐰',
    name: 'Hopplös'
  },
  {
    id: 'cat',
    emoji: '🐱',
    name: 'Mördarkatten'
  },
  {
    id: 'dog',
    emoji: '🐶',
    name: 'Fluff'
  },
  {
    id: 'frog',
    emoji: '🐸',
    name: 'Boll'
  },
  {
    id: 'pig',
    emoji: '🐷',
    name: 'Fläsk'
  },
  {
    id: 'chick',
    emoji: '🐥',
    name: 'Nugget'
  },
  {
    id: 'crocodile',
    emoji: '🐊',
    name: 'Schnappi'
  }
];

export const getDefaultPet = (): Pet => pets[0];

export const getPetById = (id: string): Pet => {
  return pets.find(pet => pet.id === id) || getDefaultPet();
};