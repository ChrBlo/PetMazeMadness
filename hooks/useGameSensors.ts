import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { accelDataAtom, gyroDataAtom, subscribeAccelAtom, subscribeGyroAtom } from '../atoms/sensorAtoms';

export enum GyroMode {
  NORMAL = 'normal',
  CHAOS = 'chaos'
}

interface SensorData {
  x: number;
  y: number;
  z: number;
}

interface UseGameSensorsReturn {
  accelData: SensorData;
  gyroData: SensorData;
}

export const useGameSensors = (gyroMode: GyroMode): UseGameSensorsReturn => {
  const [accelData] = useAtom(accelDataAtom);
  const [gyroData] = useAtom(gyroDataAtom);
  const subscribeAccel = useSetAtom(subscribeAccelAtom);
  const subscribeGyro = useSetAtom(subscribeGyroAtom);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (gyroMode === GyroMode.NORMAL) {
      unsubscribe = subscribeAccel();
    } else {
      unsubscribe = subscribeGyro();
    }

    return () => {
      unsubscribe?.();
    };
  }, [gyroMode]);

  return { accelData, gyroData };
};