import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ImageSourcePropType } from 'react-native';
import i18n from '../i18n/i18n';

export interface Pet {
  id: string;
  emoji: ImageSourcePropType;
  name: string;
  enemyEmoji: ImageSourcePropType;
}

export const DeathIcon = ({ size = 14, color = 'black' }) => (
  <FontAwesome6 name="skull" size={size} color={color} />
);

export const pets: Pet[] = [
  {
    id: 'hamster',
    emoji: require('../assets/images/pets/pet_hamster.png'),
    name: 'pets.hamster',
    enemyEmoji: require('../assets/images/enemies/enemy_cat.png')
  },
  {
    id: 'cat',
    emoji: require('../assets/images/pets/pet_cat.png'),
    name: 'pets.cat',
    enemyEmoji: require('../assets/images/enemies/enemy_dog.png')
  },
  {
    id: 'dog',
    emoji: require('../assets/images/pets/pet_dog.png'),
    name: 'pets.dog',
    enemyEmoji: require('../assets/images/enemies/enemy_choclate.png')
  },
  {
    id: 'bunny',
    emoji: require('../assets/images/pets/pet_bunny.png'),
    name: 'pets.bunny',
    enemyEmoji: require('../assets/images/enemies/enemy_turtle.png')
  },
  {
    id: 'frog',
    emoji: require('../assets/images/pets/pet_frog.png'),
    name: 'pets.frog',
    enemyEmoji: require('../assets/images/enemies/enemy_snake.png')
  },
  {
    id: 'chick',
    emoji: require('../assets/images/pets/pet_chick.png'),
    name: 'pets.chick',
    enemyEmoji: require('../assets/images/enemies/enemy_fox.png')
  },
  {
    id: 'goat',
    emoji: require('../assets/images/pets/pet_goat.png'),
    name: 'pets.goat',
    enemyEmoji: require('../assets/images/enemies/enemy_trex.png')
  },
  {
    id: 'trex',
    emoji: require('../assets/images/pets/pet_trex.png'),
    name: 'pets.trex',
    enemyEmoji: require('../assets/images/enemies/enemy_comet.png')
  }
];

export const getPetById = (id: string): Pet => {
  return pets.find(pet => pet.id === id) || getDefaultPet();
};

export const getTranslatedPetName = (pet: Pet): string => {
  return i18n.t(pet.name);
};

export const getDisplayName = (pet: Pet): string => {
  if (pet.name.startsWith('pets.')) {
    return getTranslatedPetName(pet);
  }
  return pet.name;
};

export const getDefaultPet = (): Pet => {
  const defaultPet = pets[0];
  return {
    ...defaultPet,
    name: i18n.t(defaultPet.name)
  };
};