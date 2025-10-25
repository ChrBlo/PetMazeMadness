import { Pet, getPetById } from '../data/pets';
// @ts-ignore
import store from 'react-native-simple-store';

export interface LevelStars {
  levelId: number;
  stars: {
    completedNormalMode: boolean;
    completedChaosMode: boolean;
    allSnacksEaten: boolean;
    underMazeTimeLimit: boolean;
    noExtraLivesUsed: boolean;
  };
}

export class CRUDManager{ 

  static async saveExtraLives(extraLives: number): Promise<void> {
    const key = 'current_extra_lives';
    await store.save(key, extraLives);
  }

  static async getExtraLives(): Promise<number> {
    const key = 'current_extra_lives';
    const lives = await store.get(key);
    return lives || 0;
  }

  static async saveEatenSnacks(levelId: number, snackKeys: string[]): Promise<void> {
    const key = `level_${levelId}_eaten_snacks`;
    await store.save(key, snackKeys);
  }

  static async getEatenSnacks(levelId: number): Promise<string[]> {
    const key = `level_${levelId}_eaten_snacks`;
    const snacks = await store.get(key);
    return snacks || [];
  }

  static async saveLevelStars(levelId: number, stars: LevelStars['stars']): Promise<void> {
    const key = `level_stars_${levelId}`;
    await store.save(key, stars);
  }

  static async getLevelStars(levelId: number): Promise<LevelStars['stars'] | null> {
    const key = `level_stars_${levelId}`;
    const stars = await store.get(key);
    return stars || null;
  }

  static async saveSelectedPet(pet: Pet): Promise<void> {

    const key = 'selected_pet';

    const serializablePet = {
      id: pet.id,
      name: pet.name
    };

    await store.save(key, serializablePet);
  }

  static async getSelectedPet(): Promise<Pet | null> {

    const key = 'selected_pet';

    const savedData = await store.get(key);
    
    if (!savedData) return null;
    
    const pet = getPetById(savedData.id);
    
    return { ...pet, name: savedData.name };
  }

  static async saveInvertedControls(inverted: boolean): Promise<void> {
    await store.save('inverted_game_controls', inverted);
  }

  static async getInvertedControls(): Promise<boolean> {
    const inverted = await store.get('inverted_game_controls');
    return inverted ?? false;
  }
}