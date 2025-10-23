import { atom } from "jotai";
import { ScoreManager } from "../utils/score-manager";
import { getDisplayName } from "../data/pets";

export const isGameWonAtom = atom(false);
export const isDeadAtom = atom(false);

// Action atom for recording win
export const recordWinAtom = atom(null, async (get, set, winData) => {
  
  const isAlreadyWon = get(isGameWonAtom);
  
  if (isAlreadyWon)
  {
    return null;
  }

  set(isGameWonAtom, true);

  const result = await ScoreManager.recordCompletionWithDetails(
    winData.currentLevelId,
    winData.completionTime,
    winData.selectedPet.id,
    getDisplayName(winData.selectedPet),
    winData.selectedPet.emoji,
    winData.currentAttempt,
    winData.totalDeaths || 0,
    winData.extraLivesUsed,
    winData.gyroMode
  );
    
  return result;
});

// Action atom for recording death
export const recordDeathAtom = atom(null, async (get, set, currentLevelId) => {
  
  const isAlreadyDead = get(isDeadAtom);
  
  if (isAlreadyDead)
  {
    return null;
  }

  set(isDeadAtom, true);
  const result = await ScoreManager.recordDeath(currentLevelId);
  
  return result;
});

// Reset atoms
export const resetGameStateAtom = atom(null, (get, set) => {
  set(isGameWonAtom, false);
  set(isDeadAtom, false);
});
