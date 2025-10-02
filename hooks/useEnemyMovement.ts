import { useEffect, useRef, useState } from 'react';
import { Enemy } from '../data/maze-layouts';

interface EnemyPosition {
  id: string;
  x: number;
  y: number;
}

export function useEnemyMovement(enemies: Enemy[] | undefined, cellSize: number, isGameActive: boolean) {

  const [enemyPositions, setEnemyPositions] = useState<EnemyPosition[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const progressRef = useRef<Map<string, number>>(new Map());
  const directionRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!enemies)
    {
      setEnemyPositions([]);
      progressRef.current.clear();
      directionRef.current.clear();
      return;
    }

    setEnemyPositions(
      enemies.map(enemy => ({
        id: enemy.id,
        x: enemy.path[0].x * cellSize + cellSize / 2,
        y: enemy.path[0].y * cellSize + cellSize / 2
      }))
    );

    enemies.forEach(enemy => {
      progressRef.current.set(enemy.id, 0);
      directionRef.current.set(enemy.id, 1);
    });
  }, [enemies, cellSize]);

  useEffect(() => {

    if (!enemies || !isGameActive) return;

    lastUpdateRef.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      setEnemyPositions(prev =>
        prev.map(pos => {

          const enemy = enemies.find(e => e.id === pos.id);

          if (!enemy || enemy.path.length < 2) return pos;

          let progress = progressRef.current.get(enemy.id) || 0;
          let direction = directionRef.current.get(enemy.id) || 1;

          const totalSegments = enemy.path.length - 1;
          const currentSegment = Math.floor(progress);
          const nextSegment = currentSegment + 1;

          const segmentStart = Math.min(currentSegment, totalSegments - 1);
          const segmentEnd = Math.min(nextSegment, totalSegments);

          const start = enemy.path[segmentStart];
          const end = enemy.path[segmentEnd];

          // Calculate distance to move
          const dx = (end.x - start.x) * cellSize;
          const dy = (end.y - start.y) * cellSize;
          const segmentDistance = Math.sqrt(dx * dx + dy * dy);

          if (segmentDistance > 0)
          {
            const moveDistance = enemy.speed * cellSize * deltaTime;
            const progressIncrement = (moveDistance / segmentDistance) * direction;
            progress += progressIncrement;
          }

          // Reverse at path boundaries
          if (progress >= totalSegments)
          {
            progress = totalSegments;
            direction = -1;
          }
          else if (progress <= 0)
          {
            progress = 0;
            direction = 1;
          }

          progressRef.current.set(enemy.id, progress);
          directionRef.current.set(enemy.id, direction);

          const t = progress - segmentStart;
          const newX = start.x * cellSize + dx * t + cellSize / 2;
          const newY = start.y * cellSize + dy * t + cellSize / 2;

          return { id: pos.id, x: newX, y: newY };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enemies, cellSize, isGameActive]);

  return enemyPositions;
}