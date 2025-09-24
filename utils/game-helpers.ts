import { MazeLevel } from '../data/maze-layouts';

export const getPosition = (
  level: MazeLevel, 
  mazeSize: number
) => {
  const cellSize = mazeSize / level.layout.length;
  return {
    x: cellSize * (level.startPosition.x + 0.5),
    y: cellSize * (level.startPosition.y + 0.5)
  };
};

export const getMazeCell = (x: number, y: number, mazeLayout: number[][]) => {
  return isPositionWithinMazeBounds(x, y, mazeLayout) ? mazeLayout[y][x] : null;
};

export const isPositionWithinMazeBounds = ( x: number,  y: number,  mazeLayout: number[][]): boolean => {
  return x >= 0 && x < mazeLayout[0].length && y >= 0 && y < mazeLayout.length;
};

export const findNearestSafeCell = (startX: number, startY: number, mazeLayout: number[][], maxRadius: number = 5) => {
  for (let radius = 1; radius < maxRadius; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const checkY = startY + dy;
        const checkX = startX + dx;
        
        if (isPositionWithinMazeBounds(checkX, checkY, mazeLayout) &&
          mazeLayout[checkY][checkX] === 0) {
          return { x: checkX, y: checkY };
        }
      }
    }
  }
  return null;
};