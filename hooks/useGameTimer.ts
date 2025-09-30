import { useEffect, useRef, useState } from 'react';

export const useGameTimer = (isActive: boolean) => {
  const [gameTime, setGameTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    const now = Date.now();
    setStartTime(now);
    setGameTime(0);
    setPausedAt(null);
  };

  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setPausedAt(gameTime);
  };

  const resumeTimer = () => {
    const now = Date.now();
    if (pausedAt !== null) {
      const adjustedStartTime = now - pausedAt;
      setStartTime(now - pausedAt);
      setPausedAt(null);
    }
  };

  const stopTimer = () => {
    if (intervalRef.current)
    {
      clearInterval(intervalRef.current);
    }
    return gameTime;
  };

  const resetTimer = () => {
    setGameTime(0);
    setStartTime(null);
    if (intervalRef.current)
    {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {

    if (isActive && startTime && pausedAt === null)
    {
      intervalRef.current = setInterval(() => { setGameTime(Date.now() - startTime);}, 100);
    }
    else
    {
      if (intervalRef.current)
      {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current)
      {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, startTime]);

  return {
    gameTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer
  };
};