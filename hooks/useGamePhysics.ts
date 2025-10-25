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
  inverted?: boolean;
}

interface UseGamePhysicsReturn {
  ballPosition: Position;
  setBallPosition: (position: Position | ((prev: Position) => Position)) => void;
  velocity: Velocity;
  setVelocity: (velocity: Velocity) => void;
  resetPosition: () => void;
}

export const useGamePhysics = ({gyroMode, accelData, gyroData, checkCollision, isGameWon, isDead, initialPosition, inverted = false}: UseGamePhysicsProps): UseGamePhysicsReturn => {
  
  const [ballPosition, setBallPosition] = useState<Position>(initialPosition);
  const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  
  // Use refs to access latest values without triggering re-renders
  const velocityRef = useRef<Velocity>(velocity);
  const invertedRef = useRef<boolean>(inverted);

  useEffect(() => { velocityRef.current = velocity; }, [velocity]);
  useEffect(() => { invertedRef.current = inverted; }, [inverted]);

  const resetPosition = () => {
    setBallPosition(initialPosition);
    setVelocity({ x: 0, y: 0 });
  };

  const updateBallPosition = () => {

    if (isGameWon || isDead)
    {
      return;
    }
    
    setBallPosition(prevPosition => {
      let newVelX = velocityRef.current.x;
      let newVelY = velocityRef.current.y;

      if (gyroMode === GyroMode.NORMAL) {
        const gravity = 1.2;
        const friction = 0.9;
        const maxSpeed = 20;

        // Apply inversion using ref
        const accelX = invertedRef.current ? -accelData.x : accelData.x;
        const accelY = invertedRef.current ? -accelData.y : accelData.y;

        newVelX += accelX * gravity;
        newVelY += -accelY * gravity;

        newVelX *= friction;
        newVelY *= friction;

        newVelX = Math.max(-maxSpeed, Math.min(maxSpeed, newVelX));
        newVelY = Math.max(-maxSpeed, Math.min(maxSpeed, newVelY));

        const newX = prevPosition.x + newVelX;
        const newY = prevPosition.y + newVelY;

        let finalX = newX;
        let finalY = newY;

        if (checkCollision(newX, prevPosition.y))
        {
          finalX = prevPosition.x;
          newVelX = 0;
        }

        if (checkCollision(prevPosition.x, newY))
        {
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

        // Apply inversion using  ref
        const gyroX = invertedRef.current ? -gyroData.x : gyroData.x;
        const gyroY = invertedRef.current ? -gyroData.y : gyroData.y;

        let velX = gyroY * gravity;
        let velY = gyroX * gravity;

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
    if (!isGameWon && !isDead)
    {
      animationRef.current = requestAnimationFrame(updateBallPosition);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gyroMode, accelData, gyroData, isGameWon, isDead]);

  return {
    ballPosition,
    setBallPosition,
    velocity,
    setVelocity,
    resetPosition
  };
};