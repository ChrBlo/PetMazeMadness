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