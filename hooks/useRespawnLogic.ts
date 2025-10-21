import { useCallback, useRef, useState } from 'react';

interface PositionHistory {
  x: number;
  y: number;
  cellX: number;
  cellY: number;
}

interface EnemyPosition {
  id: string;
  x: number;
  y: number;
}

export function useRespawnLogic(cellSize: number, ballSize: number) {
  const [positionHistory, setPositionHistory] = useState<PositionHistory[]>([]);
  const lastRecordedCell = useRef<{cellX: number, cellY: number} | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const UPDATE_THROTTLE = 50; // Only update every 50ms

  const recordPosition = useCallback((x: number, y: number, cellSize: number) => {
    const now = Date.now();
    
    // Throttle updates
    if (now - lastUpdateTime.current < UPDATE_THROTTLE) {
      return;
    }
    
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    
    // Only record when we've moved to a completely new cell
    if (!lastRecordedCell.current || 
        lastRecordedCell.current.cellX !== cellX || 
        lastRecordedCell.current.cellY !== cellY) {
      
      lastRecordedCell.current = { cellX, cellY };
      lastUpdateTime.current = now;
      
      setPositionHistory(prev => {
        const newHistory = [...prev, { x, y, cellX, cellY }];
        return newHistory.slice(-4); // Keep only last 4 positions
      });
    }
  }, [UPDATE_THROTTLE]);

  const isCellOccupiedByEnemy = useCallback((
    cellX: number, 
    cellY: number, 
    enemyPositions: EnemyPosition[]
  ): boolean => {
    const cellCenterX = cellX * cellSize + cellSize / 2;
    const cellCenterY = cellY * cellSize + cellSize / 2;
    const checkRadius = cellSize / 2;
    
    for (const enemy of enemyPositions) {
      const dx = cellCenterX - enemy.x;
      const dy = cellCenterY - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < checkRadius + ballSize) {
        return true;
      }
    }
    return false;
  }, [cellSize, ballSize]);

  const findSafeRespawnPosition = useCallback((
    deathCellX: number,
    deathCellY: number,
    enemyPositions: EnemyPosition[]
  ): { x: number; y: number } | null => {
    
    // Check history positions in reverse order (skip last one which is death cell)
    for (let i = positionHistory.length - 2; i >= 0; i--) {
      const historyPos = positionHistory[i];
      
      if (!isCellOccupiedByEnemy(historyPos.cellX, historyPos.cellY, enemyPositions)) {
        return {
          x: historyPos.cellX * cellSize + cellSize / 2,
          y: historyPos.cellY * cellSize + cellSize / 2
        };
      }
    }
    
    return null;
  }, [positionHistory, isCellOccupiedByEnemy, cellSize]);

  const clearHistory = useCallback(() => {
    setPositionHistory([]);
    lastRecordedCell.current = null;
    lastUpdateTime.current = 0;
  }, []);

  return {
    positionHistory,
    recordPosition,
    findSafeRespawnPosition,
    clearHistory
  };
}