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
    name: 'Världserövraren Smulan'
  },
  {
    id: 'dog',
    emoji: '🐶',
    name: 'Get'
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
  }
];

export const getDefaultPet = (): Pet => pets[0];

export const getPetById = (id: string): Pet => {
  return pets.find(pet => pet.id === id) || getDefaultPet();
};