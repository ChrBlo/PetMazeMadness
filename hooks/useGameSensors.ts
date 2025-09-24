import { Accelerometer, Gyroscope } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

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
  const [accelData, setAccelData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const subscriptionRef = useRef<{ sensor: 'accel' | 'gyro', sub: any } | null>(null);
  
  const _subscribeAccel = () => {
    const sub = Accelerometer.addListener(data => {
      setAccelData(data);
    });
    Accelerometer.setUpdateInterval(16); // ~60fps
    subscriptionRef.current = { sensor: 'accel', sub };
  };

  const _subscribeGyro = () => {
    const sub = Gyroscope.addListener(data => {
      setGyroData(data);
    });
    Gyroscope.setUpdateInterval(16); // ~60fps
    subscriptionRef.current = { sensor: 'gyro', sub };
  };

  const _unsubscribe = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.sub.remove();
      subscriptionRef.current = null;
    }
  };

  useEffect(() => {
    _unsubscribe();
    
    if (gyroMode === GyroMode.NORMAL) {
      _subscribeAccel();
    }
    else
    {
      _subscribeGyro();
    }

    return () => {
      _unsubscribe();
    };
  }, [gyroMode]);

  return {
    accelData,
    gyroData
  };
};

