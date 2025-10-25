import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { accelDataAtom, gyroDataAtom, subscribeAccelAtom, subscribeGyroAtom, SensorData } from '../atoms/sensorAtoms';

export enum GyroMode {
  NORMAL = 'normal',
  CHAOS = 'chaos'
}

interface UseGameSensorsReturn {
  accelData: SensorData;
  gyroData: SensorData;
}

export const useGameSensors = (gyroMode: GyroMode, isActive: boolean): UseGameSensorsReturn => {
  const [accelData] = useAtom(accelDataAtom);
  const [gyroData] = useAtom(gyroDataAtom);
  const subscribeAccel = useSetAtom(subscribeAccelAtom);
  const subscribeGyro = useSetAtom(subscribeGyroAtom);

  useEffect(() => {
    if (!isActive) return;

    let unsubscribe: (() => void) | null = null;

    if (gyroMode === GyroMode.NORMAL){ unsubscribe = subscribeAccel();}
    else { unsubscribe = subscribeGyro();}

    return () => {
      unsubscribe?.();
    };
  }, [gyroMode, isActive]);

  return { accelData, gyroData };
};