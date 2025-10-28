// import { useAudioPlayer } from 'expo-audio';
// import { useEffect, useRef } from 'react';
// import { StalkerEnemy } from '../data/maze-layouts';

// interface StalkerEnemyState {
//   id: string;
//   x: number;
//   y: number;
//   isTriggered: boolean;
//   isActivated: boolean;
//   opacity: number;
// }

// const warningSound = require('../assets/sounds/warning.mp3');
// const ghoulSound = require('../assets/sounds/ghoul.mp3');

// export const useStalkerEnemies = (
//   stalkers: StalkerEnemy[],
//   cellSize: number,
//   ballPosition: { x: number; y: number },
//   isGameActive: boolean
// ) => {
//   const stalkerStatesRef = useRef<Map<string, StalkerEnemyState>>(new Map());
//   const lastPlayerCellRef = useRef<{ x: number; y: number } | null>(null);
//   const animationFrameRef = useRef<number | undefined>(undefined);
//   const lastUpdateRef = useRef<number>(Date.now());
  
//   const warning = useAudioPlayer(warningSound);
//   const ghoul = useAudioPlayer(ghoulSound);

//   // Initialize stalker positions
//   useEffect(() => {
//     const newStates = new Map<string, StalkerEnemyState>();
    
//     stalkers.forEach(stalker => {
//       newStates.set(stalker.id, {
//         id: stalker.id,
//         x: stalker.startCell.x * cellSize + cellSize / 2,
//         y: stalker.startCell.y * cellSize + cellSize / 2,
//         isTriggered: false,
//         isActivated: false,
//         opacity: 0
//       });
//     });
    
//     stalkerStatesRef.current = newStates;
//     lastPlayerCellRef.current = null;
//   }, [stalkers, cellSize]);

//   // Track player's cell and check for TRIGGER CELL
//   useEffect(() => {
//     if (!isGameActive) return;

//     const currentCellX = Math.floor(ballPosition.x / cellSize);
//     const currentCellY = Math.floor(ballPosition.y / cellSize);
    
//     const lastCell = lastPlayerCellRef.current;
    
//     if (!lastCell || lastCell.x !== currentCellX || lastCell.y !== currentCellY) {
//       lastPlayerCellRef.current = { x: currentCellX, y: currentCellY };
      
//       const newStates = new Map(stalkerStatesRef.current);
      
//       stalkers.forEach(stalker => {
//         const state = newStates.get(stalker.id);
//         if (state && !state.isTriggered) {
//           if (currentCellX === stalker.triggerCell.x && currentCellY === stalker.triggerCell.y) {
//             newStates.set(stalker.id, {
//               ...state,
//               isTriggered: true
//             });
              
//             // Play warning sound when trigger cell is passed
//             warning.seekTo(0);
//             warning.play();
//           }
//         }
//       });
      
//       stalkerStatesRef.current = newStates;
//     }
//   }, [ballPosition, cellSize, isGameActive, stalkers, warning]);

//   // Check distance from TRIGGER CELL for activation (3 cells away)
//   useEffect(() => {
//     if (!isGameActive) return;

//     const newStates = new Map(stalkerStatesRef.current);
//     let stateChanged = false;

//     stalkers.forEach(stalker => {
//       const state = newStates.get(stalker.id);
//       if (state && state.isTriggered && !state.isActivated) {
//         // Calculate distance from player to TRIGGER CELL (not start cell!)
//         const triggerX = stalker.triggerCell.x * cellSize + cellSize / 2;
//         const triggerY = stalker.triggerCell.y * cellSize + cellSize / 2;
        
//         const dx = ballPosition.x - triggerX;
//         const dy = ballPosition.y - triggerY;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//         const cellDistance = distance / cellSize;

//         const proximityThreshold = 3; // Activate when 3 cells AWAY from trigger
//         if (cellDistance >= proximityThreshold) {
//           newStates.set(stalker.id, {
//             ...state,
//             isActivated: true,
//             opacity: 0
//           });
//           stateChanged = true;
          
//           // Play ghoul sound when stalker activates
//           ghoul.seekTo(0);
//           ghoul.play();
//         }
//       }
//     });

//     if (stateChanged) {
//       stalkerStatesRef.current = newStates;
//     }
//   }, [ballPosition, cellSize, isGameActive, stalkers, ghoul]);

//   const updateStalker = (
//     stalker: StalkerEnemy,
//     state: StalkerEnemyState,
//     deltaTime: number,
//     playerPosition: { x: number; y: number }
//   ): StalkerEnemyState => {
//     // Fade in opacity when activated
//     let newOpacity = state.opacity;
//     if (state.isActivated && state.opacity < 1) {
//       newOpacity = Math.min(1, state.opacity + (deltaTime * 0.05));
//     }

//     // Don't move if not activated yet
//     if (!state.isActivated) {
//       return {
//         ...state,
//         opacity: newOpacity
//       };
//     }

//     // Chase the player's current position directly
//     const dx = playerPosition.x - state.x;
//     const dy = playerPosition.y - state.y;
//     const distance = Math.sqrt(dx * dx + dy * dy);

//     // If very close, don't move (collision detection will handle)
//     if (distance < 2) {
//       return {
//         ...state,
//         opacity: newOpacity
//       };
//     }

//     // Move directly towards player
//     const moveDistance = stalker.speed * deltaTime;
//     const moveX = (dx / distance) * moveDistance;
//     const moveY = (dy / distance) * moveDistance;

//     return {
//       ...state,
//       x: state.x + moveX,
//       y: state.y + moveY,
//       opacity: newOpacity
//     };
//   };

//   const updateStalkers = () => {
//     if (!isGameActive) return;

//     const now = Date.now();
//     const deltaTime = (now - lastUpdateRef.current) / 16.67;
//     lastUpdateRef.current = now;

//     const newStates = new Map<string, StalkerEnemyState>();

//     stalkers.forEach(stalker => {
//       const currentState = stalkerStatesRef.current.get(stalker.id);
//       if (currentState) {
//         const newState = updateStalker(stalker, currentState, deltaTime, ballPosition);
//         newStates.set(stalker.id, newState);
//       }
//     });

//     stalkerStatesRef.current = newStates;
//     animationFrameRef.current = requestAnimationFrame(updateStalkers);
//   };

//   useEffect(() => {
//     if (isGameActive) {
//       lastUpdateRef.current = Date.now();
//       animationFrameRef.current = requestAnimationFrame(updateStalkers);
//     }

//     return () => {
//       if (animationFrameRef.current !== undefined) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }
//     };
//   }, [isGameActive, stalkers, ballPosition]);

//   const getStalkerPositions = () => {
//     return Array.from(stalkerStatesRef.current.values()).map(state => ({
//       id: state.id,
//       x: state.x,
//       y: state.y,
//       isTriggered: state.isTriggered,
//       isActivated: state.isActivated,
//       opacity: state.opacity
//     }));
//   };

//   const resetStalkers = () => {
//     const newStates = new Map<string, StalkerEnemyState>();
    
//     stalkers.forEach(stalker => {
//       newStates.set(stalker.id, {
//         id: stalker.id,
//         x: stalker.startCell.x * cellSize + cellSize / 2,
//         y: stalker.startCell.y * cellSize + cellSize / 2,
//         isTriggered: false,
//         isActivated: false,
//         opacity: 0
//       });
//     });
    
//     stalkerStatesRef.current = newStates;
//     lastPlayerCellRef.current = null;
//   };

//   return { getStalkerPositions, resetStalkers };
// };

import { useAudioPlayer } from 'expo-audio';
import { useEffect, useRef } from 'react';
import { StalkerEnemy } from '../data/maze-layouts';

interface StalkerEnemyState {
  id: string;
  x: number;
  y: number;
  isTriggered: boolean;
  isActivated: boolean;
  opacity: number;
  currentPathIndex: number; // Track which cell in path they're moving to
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
  const playerPathRef = useRef<{ x: number; y: number }[]>([]); // Store player's path
  const lastPlayerCellRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(Date.now());
  
  const warning = useAudioPlayer(warningSound);
  const ghoul = useAudioPlayer(ghoulSound);

  // Initialize stalker positions
  useEffect(() => {
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
      playerPathRef.current = [...playerPathRef.current, { x: currentCellX, y: currentCellY }];
      
      // Check for trigger
      const newStates = new Map(stalkerStatesRef.current);
      
      stalkers.forEach(stalker => {
        const state = newStates.get(stalker.id);
        if (state && !state.isTriggered) {
          if (currentCellX === stalker.triggerCell.x && currentCellY === stalker.triggerCell.y) {
            newStates.set(stalker.id, {
              ...state,
              isTriggered: true
            });
              
            // Play warning sound when trigger cell is passed
            warning.seekTo(0);
            warning.play();
          }
        }
      });
      
      stalkerStatesRef.current = newStates;
    }
  }, [ballPosition, cellSize, isGameActive, stalkers, warning]);

  // Check distance from TRIGGER CELL for activation (3 cells away)
  useEffect(() => {
    if (!isGameActive) return;

    const newStates = new Map(stalkerStatesRef.current);
    let stateChanged = false;

    stalkers.forEach(stalker => {
      const state = newStates.get(stalker.id);
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
          
          newStates.set(stalker.id, {
            ...state,
            isActivated: true,
            opacity: 0,
            currentPathIndex: currentPathIndex // Start from where player is NOW
          });
          stateChanged = true;
          
          // Play ghoul sound when stalker activates
          ghoul.seekTo(0);
          ghoul.play();
        }
      }
    });

    if (stateChanged) {
      stalkerStatesRef.current = newStates;
    }
  }, [ballPosition, cellSize, isGameActive, stalkers, ghoul]);

  const updateStalker = (
    stalker: StalkerEnemy,
    state: StalkerEnemyState,
    deltaTime: number
  ): StalkerEnemyState => {
    // Fade in opacity when activated
    let newOpacity = state.opacity;
    if (state.isActivated && state.opacity < 1) {
      newOpacity = Math.min(1, state.opacity + (deltaTime * 0.05));
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
    if (playerPath.length === 0 || state.currentPathIndex >= playerPath.length) {
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
    if (distance < 3) {
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
  };

  const updateStalkers = () => {
    if (!isGameActive) return;

    const now = Date.now();
    const deltaTime = (now - lastUpdateRef.current) / 16.67;
    lastUpdateRef.current = now;

    const newStates = new Map<string, StalkerEnemyState>();

    stalkers.forEach(stalker => {
      const currentState = stalkerStatesRef.current.get(stalker.id);
      if (currentState) {
        const newState = updateStalker(stalker, currentState, deltaTime);
        newStates.set(stalker.id, newState);
      }
    });

    stalkerStatesRef.current = newStates;
    animationFrameRef.current = requestAnimationFrame(updateStalkers);
  };

  useEffect(() => {
    if (isGameActive) {
      lastUpdateRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(updateStalkers);
    }

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameActive, stalkers]);

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

  const resetStalkers = () => {
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
  };

  return { getStalkerPositions, resetStalkers };
};