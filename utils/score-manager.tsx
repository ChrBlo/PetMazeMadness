// @ts-ignore
import store from 'react-native-simple-store';

export interface LevelStats {
  levelId: number;
  bestTime: number | null;
  totalAttempts: number;
  totalDeaths: number;
  completions: number;
  firstCompletionTime: number | null;
}

export interface GameProgress {
  currentLevel: number;
  completedLevels: number[];
  unlockedLevels: number[];
}

export interface CompletionRecord {
  levelId: number;
  petId: string;
  petName: string;
  petEmoji: string;
  completionTime: number;
  attempts: number;
  deaths: number;
  timestamp: number;
  gyroMode: string;
}

export class ScoreManager {
  private static getKey(levelId: number): string {
    return `level_${levelId}_stats`;
  }

  private static getProgressKey(): string {
    return 'game_progress';
  }

  static async getLevelStats(levelId: number): Promise<LevelStats> {

    const stats = await store.get(this.getKey(levelId));
    
    return stats || {
      levelId,
      bestTime: null,
      totalAttempts: 0,
      totalDeaths: 0,
      completions: 0,
      firstCompletionTime: null,
    };
  }

  static async recordAttempt(levelId: number): Promise<LevelStats> {

    const stats = await this.getLevelStats(levelId);
    stats.totalAttempts += 1;

    await store.save(this.getKey(levelId), stats);
    return stats;
  }

  static async recordDeath(levelId: number): Promise<LevelStats> {

    const stats = await this.getLevelStats(levelId);
    stats.totalDeaths += 1;

    await store.save(this.getKey(levelId), stats);
    return stats;
  }

  static async recordCompletion(levelId: number, completionTime: number): Promise<{ isNewRecord: boolean; stats: LevelStats }> {

    const stats = await this.getLevelStats(levelId);
    stats.completions += 1;
    
    if (!stats.firstCompletionTime)
    {
      stats.firstCompletionTime = completionTime;
    }
    
    let isNewRecord = false;
    if (!stats.bestTime || completionTime < stats.bestTime)
    {
      stats.bestTime = completionTime;
      isNewRecord = true;
    }
    
    await store.save(this.getKey(levelId), stats);
    await this.updateProgress(levelId);
    return { isNewRecord, stats };
  }

  static async getGameProgress(): Promise<GameProgress> {
    const progress = await store.get(this.getProgressKey());
    
    return progress || {
      currentLevel: 1,
      completedLevels: [],
      unlockedLevels: [1],
    };
  }

  static async updateProgress(completedLevelId: number): Promise<void> {
    const progress = await this.getGameProgress();
    
    if (!progress.completedLevels.includes(completedLevelId))
    {
      progress.completedLevels.push(completedLevelId);
    }
    
    const nextLevel = completedLevelId + 1;
    if (!progress.unlockedLevels.includes(nextLevel))
    {
      progress.unlockedLevels.push(nextLevel);
    }
    
    progress.currentLevel = this.getNextUncompletedLevel(progress);
    
    await store.save(this.getProgressKey(), progress);
  }

  static async setCurrentLevel(levelId: number): Promise<void> {
    const progress = await this.getGameProgress();
    progress.currentLevel = levelId;
    await store.save(this.getProgressKey(), progress);
  }

  private static getNextUncompletedLevel(progress: GameProgress): number {
    const uncompletedLevels = progress.unlockedLevels.filter(
      level => !progress.completedLevels.includes(level)
    );
    
    return uncompletedLevels.length > 0 ? Math.min(...uncompletedLevels) : progress.currentLevel;
  }

  static async getStartLevel(): Promise<number> {
    const progress = await this.getGameProgress();
    return progress.currentLevel;
  }

  static async isLevelUnlocked(levelId: number): Promise<boolean> {
    const progress = await this.getGameProgress();
    return progress.unlockedLevels.includes(levelId);
  }

  private static getCompletionsKey(levelId: number): string {
    return `completions_level_${levelId}`;
  }

  static async recordCompletionWithDetails(
    levelId: number,
    completionTime: number,
    petId: string,
    petName: string,
    petEmoji: string,
    attempts: number,
    deaths: number,
    gyroMode: string
  ): Promise<{ isNewRecord: boolean; stats: LevelStats }> {
  
    const result = await this.recordCompletion(levelId, completionTime);
      
    const completionRecord: CompletionRecord = {
      levelId,
      petId,
      petName,
      petEmoji,
      completionTime,
      attempts,
      deaths,
      timestamp: Date.now(),
      gyroMode
    };
      
    const key = this.getCompletionsKey(levelId);
    const existingCompletions = await store.get(key);
    const completions: CompletionRecord[] = existingCompletions || [];
      
    completions.push(completionRecord);
      
    const sortedCompletions = completions.sort((a, b) => a.completionTime - b.completionTime);
      
    await store.save(key, sortedCompletions);
      
    return result;
  }

  static async getTopCompletions(levelId: number, limit: number = 10, gyroMode?: string): Promise<CompletionRecord[]> {
  
    const key = this.getCompletionsKey(levelId);
    const completions = await store.get(key);
      
    if (!completions) return [];

    let filteredCompletions = completions;
    if (gyroMode)
    {
      filteredCompletions = completions.filter((completion: CompletionRecord) => completion.gyroMode === gyroMode);
    }
    return filteredCompletions
      .sort((a: CompletionRecord, b: CompletionRecord) => a.completionTime - b.completionTime)
      .slice(0, limit);
  }
  
  static async getPetCompletions(levelId: number, petId: string, gyroMode?: string): Promise<CompletionRecord[]> {
  const key = this.getCompletionsKey(levelId);
  const completions = await store.get(key);
  
  if (!completions) return [];
  
  let filteredCompletions = completions.filter(
    (completion: CompletionRecord) => completion.petId === petId
  );
  
  if (gyroMode)
  {
    filteredCompletions = filteredCompletions.filter((completion: CompletionRecord) => completion.gyroMode === gyroMode);
  }
  return completions.filter((completion: CompletionRecord) => completion.petId === petId);
}

static async clearAllData(): Promise<void> {
  try {
    // Get all keys first
    const keys = await store.keys();
    console.log('Found keys:', keys);
    
    // Delete each key individually
    for (const key of keys) {
      await store.delete(key);
      console.log('Deleted key:', key);
    }
    
    console.log('All game data cleared successfully');
  } catch (error) {
    console.error('Error clearing game data:', error);
  }
}
}