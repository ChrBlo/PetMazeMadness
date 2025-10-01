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

  static async saveSelectedPet(pet: { id: string; name: string; emoji: string }): Promise<void> {
    const key = 'selected_pet';
    await store.save(key, pet);
  }

  static async getSelectedPet(): Promise<{ id: string; name: string; emoji: string } | null> {
    const key = 'selected_pet';
    const pet = await store.get(key);
    return pet || null;
  }
}