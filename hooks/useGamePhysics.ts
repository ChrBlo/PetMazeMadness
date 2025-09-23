import { useEffect, useRef, useState } from 'react';
import { GyroMode } from './useGameSensors';

interface SensorData {
  x: number;
  y: number;
  z: number;
}

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface UseGamePhysicsProps {
  gyroMode: GyroMode;
  accelData: SensorData;
  gyroData: SensorData;
  checkCollision: (x: number, y: number) => boolean;
  isGameWon: boolean;
  isDead: boolean;
  initialPosition: Position;
}

interface UseGamePhysicsReturn {
  ballPosition: Position;
  setBallPosition: (position: Position | ((prev: Position) => Position)) => void;
  velocity: Velocity;
  setVelocity: (velocity: Velocity) => void;
  resetPosition: () => void;
}

export const useGamePhysics = ({gyroMode, accelData, gyroData, checkCollision, isGameWon, isDead, initialPosition}: UseGamePhysicsProps): UseGamePhysicsReturn => {
  
  const [ballPosition, setBallPosition] = useState<Position>(initialPosition);
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  const resetPosition = () => {
    setBallPosition(initialPosition);
    setVelocity({ x: 0, y: 0 });
  };

  const updateBallPosition = () => {
    setBallPosition(prevPosition => {
      let newVelX = velocity.x;
      let newVelY = velocity.y;

      if (gyroMode === GyroMode.NORMAL) {
        const gravity = 1.2;
        const friction = 0.9;
        const maxSpeed = 20;

        newVelX += accelData.x * gravity;
        newVelY += -accelData.y * gravity;

        newVelX *= friction;
        newVelY *= friction;

        newVelX = Math.max(-maxSpeed, Math.min(maxSpeed, newVelX));
        newVelY = Math.max(-maxSpeed, Math.min(maxSpeed, newVelY));

        const newX = prevPosition.x + newVelX;
        const newY = prevPosition.y + newVelY;

        let finalX = newX;
        let finalY = newY;

        if (checkCollision(newX, prevPosition.y)) {
          finalX = prevPosition.x;
          newVelX = 0;
        }
        if (checkCollision(prevPosition.x, newY)) {
          finalY = prevPosition.y;
          newVelY = 0;
        }

        setVelocity({ x: newVelX, y: newVelY });
        return { x: finalX, y: finalY };
      }
      else
      {
        const gravity = 0.6;
        const friction = 0.80;

        let velX = gyroData.y * gravity;
        let velY = gyroData.x * gravity;

        velX *= friction;
        velY *= friction;

        const newX = prevPosition.x + velX;
        const newY = prevPosition.y + velY;

        if (!checkCollision(newX, newY)) return { x: newX, y: newY };
        else if (!checkCollision(newX, prevPosition.y)) return { x: newX, y: prevPosition.y };
        else if (!checkCollision(prevPosition.x, newY)) return { x: prevPosition.x, y: newY };

        return prevPosition;
      }
    });

    animationRef.current = requestAnimationFrame(updateBallPosition);
  };

  useEffect(() => {
    if (!isGameWon && !isDead) {
      animationRef.current = requestAnimationFrame(updateBallPosition);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gyroMode, accelData, gyroData, ballPosition, isGameWon, isDead, velocity]);

  return {
    ballPosition,
    setBallPosition,
    velocity,
    setVelocity,
    resetPosition
  };
};