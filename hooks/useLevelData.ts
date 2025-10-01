import { useEffect, useState } from "react";
import { CRUDManager } from "../utils/CRUD-manager";
import { LevelStars, LevelStats, ScoreManager } from "../utils/score-manager";
import { GyroMode } from "./useGameSensors";

interface UseLevelDataReturn {
  levelStats: LevelStats | null;
  levelStarsData: LevelStars['stars'] | null;
  eatenSnacks: Set<string>;
  normalModeCompleted: boolean;
  chaosModeCompleted: boolean;
  setLevelStats: React.Dispatch<React.SetStateAction<LevelStats | null>>;
  setEatenSnacks: React.Dispatch<React.SetStateAction<Set<string>>>;
  setLevelStarsData: React.Dispatch<React.SetStateAction<LevelStars['stars'] | null>>;
  setNormalModeCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  setChaosModeCompleted: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useLevelData(currentLevelId: number): UseLevelDataReturn {

  const [levelStats, setLevelStats] = useState<LevelStats | null>(null);
  const [levelStarsData, setLevelStarsData] = useState<LevelStars['stars'] | null>(null);
  const [eatenSnacks, setEatenSnacks] = useState<Set<string>>(new Set());
  const [normalModeCompleted, setNormalModeCompleted] = useState(false);
  const [chaosModeCompleted, setChaosModeCompleted] = useState(false);

  useEffect(() => {
    const loadLevelData = async () => {
      const stats = await ScoreManager.getLevelStats(currentLevelId);
      setLevelStats(stats);
      
      const savedSnacks = await CRUDManager.getEatenSnacks(currentLevelId);
      setEatenSnacks(new Set(savedSnacks));

      const stars = await CRUDManager.getLevelStars(currentLevelId);
      setLevelStarsData(stars);

      const completions = await ScoreManager.getTopCompletions(currentLevelId, 100);
      const hasNormalComplete = completions.some(c => c.gyroMode === GyroMode.NORMAL.toString());
      const hasKaosComplete = completions.some(c => c.gyroMode === GyroMode.CHAOS.toString());
      
      setNormalModeCompleted(hasNormalComplete);
      setChaosModeCompleted(hasKaosComplete);
    };
    
    loadLevelData();
  }, [currentLevelId]);

  return {
    levelStats,
    levelStarsData,
    eatenSnacks,
    normalModeCompleted,
    chaosModeCompleted,
    setLevelStats,
    setEatenSnacks,
    setLevelStarsData,
    setNormalModeCompleted,
    setChaosModeCompleted
  };
}