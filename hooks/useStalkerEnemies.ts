import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef, useCallback } from 'react';
import { StalkerEnemy } from '../data/maze-layouts';

interface StalkerEnemyState {
  id: string;
  x: number;
  y: number;
  isTriggered: boolean;
  isActivated: boolean;
  opacity: number;
  currentPathIndex: number;
}

const warningSound = require('../assets/sounds/warning.mp3');
const ghoulSound = require('../assets/sounds/ghoul.mp3');
export const useStalkerEnemies = (
  stalkers: StalkerEnemy[],
  cellSize: number,
  ballPosition: { x: number; y: number },
  isGameActive: boolean
) => {

  const stalkerStatesRef = useRef<Map<string, StalkerEnemyState>>(new Map());
  const playerPathRef = useRef<{ x: number; y: number }[]>([]);
  const lastPlayerCellRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());
  
  const warning = useAudioPlayer(warningSound);
  const ghoul = useAudioPlayer(ghoulSound);

  // Extracted initialization function
  const initializeStalkers = useCallback(() => {
    const newStates = new Map<string, StalkerEnemyState>();
    
    stalkers.forEach(stalker => {
      newStates.set(stalker.id, {
        id: stalker.id,
        x: stalker.startCell.x * cellSize + cellSize / 2,
        y: stalker.startCell.y * cellSize + cellSize / 2,
        isTriggered: false,
        isActivated: false,
        opacity: 0,
        currentPathIndex: 0
      });
    });
    
    stalkerStatesRef.current = newStates;
    playerPathRef.current = [];
    lastPlayerCellRef.current = null;
  }, [stalkers, cellSize]);

  // Initialize stalker positions
  useEffect(() => {
    initializeStalkers();
  }, [initializeStalkers]);

  // Track player's path (cell by cell)
  useEffect(() => {
    if (!isGameActive) return;
    const currentCellX = Math.floor(ballPosition.x / cellSize);
    const currentCellY = Math.floor(ballPosition.y / cellSize);
    
    const lastCell = lastPlayerCellRef.current;
    
    // Only add if player moved to a NEW cell
    if (!lastCell || lastCell.x !== currentCellX || lastCell.y !== currentCellY) {
      lastPlayerCellRef.current = { x: currentCellX, y: currentCellY };
      
      // Add to path
      playerPathRef.current.push({ x: currentCellX, y: currentCellY });
      
      // Check for trigger
      stalkers.forEach(stalker => {
        const state = stalkerStatesRef.current.get(stalker.id);
        if (state && !state.isTriggered) {
          if (currentCellX === stalker.triggerCell.x && currentCellY === stalker.triggerCell.y) {
            stalkerStatesRef.current.set(stalker.id, {
              ...state,
              isTriggered: true
            });
              
            // Play warning sound when trigger cell is passed
            warning.seekTo(0);
            warning.play();
          }
        }
      });
    }
  }, [ballPosition, cellSize, isGameActive, stalkers, warning]);

  // Check distance from TRIGGER CELL for activation (3 cells away)
  useEffect(() => {
    if (!isGameActive) return;
    let stateChanged = false;
    stalkers.forEach(stalker => {
      const state = stalkerStatesRef.current.get(stalker.id);
      if (state && state.isTriggered && !state.isActivated) {
        // Calculate distance from player to TRIGGER CELL
        const triggerX = stalker.triggerCell.x * cellSize + cellSize / 2;
        const triggerY = stalker.triggerCell.y * cellSize + cellSize / 2;
        
        const dx = ballPosition.x - triggerX;
        const dy = ballPosition.y - triggerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const cellDistance = distance / cellSize;
        const proximityThreshold = 3;
        if (cellDistance >= proximityThreshold) {
          // Start following from current position in path (not from beginning!)
          const currentPathIndex = Math.max(0, playerPathRef.current.length - 1);
          
          stalkerStatesRef.current.set(stalker.id, {
            ...state,
            isActivated: true,
            opacity: 0,
            currentPathIndex: currentPathIndex
          });
          stateChanged = true;
          
          // Play ghoul sound when stalker activates
          ghoul.seekTo(0);
          ghoul.play();
        }
      }
    });
  }, [ballPosition, cellSize, isGameActive, stalkers, ghoul]);

  const updateStalker = useCallback((
    stalker: StalkerEnemy,
    state: StalkerEnemyState,
    deltaTime: number
  ): StalkerEnemyState => {
    // Fade in opacity when activated (adjusted for milliseconds)
    let newOpacity = state.opacity;
    
    if (state.isActivated && state.opacity < 1) {
      newOpacity = Math.min(1, state.opacity + (deltaTime * 0.001));
    }
    // Don't move if not activated yet
    if (!state.isActivated) {
      return {
        ...state,
        opacity: newOpacity
      };
    }
    const playerPath = playerPathRef.current;
    
    // No path to follow yet
    if (playerPath.length === 0 || state.currentPathIndex >= playerPath.length)
    {
      return {
        ...state,
        opacity: newOpacity
      };
    }

    // Get target cell (center of the cell)
    const targetCell = playerPath[state.currentPathIndex];
    const targetX = targetCell.x * cellSize + cellSize / 2;
    const targetY = targetCell.y * cellSize + cellSize / 2;
    const dx = targetX - state.x;
    const dy = targetY - state.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Reached this cell, move to next
    if (distance < 1)
    {
      return {
        ...state,
        x: targetX,
        y: targetY,
        currentPathIndex: state.currentPathIndex + 1,
        opacity: newOpacity
      };
    }

    // Move towards target cell center
    const moveDistance = stalker.speed;
    const moveX = (dx / distance) * moveDistance;
    const moveY = (dy / distance) * moveDistance;

    return {
      ...state,
      x: state.x + moveX,
      y: state.y + moveY,
      opacity: newOpacity
    };
  }, [cellSize]);

  const updateStalkers = useCallback(() => {

    if (!isGameActive) return;

    const now = Date.now();
    const deltaTime = Math.min(now - lastUpdateRef.current, 100);
    lastUpdateRef.current = now;

    stalkers.forEach(stalker => {
      const currentState = stalkerStatesRef.current.get(stalker.id);
      if (currentState)
      {
        const newState = updateStalker(stalker, currentState, deltaTime);
        stalkerStatesRef.current.set(stalker.id, newState);
      }
    });

    animationFrameRef.current = requestAnimationFrame(updateStalkers);

  }, [isGameActive, stalkers, updateStalker]);

  useEffect(() => {

    if (isGameActive)
    {
      lastUpdateRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateStalkers);
    }

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameActive, updateStalkers]);

  const getStalkerPositions = () => {
    return Array.from(stalkerStatesRef.current.values()).map(state => ({
      id: state.id,
      x: state.x,
      y: state.y,
      isTriggered: state.isTriggered,
      isActivated: state.isActivated,
      opacity: state.opacity
    }));
  };

  const resetStalkers = initializeStalkers;

  return { getStalkerPositions, resetStalkers };
};
