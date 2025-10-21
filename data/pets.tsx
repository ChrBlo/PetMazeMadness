import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { ImageSourcePropType } from 'react-native';

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
    name: 'Fjutten',
    enemyEmoji: require('../assets/images/enemies/enemy_cat.png')
  },
  {
    id: 'cat',
    emoji: require('../assets/images/pets/pet_cat.png'),
    name: 'Mördarkatten',
    enemyEmoji: require('../assets/images/enemies/enemy_dog.png')
  },
  {
    id: 'dog',
    emoji: require('../assets/images/pets/pet_dog.png'),
    name: 'Fluff',
    enemyEmoji: require('../assets/images/enemies/enemy_cat.png')
  },
  {
    id: 'frog',
    emoji: require('../assets/images/pets/pet_frog.png'),
    name: 'Boll',
    enemyEmoji: require('../assets/images/enemies/enemy_cat.png')
  },
  {
    id: 'chick',
    emoji: require('../assets/images/pets/pet_chick.png'),
    name: 'Nugget',
    enemyEmoji: require('../assets/images/enemies/enemy_cat.png')
  },
  {
    id: 'goat',
    emoji: require('../assets/images/pets/pet_goat.png'),
    name: 'Bosse',
    enemyEmoji: require('../assets/images/enemies/enemy_trex.png')
  }
  // {
  //   id: 'trex',
  //   emoji: require('../assets/images/pets/pet_trex.png'),
  //   name: 'Rawr',
  //   enemyEmoji: require('../assets/images/pets/enemy_comet.png')
  // }
];

export const getDefaultPet = (): Pet => pets[0];

export const getPetById = (id: string): Pet => {
  return pets.find(pet => pet.id === id) || getDefaultPet();
};