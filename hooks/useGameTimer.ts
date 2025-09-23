import { useEffect, useRef, useState } from 'react';

export const useGameTimer = (isActive: boolean) => {
  const [gameTime, setGameTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    const now = Date.now();
    setStartTime(now);
    setGameTime(0);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return gameTime;
  };

  const resetTimer = () => {
    setGameTime(0);
    setStartTime(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isActive && startTime) {
      intervalRef.current = setInterval(() => {
        setGameTime(Date.now() - startTime);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, startTime]);

  const formatTime = (timeMs: number) => `${(timeMs / 1000).toFixed(1)}s`;

  return {
    gameTime,
    formatTime,
    startTimer,
    stopTimer,
    resetTimer
  };
};